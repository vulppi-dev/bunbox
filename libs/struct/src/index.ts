import {
  ArrayTypes,
  type Bytes,
  type JSCallback,
  type PrimitiveBuffers,
  type PrimitiveLabel,
  type StructSchema,
  type ValueOfSpec,
} from './types'
import {
  calcSchemaLayout,
  cstr,
  getDataViewValue,
  populateValues,
  setDataViewValue,
} from './utils'

export type {
  JSCallback,
  PrimitiveLabel,
  Bytes,
  PtrToPrimitive,
  PtrToStruct,
  PtrToEnum,
  PtrToCallback,
  PropertySpec,
  StructSchema,
  PrimitiveBuffers,
} from './types'
export { cstr } from './utils'

/*
 * MARK: Core Class
 */

export abstract class AbstractStruct<TSchema extends StructSchema> {
  private readonly _schema: TSchema
  private _values: { [K in keyof TSchema]?: ValueOfSpec<TSchema[K], TSchema> }
  private _sizes: { [K in keyof TSchema]: number }
  private _offsets: { [K in keyof TSchema]: number }
  private _retained: { [K in keyof TSchema]: Uint8Array | Uint8Array[] }
  private _isOverlay: boolean

  private _buffer: DataView
  private _u8: Uint8Array
  private _size: number
  private _alignment: number
  private _proxy: {
    [K in keyof TSchema]: ValueOfSpec<TSchema[K], TSchema>
  }

  /**
   * @param schema Struct schema
   * @param isOverlay When true, behaves like a C union (all fields at offset 0, size = max(field))
   * @param pack Optional pack(N) like #pragma pack; limits field alignment to min(natural, N)
   */
  constructor(schema: TSchema, isOverlay = false) {
    if (!schema || Object.keys(schema).length === 0) {
      throw new Error('Invalid struct schema')
    }
    const orderValidation = new Set<number>()
    for (const spec of Object.values(schema)) {
      if (spec.order != null) {
        if (orderValidation.has(spec.order)) {
          throw new Error(`Duplicate order found: ${spec.order}`)
        }
        orderValidation.add(spec.order)
      } else {
        throw new Error('Missing order for schema property')
      }
    }

    this._isOverlay = isOverlay
    this._values = Object.create(null)
    this._sizes = Object.create(null)
    this._offsets = Object.create(null)
    this._retained = Object.create(null)
    this._schema = schema

    populateValues(this._schema, this._values)

    const { size, alignment } = calcSchemaLayout(
      this._schema,
      this._sizes,
      this._offsets,
      this._values,
      this._isOverlay,
      this._pack(),
    )

    this._size = size
    this._alignment = alignment

    const ab = new ArrayBuffer(this._size)
    this._buffer = new DataView(ab)
    this._u8 = new Uint8Array(ab)

    this._proxy = new Proxy(this._values, this.#handler()) as {
      [K in keyof TSchema]-?: ValueOfSpec<TSchema[K], TSchema>
    }
  }

  /*
   * MARK: Public API
   */

  get size() {
    return this._size
  }
  get alignment() {
    return this._alignment
  }

  get pointer(): bigint {
    return this._ptr(this._buffer.buffer)
  }
  get view(): ArrayBufferLike {
    return this._buffer.buffer
  }
  get buffer(): Uint8Array {
    return this._u8
  }

  get properties(): {
    -readonly [K in keyof TSchema]: ValueOfSpec<TSchema[K], TSchema>
  } {
    return this._proxy
  }

  copy(input: ArrayBufferLike | Uint8Array) {
    if (input instanceof Uint8Array) {
      this._u8.set(input)
    } else {
      this._u8.set(new Uint8Array(input))
    }
  }

  copyTo(buffer: ArrayBufferLike | Uint8Array, start: number, length: number) {
    const bufferView =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const l = Math.min(length, bufferView.length)
    for (let i = 0; i < l; i++) {
      bufferView[i] = this._u8[i + start] ?? 0
    }
  }

  copyFrom(
    buffer: ArrayBufferLike | Uint8Array,
    start: number,
    length: number,
  ) {
    const bufferView =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const l = Math.min(length, this._u8.length)
    for (let i = 0; i < l; i++) {
      this._u8[i + start] = bufferView[i] ?? 0
    }
  }

  /*
   * MARK: Internal helpers
   */

