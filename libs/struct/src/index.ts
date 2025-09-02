import { Buffer } from 'buffer'

/*
 * MARK: Types & Schemas
 */

export interface JSCallback {
  new (...args: any[]): any
  readonly ptr: bigint | null
}

export type PrimitiveLabel =
  | 'string'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i64'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'f32'
  | 'f64'
  | 'boolean'
  | 'void'

export type Bytes = 1 | 2 | 4 | 8

export type PtrToPrimitive = {
  type: 'array'
  to: PrimitiveLabel
  length?: number // inline array length (if provided)
}

export type PtrToStruct<S extends AbstractStruct<any>> = {
  type: 'struct'
  schema: S | 'self' // constructor or 'self'
  isInline?: boolean // inline struct (embedded bytes) vs pointer-to-struct
}

export type PtrToEnum<S> = {
  type: 'enum'
  enum: S
  /** @default 'u32' */
  bytes?: 'u8' | 'u16' | 'u32' | 'u64'
}

export type PtrToCallback<S extends Function> = {
  type: 'fn'
  fn: S
}

export type PropertySpec =
  | ({ order: number } & { type: PrimitiveLabel })
  | ({ order: number } & PtrToPrimitive)
  | ({ order: number } & PtrToStruct<any>)
  | ({ order: number } & PtrToEnum<any>)
  | ({ order: number } & PtrToCallback<any>)

type TAView = ArrayBufferView

type TACtor<T extends TAView = TAView> = {
  new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): T
  readonly BYTES_PER_ELEMENT: number
}

type ArrayValue<T extends PrimitiveLabel> = T extends 'string'
  ? string[] | bigint
  : T extends 'boolean'
  ? boolean[] | bigint
  : InstanceType<(typeof ArrayTypes)[T]> | bigint

type ValueOfSpec<S, SS extends StructSchema> = S extends {
  type: 'struct'
  schema: infer ST
  isInline?: infer InLine
}
  ? ST extends 'self'
    ? AbstractStruct<SS> | bigint
    : ST extends new (...args: any[]) => any
    ? InLine extends true
      ? InstanceType<ST>
      : InstanceType<ST> | bigint
    : bigint
  : S extends { type: 'enum'; enum: infer P }
  ? P extends {}
    ? P[keyof P] | number
    : never
  : S extends { type: 'array'; to: infer P }
  ? P extends PrimitiveLabel
    ? ArrayValue<P>
    : never
  : S extends { type: 'fn'; fn: infer P }
  ? P extends (...args: any[]) => any
    ? (P & JSCallback) | null
    : never
  : S extends { type: infer T }
  ? T extends 'void'
    ? bigint
    : T extends 'string'
    ? string
    : T extends 'i64' | 'u64'
    ? bigint
    : T extends 'i8' | 'i16' | 'i32' | 'u8' | 'u16' | 'u32' | 'f32' | 'f64'
    ? number
    : T extends 'boolean'
    ? boolean
    : never
  : never

export type StructSchema = Readonly<Record<string, PropertySpec>>

export type PrimitiveBuffers = InstanceType<
  (typeof ArrayTypes)[keyof typeof ArrayTypes]
>

/*
 * MARK: Typed Arrays Map
 */

const ArrayTypes = {
  string: BigUint64Array,
  i8: Int8Array,
  i16: Int16Array,
  i32: Int32Array,
  i64: BigInt64Array,
  u8: Uint8Array,
  u16: Uint16Array,
  u32: Uint32Array,
  u64: BigUint64Array,
  f32: Float32Array,
  f64: Float64Array,
  boolean: Uint8Array,
  void: BigUint64Array,
} as const satisfies Record<PrimitiveLabel, TACtor>

/*
 * MARK: Sizes, Alignments & Helpers
 */

// Pointer size/alignment (LP64 on x86_64)
const PTR_SIZE = 8 as const

type MetaLabel = PrimitiveLabel | 'enum' | 'struct' | 'fn' | 'array'

const TYPE_BYTES: Record<MetaLabel, Bytes> = {
  boolean: 1,
  i8: 1,
  i16: 2,
  i32: 4,
  i64: 8,
  u8: 1,
  u16: 2,
  u32: 4,
  u64: 8,
  f32: 4,
  f64: 8,
  enum: 4, // typical; make configurable per field if needed
  string: PTR_SIZE, // pointer to C string
  void: PTR_SIZE, // treated as pointer-sized storage
  struct: PTR_SIZE, // non-inline struct fields are pointers
  fn: PTR_SIZE, // function pointer
  array: PTR_SIZE, // dynamic arrays use a pointer
}

function alignTo(offset: number, align: number): number {
  const mask = align - 1
  return (offset + mask) & ~mask
}

/*
 * MARK: Defaults
 */