  #handler(): ProxyHandler<{
    [K in keyof TSchema]?: ValueOfSpec<TSchema[K], TSchema>
  }> {
    return {
      get: (_target, prop) => {
        if (!(prop in this._schema)) {
          throw new Error(`Unknown struct field: ${String(prop)}`)
        }

        if (prop in this._values) {
          this.#read(prop as keyof TSchema)
          return this._values[prop as keyof TSchema]
        }

        throw new Error(`Unknown struct field: ${String(prop)}`)
      },

      set: (_target, prop, value) => {
        if (!(prop in this._schema)) {
          throw new Error(`Unknown struct field: ${String(prop)}`)
        }

        this._values[prop as keyof TSchema] = value
        this.#write(prop as keyof TSchema)

        return true
      },

      deleteProperty: () => {
        throw new Error('Struct fields cannot be deleted')
      },

      has: (_target, prop) => prop in this._schema,

      ownKeys: () => Object.keys(this._schema),
      getOwnPropertyDescriptor: () => {
        return { enumerable: true, configurable: true }
      },
    }
  }

  /*
   * MARK: Read struct fields from this buffer
   */

  #read(key: keyof TSchema) {
    const spec = this._schema[key]!
    const offset = this._offsets[key as keyof TSchema]

    switch (spec.type) {
      case 'struct': {
        const s = this._values[key] as AbstractStruct<any> | bigint

        if (spec.isInline && s && typeof s !== 'object') {
          throw new Error(
            `Invalid value for inline struct property: ${String(key)}`,
          )
        }

        if (spec.isInline && s) {
          const str = s as AbstractStruct<any>
          this.copyTo(str.view, offset, str.size)
          break
        }

        if (
          !spec.isInline &&
          typeof s === 'object' &&
          s instanceof AbstractStruct
        ) {
          break
        }

        const addr = getDataViewValue(this._buffer, offset, spec.type)
        if (!addr) {
          this._values[key as keyof TSchema] = 0n as any
        } else {
          // Deserialize by copying pointed memory into a new instance (safe-by-copy)
          if (spec.schema !== 'self' && typeof spec.schema === 'function') {
            const Ctor = spec.schema as new (
              ...args: any[]
            ) => AbstractStruct<any>
            const instance = new Ctor()
            const temp = new Uint8Array(instance.size)
            for (let i = 0; i < temp.length; i++)
              temp[i] = this._read(BigInt(addr), i, 'u8')
            instance.copy(temp)
            this._values[key as keyof TSchema] = instance as any
          } else {
            this._values[key as keyof TSchema] = 0n as any
          }
        }
        break
      }
      case 'enum': {
        // If you need different enum widths, add per-field control
        const raw = getDataViewValue(this._buffer, offset, spec.bytes ?? 'u32')
        this._values[key as keyof TSchema] = raw as any
        break
      }
      case 'array': {
        // Inline arrays (fixed length)
        if (spec.length != null && spec.length >= 1) {
          const size = this._sizes[key]!
          if (spec.to === 'string') {
            // inline: array of pointers to c-strings
            const view = new BigUint64Array(this.view, offset, spec.length)
            const arr: string[] = new Array(spec.length)
            for (let i = 0; i < spec.length; i++) {
              const ap = view[i] ?? 0n
              arr[i] = ap ? this._toString(ap) : ''
            }
            this._values[key as keyof TSchema] = arr as any
          } else if (spec.to === 'boolean') {
            const view = new Uint8Array(this.view, offset, spec.length)
            const arr: boolean[] = new Array(spec.length)
            for (let i = 0; i < spec.length; i++) arr[i] = view[i] !== 0
            this._values[key as keyof TSchema] = arr as any
          } else {
            // numeric inline array
            const C: any = ArrayTypes[spec.to]
            const per = (C as any).BYTES_PER_ELEMENT
            const count = size / per
            const view = new C(this.view, offset, count)
            this._values[key as keyof TSchema] = new C(view) as any
          }
          break
        }

        // Dynamic arrays (pointer + currentLength)
        const addr = getDataViewValue(this._buffer, offset, spec.type)
        const basePtr = BigInt(addr)

        switch (spec.to) {
          case 'string':
          case 'boolean': {
            this._values[key as keyof TSchema] = addr as any
            break
          }
          default: {
            if (this._values[key as keyof TSchema]) {
              break
            }
            this._values[key as keyof TSchema] = addr as any
          }
        }
        break
      }
      case 'fn': {
        // Function pointers are not read back as JS callbacks.
        break
      }
      case 'string': {
        const addr = getDataViewValue(this._buffer, offset, spec.type)
        this._values[key as keyof TSchema] = (
          addr ? this._toString(Number(addr) as any) : ''
        ) as any
        break
      }
      case 'void':
      case 'u64':
      case 'i64':
      case 'f64':
      case 'u32':
      case 'i32':
      case 'f32':
      case 'u16':
      case 'i16':
      case 'u8':
      case 'i8':
      case 'boolean': {
        const v = getDataViewValue(this._buffer, offset, spec.type)
        this._values[key as keyof TSchema] = v as any
        break
      }

      default:
        throw new Error('Invalid struct property')
    }
  }

  /*
   * MARK: Write struct fields into this buffer
   */

  #write(key: keyof TSchema) {
    const spec = this._schema[key]!
    const offset = this._offsets[key as keyof TSchema]
    const val = this._values[key as keyof TSchema]

    switch (spec.type) {
      case 'struct': {
        if (spec.isInline) {
          if (typeof val !== 'object') {
            throw new Error(
              `Invalid value for inline struct property: ${String(key)}`,
            )
          }
          const s = val as AbstractStruct<any>
          this.copyFrom(s.view, offset, s.size)
          break
        }

        let address: bigint = 0n
        if (typeof val === 'object') {
          const s = val as AbstractStruct<any>
          address = s.pointer
        } else if (typeof val === 'number' || typeof val === 'bigint') {
          address = BigInt(val as any)
        } else {
          throw new Error(`Invalid value for pointer-to-struct: ${String(key)}`)
        }
        setDataViewValue(this._buffer, offset, spec.type, address)
        break
      }

      case 'enum': {
        const s = val as bigint | number
        setDataViewValue(this._buffer, offset, spec.bytes ?? 'u32', s)
        break
      }

      case 'array': {
        const s = val as any[] | PrimitiveBuffers
        const isInline = spec.length != null && spec.length >= 1
        if (!s) break

        if (isInline && (s as any[]).length !== spec.length) {
          throw new Error(
            `Invalid array length: ${(s as any[]).length}; expected: ${
              spec.length
            }`,
          )
        }

        if (Array.isArray(s)) {
          // Only 'string'[] and 'boolean'[] are allowed here
          let pointers: ArrayBufferLike
          switch (spec.to) {
            case 'string': {
              const buffer = new BigInt64Array(s.length)
              pointers = buffer.buffer
              const retained: Uint8Array[] = []
              for (let i = 0; i < s.length; i++) {
                if (typeof s[i] !== 'string') {
                  throw new RangeError(
                    `Invalid array element type for string[]: ${typeof s[i]}`,
                  )
                }
                const bytes = cstr(s[i] ?? '')
                retained.push(bytes)
                buffer[i] = BigInt(this._ptr(bytes))
              }
              this._retained[key] = retained
              break
            }
            case 'boolean': {
              const buffer = new Uint8Array(s.length)
              pointers = buffer.buffer
              this._retained[key] = buffer
              for (let i = 0; i < s.length; i++) buffer[i] = s[i] ? 1 : 0
              break
            }
            default:
              throw new Error(`Invalid array type for JS array: ${spec.to}`)
          }

          if (isInline) {
            this.copyFrom(new Uint8Array(pointers), offset, this._sizes[key]!)
          } else {
            setDataViewValue(
              this._buffer,
              offset,
              spec.type,
              BigInt(this._ptr(pointers)),
            )
          }
        } else if (typeof s === 'object' && 'buffer' in s) {
          // TypedArray case
          if (isInline) {
            this.copyFrom(
              new Uint8Array((s as any).buffer),
              offset,
              this._sizes[key]!,
            )
          } else {
            setDataViewValue(
              this._buffer,
              offset,
              spec.type,
              BigInt(this._ptr((s as any).buffer)),
            )
          }
        }
        break
      }

      case 'fn': {
        const cb = val as JSCallback | undefined
        const addr = cb?.ptr ? BigInt(cb.ptr) : 0n
        setDataViewValue(this._buffer, offset, spec.type, addr)
        break
      }

      case 'string': {
        const s = val as string | undefined
        if (!s) {
          setDataViewValue(this._buffer, offset, spec.type, 0n)
        } else {
          const bytes = cstr(s)
          this._retained[key] = new Uint8Array(bytes.buffer)
          setDataViewValue(
            this._buffer,
            offset,
            spec.type,
            BigInt(this._ptr(bytes)),
          )
        }
        break
      }

      case 'void':
      case 'u64':
      case 'i64': {
        setDataViewValue(
          this._buffer,
          offset,
          spec.type,
          BigInt((val as any) ?? 0),
        )
        break
      }

      case 'f64':
      case 'f32':
      case 'i32':
      case 'i16':
      case 'i8':
      case 'u32':
      case 'u16':
      case 'u8':
      case 'boolean': {
        setDataViewValue(
          this._buffer,
          offset,
          spec.type,
          Number((val as any) ?? 0),
        )
        break
      }

      default:
        throw new Error('Invalid struct property')
    }
  }

  protected abstract _ptr(
    buffer: ArrayBufferLike | NodeJS.TypedArray<ArrayBufferLike>,
  ): bigint
  protected abstract _read(
    pointer: bigint,
    index: number,
    type: PrimitiveLabel,
  ): any
  protected abstract _pack(): Bytes
  protected abstract _toString(pointer: bigint): string
}