function populateValues(schema: StructSchema, values: Record<string, any>) {
  for (const [key, spec] of Object.entries(schema)) {
    if (spec.type === 'struct' && spec.isInline) {
      if (spec.schema === 'self') {
        throw new Error('Cannot inline self-referencing struct')
      }
      values[key] = new spec.schema() as AbstractStruct<any>
      continue
    }

    if (spec.type === 'array') {
      const isInline = spec.length != null && spec.length >= 1
      if (spec.to === 'string') {
        values[key] = isInline ? new Array(spec.length).fill('') : ''
        continue
      }
      if (spec.to === 'boolean') {
        values[key] = isInline ? new Array(spec.length).fill(false) : false
        continue
      }
      const C = ArrayTypes[spec.to] as any
      values[key] = isInline ? new C(spec.length!) : 0 // dynamic -> pointer
      continue
    }

    if (
      spec.type === 'struct' ||
      spec.type === 'u64' ||
      spec.type === 'i64' ||
      spec.type === 'void'
    ) {
      values[key] = 0n
      continue
    }

    if (spec.type === 'string') {
      values[key] = ''
      continue
    }

    if (spec.type === 'boolean') {
      values[key] = false
      continue
    }

    if (spec.type === 'fn') {
      values[key] = null
      continue
    }

    // primitives
    values[key] = 0
  }
}

/*
 * MARK: Layout (Aligned Offsets)
 */

function calcSchemaLayout(
  schema: StructSchema,
  sizes: Record<string, number>,
  offsets: Record<string, number>,
  values: Record<string, any>,
  isOverlay: boolean,
  pack?: Bytes,
): { size: number; alignment: number } {
  const entries = Object.entries(schema).sort((a, b) => a[1].order - b[1].order)

  let curOff = 0
  let maxAlign = 1
  let overlayMaxSize = 0

  for (const [key, spec] of entries) {
    // --- compute field size & alignment ---
    let fSize = 0
    let fAlign = 1

    if (spec.type === 'struct' && spec.isInline) {
      const base = values[key] as AbstractStruct<any>
      fSize = base.size
      fAlign = base.alignment ?? TYPE_BYTES.struct
    } else if (spec.type === 'array') {
      if (spec.length != null && spec.length >= 1) {
        // inline array (contiguous payload)
        const elemSize = TYPE_BYTES[spec.to] ?? TYPE_BYTES.void
        fSize = Math.max(spec.length * elemSize, TYPE_BYTES.array)
        fAlign = elemSize
      } else {
        // dynamic array (pointer-like header)
        fSize = TYPE_BYTES.array
        fAlign = TYPE_BYTES.array
      }
    } else {
      const t = spec.type as MetaLabel
      fSize = TYPE_BYTES[t] ?? TYPE_BYTES.void
      fAlign = TYPE_BYTES[t] ?? TYPE_BYTES.void
    }

    if (pack) fAlign = Math.min(fAlign, pack)
    maxAlign = Math.max(maxAlign, fAlign)

    // --- place field ---
    if (isOverlay) {
      sizes[key] = fSize
      offsets[key] = 0
      overlayMaxSize = Math.max(overlayMaxSize, fSize)
    } else {
      const aligned = alignTo(curOff, fAlign)
      sizes[key] = fSize
      offsets[key] = aligned
      curOff = aligned + fSize
    }
  }

  const rawSize = isOverlay ? overlayMaxSize : curOff
  const size = alignTo(rawSize, maxAlign)

  return { size, alignment: maxAlign }
}

/*
 * MARK: Get/Set DataView
 */

function getDataViewValue(
  view: DataView,
  offset: number,
  type: Exclude<MetaLabel, 'enum'>,
) {
  switch (type) {
    case 'struct':
    case 'array':
    case 'string':
    case 'void':
    case 'u64':
      return view.getBigUint64(offset, true)
    case 'i64':
      return view.getBigInt64(offset, true)
    case 'f64':
      return view.getFloat64(offset, true)
    case 'u32':
      return view.getUint32(offset, true)
    case 'i32':
      return view.getInt32(offset, true)
    case 'f32':
      return view.getFloat32(offset, true)
    case 'u16':
      return view.getUint16(offset, true)
    case 'i16':
      return view.getInt16(offset, true)
    case 'u8':
      return view.getUint8(offset)
    case 'i8':
      return view.getInt8(offset)
    case 'boolean':
      return view.getUint8(offset) !== 0
    default:
      throw new Error('Invalid struct property')
  }
}

function setDataViewValue(
  view: DataView,
  offset: number,
  type: Exclude<MetaLabel, 'enum'>,
  value: any,
) {
  switch (type) {
    case 'struct':
    case 'array':
    case 'string':
    case 'void':
    case 'u64':
      view.setBigUint64(offset, value, true)
      break
    case 'i64':
      view.setBigInt64(offset, value, true)
      break
    case 'f64':
      view.setFloat64(offset, value, true)
      break
    case 'u32':
      view.setUint32(offset, value, true)
      break
    case 'i32':
      view.setInt32(offset, value, true)
      break
    case 'f32':
      view.setFloat32(offset, value, true)
      break
    case 'u16':
      view.setUint16(offset, value, true)
      break
    case 'i16':
      view.setInt16(offset, value, true)
      break
    case 'u8':
      view.setUint8(offset, value)
      break
    case 'i8':
      view.setInt8(offset, value)
      break
    case 'boolean':
      view.setUint8(offset, value ? 1 : 0)
      break
    default:
      throw new Error('Invalid struct property')
  }
}

export function cstr(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str + '\0').buffer)
}

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
        if (typeof val === 'object' && 'flush' in (val as any)) {
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
