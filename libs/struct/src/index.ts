import { Buffer } from 'buffer'

/* ===================== Types & Schemas ===================== */

export type Pointer = number & { __pointer__: null }
export interface JSCallback {
  new (...args: any[]): any
  readonly ptr: Pointer | null
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
  currentLength?: number // runtime length for dynamic arrays
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

type ValueOfSpec<S, SS extends StructSchema> = S extends {
  type: 'struct'
  schema: infer ST
  isInline?: infer InLine
}
  ? ST extends 'self'
    ? AbstractStruct<SS> | Pointer | bigint
    : ST extends new (...args: any[]) => any
    ? InLine extends true
      ? InstanceType<ST>
      : InstanceType<ST> | Pointer | bigint
    : Pointer | bigint
  : S extends { type: 'enum'; enum: infer P }
  ? P extends {}
    ? P[keyof P] | number
    : never
  : S extends { type: 'array'; to: infer P }
  ? P extends PrimitiveLabel
    ? P extends 'string'
      ? Pointer[]
      : P extends
          | 'i64'
          | 'u64'
          | 'i8'
          | 'i16'
          | 'i32'
          | 'u8'
          | 'u16'
          | 'u32'
          | 'f32'
          | 'f64'
      ? InstanceType<(typeof ArrayTypes)[P]>
      : P extends 'boolean'
      ? boolean[]
      : never
    : never
  : S extends { type: 'fn'; fn: infer P }
  ? P extends (...args: any[]) => any
    ? (P & JSCallback) | null
    : never
  : S extends { type: infer T }
  ? T extends 'string' | 'void'
    ? Pointer
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

/* ===================== Typed Arrays Map ===================== */

const ArrayTypes = {
  string: BigUint64Array<ArrayBufferLike>, // holds pointers (inline string[] uses pointers too)
  i8: Int8Array<ArrayBufferLike>,
  i16: Int16Array<ArrayBufferLike>,
  i32: Int32Array<ArrayBufferLike>,
  i64: BigInt64Array<ArrayBufferLike>,
  u8: Uint8Array<ArrayBufferLike>,
  u16: Uint16Array<ArrayBufferLike>,
  u32: Uint32Array<ArrayBufferLike>,
  u64: BigUint64Array<ArrayBufferLike>,
  f32: Float32Array<ArrayBufferLike>,
  f64: Float64Array<ArrayBufferLike>,
  boolean: Uint8Array<ArrayBufferLike>,
  void: BigUint64Array<ArrayBufferLike>, // generic pointer storage
} as const

/* ===================== Sizes, Alignments & Helpers ===================== */

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

/* ===================== Defaults ===================== */

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
        values[key] = isInline ? new Array(spec.length).fill(0) : 0
        continue
      }
      if (spec.to === 'boolean') {
        values[key] = isInline ? new Array(spec.length).fill(false) : 0
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

/* ===================== Layout (Aligned Offsets) ===================== */

function calcSchemaLayout(
  schema: StructSchema,
  sizes: Record<string, number>,
  offsets: Record<string, number>,
  values: Record<string, any>,
  isOverlay: boolean,
  pack?: Bytes,
): { size: number; alignment: number } {
  const entries = Object.entries(schema).sort((a, b) => a[1].order - b[1].order)
  let overlaySize = 0
  let alignment = 1
  let fieldSize = 0
  let fieldAlign = 1
  let offset = 0

  for (const [key, spec] of entries) {
    fieldSize = 0
    fieldAlign = 1

    if (spec.type === 'struct' && spec.isInline) {
      const base = values[key] as AbstractStruct<any>
      fieldSize = base.size
      fieldAlign = base.alignment ?? TYPE_BYTES.struct
    } else if (spec.type === 'array') {
      if (spec.length != null && spec.length >= 1) {
        // Array is inline
        fieldSize = Math.max(
          spec.length * TYPE_BYTES[spec.to],
          TYPE_BYTES.array,
        )
        fieldAlign = TYPE_BYTES[spec.to] ?? TYPE_BYTES.void
      } else {
        fieldSize = TYPE_BYTES.array
        fieldAlign = TYPE_BYTES.array
      }
    } else {
      const t = spec.type as MetaLabel
      fieldSize = TYPE_BYTES[t] ?? TYPE_BYTES.void
      fieldAlign = TYPE_BYTES[t] ?? TYPE_BYTES.void
    }

    if (pack) fieldAlign = Math.min(fieldAlign, pack)
    alignment = isOverlay ? Math.max(alignment, fieldAlign) : fieldAlign
    overlaySize = Math.max(overlaySize, fieldSize)

    const fieldOffset = alignTo(offset, fieldAlign)
    sizes[key] = fieldSize
    offsets[key] = isOverlay ? 0 : fieldOffset
    offset = fieldOffset + fieldSize
  }

  return {
    size: alignTo(isOverlay ? overlaySize : offset, alignment),
    alignment,
  }
}

/* ===================== Get/Set DataView ===================== */

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

/* ===================== CString ===================== */

export function cstr(str: string): NodeJS.TypedArray<ArrayBufferLike> {
  return Buffer.from(str + '\0')
}

/* ===================== Core Class ===================== */

export abstract class AbstractStruct<TSchema extends StructSchema> {
  readonly #schema: TSchema
  #values: { [K in keyof TSchema]?: ValueOfSpec<TSchema[K], TSchema> }
  #sizes: { [K in keyof TSchema]: number }
  #offsets: { [K in keyof TSchema]: number }
  #isOverlay: boolean

  #buffer: DataView
  #u8: Uint8Array
  #size: number
  #alignment: number

  #retained: Uint8Array[] = []

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

    this.#isOverlay = isOverlay
    this.#values = Object.create(null)
    this.#sizes = Object.create(null)
    this.#offsets = Object.create(null)
    this.#schema = schema

    populateValues(this.#schema, this.#values)

    const { size, alignment } = calcSchemaLayout(
      this.#schema,
      this.#sizes,
      this.#offsets,
      this.#values,
      this.#isOverlay,
      this._pack(),
    )

    this.#size = size
    this.#alignment = alignment

    const ab = new ArrayBuffer(this.#size)
    this.#buffer = new DataView(ab)
    this.#u8 = new Uint8Array(ab)
  }

  /* ============ Public API ============ */

  set<K extends keyof TSchema>(
    key: K,
    value: ValueOfSpec<TSchema[K], TSchema>,
  ): this {
    if (!(key in this.#schema)) {
      throw new Error(`Unknown field: ${String(key)}`)
    }
    this.#values[key] = value
    return this
  }

  get<K extends keyof TSchema>(key: K): ValueOfSpec<TSchema[K], TSchema> {
    if (!(key in this.#schema)) {
      throw new Error(`Unknown field: ${String(key)}`)
    }
    return this.#values[key] as ValueOfSpec<TSchema[K], TSchema>
  }

  get size() {
    return this.#size
  }
  get alignment() {
    return this.#alignment
  }

  get pointer(): Pointer {
    return this._ptr(this.#buffer.buffer)
  }
  get view(): ArrayBufferLike {
    return this.#buffer.buffer
  }
  get buffer(): Uint8Array {
    return this.#u8
  }

  copy(input: ArrayBufferLike | Uint8Array) {
    if (input instanceof Uint8Array) {
      this.#u8.set(input)
    } else {
      this.#u8.set(new Uint8Array(input))
    }
  }

  copyTo(buffer: ArrayBufferLike | Uint8Array, start: number, length: number) {
    const bufferView =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const l = Math.min(length, bufferView.length)
    for (let i = 0; i < l; i++) {
      bufferView[i] = this.#u8[i + start] ?? 0
    }
  }

  copyFrom(
    buffer: ArrayBufferLike | Uint8Array,
    start: number,
    length: number,
  ) {
    const bufferView =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    const l = Math.min(length, this.#u8.length)
    for (let i = 0; i < l; i++) {
      this.#u8[i + start] = bufferView[i] ?? 0
    }
  }

  /* ============ Internal helpers ============ */

  #clearRetained(): void {
    this.#retained = []
  }

  /* ============ Read struct fields from this buffer ============ */

  read() {
    const entries = Object.entries(this.#schema).sort(
      (a, b) => a[1].order - b[1].order,
    )

    for (const [key, spec] of entries) {
      const offset = this.#offsets[key as keyof TSchema]

      switch (spec.type) {
        case 'struct': {
          const s = this.#values[key] as AbstractStruct<any> | Pointer | bigint

          if (spec.isInline && s && typeof s !== 'object') {
            throw new Error(
              `Invalid value for inline struct property: ${String(key)}`,
            )
          }

          if (spec.isInline && s) {
            const str = s as AbstractStruct<any>
            this.copyTo(str.view, offset, str.size)
            str.read()
            break
          }

          if (
            !spec.isInline &&
            typeof s === 'object' &&
            s instanceof AbstractStruct
          ) {
            s.read()
            break
          }

          const addr = getDataViewValue(this.#buffer, offset, spec.type)
          if (!addr) {
            this.#values[key as keyof TSchema] = 0n as any
          } else {
            // Deserialize by copying pointed memory into a new instance (safe-by-copy)
            if (spec.schema !== 'self' && typeof spec.schema === 'function') {
              const Ctor = spec.schema as new (
                ...args: any[]
              ) => AbstractStruct<any>
              const instance = new Ctor()
              const basePtr = Number(addr) as Pointer
              const temp = new Uint8Array(instance.size)
              for (let i = 0; i < temp.length; i++)
                // temp[i] = read.u8(basePtr, i)
                temp[i] = this._read(basePtr, i, 'u8')
              instance.copy(temp)
              instance.read()
              this.#values[key as keyof TSchema] = instance as any
            } else {
              this.#values[key as keyof TSchema] = 0n as any
            }
          }
          break
        }
        case 'enum': {
          // If you need different enum widths, add per-field control
          const raw = getDataViewValue(
            this.#buffer,
            offset,
            spec.bytes ?? 'u32',
          )
          this.#values[key as keyof TSchema] = raw as any
          break
        }
        case 'array': {
          // Inline arrays (fixed length)
          if (spec.length != null && spec.length >= 1) {
            const size = this.#sizes[key]!
            if (spec.to === 'string') {
              // inline: array of pointers to c-strings
              const view = new BigUint64Array(this.view, offset, spec.length)
              const arr: string[] = new Array(spec.length)
              for (let i = 0; i < spec.length; i++) {
                const ap = Number(view[i]) as Pointer
                arr[i] = (ap ?? 0) as any
              }
              this.#values[key as keyof TSchema] = arr as any
            } else if (spec.to === 'boolean') {
              const view = new Uint8Array(this.view, offset, spec.length)
              const arr: boolean[] = new Array(spec.length)
              for (let i = 0; i < spec.length; i++) arr[i] = view[i] !== 0
              this.#values[key as keyof TSchema] = arr as any
            } else {
              // numeric inline array
              const C: any = ArrayTypes[spec.to]
              const per = (C as any).BYTES_PER_ELEMENT
              const count = size / per
              const view = new C(this.view, offset, count)
              this.#values[key as keyof TSchema] = new C(view) as any
            }
            break
          }

          // Dynamic arrays (pointer + currentLength)
          const addr = getDataViewValue(this.#buffer, offset, spec.type)
          if (!addr || !spec.currentLength) {
            this.#values[key as keyof TSchema] = undefined
            break
          }

          const basePtr = Number(addr) as Pointer
          const len = spec.currentLength

          switch (spec.to) {
            case 'string': {
              const arr: Pointer[] = []
              for (let i = 0; i < len; i++) {
                const cptr = this._read(
                  basePtr,
                  i * PTR_SIZE,
                  'string',
                ) as Pointer
                arr.push(cptr ?? 0)
              }
              this.#values[key as keyof TSchema] = arr as any
              break
            }
            case 'boolean': {
              const arr: boolean[] = []
              for (let i = 0; i < len; i++) {
                arr.push(this._read(basePtr, i, 'boolean'))
              }
              this.#values[key as keyof TSchema] = arr as any
              break
            }
            default: {
              // numeric dynamic arrays
              const elemSize = TYPE_BYTES[spec.to]
              const raw = new Uint8Array(len * elemSize)
              for (let i = 0; i < raw.length; i++)
                raw[i] = this._read(basePtr, i, 'u8')

              const T: any = (ArrayTypes as any)[spec.to]
              this.#values[key as keyof TSchema] = new T(raw.buffer) as any
            }
          }
          break
        }
        case 'fn': {
          // Function pointers are not read back as JS callbacks.
          break
        }
        case 'string': {
          const addr = getDataViewValue(this.#buffer, offset, spec.type)
          this.#values[key as keyof TSchema] = addr ? (Number(addr) as any) : 0
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
          const v = getDataViewValue(this.#buffer, offset, spec.type)
          this.#values[key as keyof TSchema] = v as any
          break
        }

        default:
          throw new Error('Invalid struct property')
      }
    }
  }

  /* ============ Write struct fields into this buffer ============ */

  flush() {
    this.#u8.fill(0)
    this.#clearRetained()

    const entries = Object.entries(this.#schema).sort(
      (a, b) => a[1].order - b[1].order,
    )

    for (const [key, spec] of entries) {
      const offset = this.#offsets[key as keyof TSchema]
      const val = this.#values[key as keyof TSchema]

      if (val == null) continue

      switch (spec.type) {
        case 'struct': {
          if (spec.isInline) {
            if (typeof val !== 'object') {
              throw new Error(
                `Invalid value for inline struct property: ${String(key)}`,
              )
            }
            const s = val as AbstractStruct<any>
            s.flush()
            this.copyFrom(s.view, offset, s.size)
            break
          }

          let address: bigint = 0n
          if (typeof val === 'object' && 'flush' in (val as any)) {
            const s = val as AbstractStruct<any>
            s.flush()
            address = BigInt(s.pointer)
          } else if (typeof val === 'number' || typeof val === 'bigint') {
            address = BigInt(val as any)
          } else {
            throw new Error(
              `Invalid value for pointer-to-struct: ${String(key)}`,
            )
          }
          setDataViewValue(this.#buffer, offset, spec.type, address)
          break
        }

        case 'enum': {
          const s = val as bigint | number
          setDataViewValue(this.#buffer, offset, spec.bytes ?? 'u32', s)
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
                spec.currentLength = s.length
                pointers = buffer.buffer
                for (let i = 0; i < s.length; i++) {
                  const bytes = cstr(s[i] ?? '')
                  const hold = new Uint8Array(bytes.buffer)
                  this.#retained.push(hold)
                  buffer[i] = BigInt(this._ptr(hold.buffer))
                }
                break
              }
              case 'boolean': {
                const buffer = new Uint8Array(s.length)
                spec.currentLength = s.length
                pointers = buffer.buffer
                for (let i = 0; i < s.length; i++) buffer[i] = s[i] ? 1 : 0
                break
              }
              default:
                throw new Error(`Invalid array type for JS array: ${spec.to}`)
            }

            if (isInline) {
              this.copyFrom(new Uint8Array(pointers), offset, this.#sizes[key]!)
            } else {
              setDataViewValue(
                this.#buffer,
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
                this.#sizes[key]!,
              )
            } else {
              spec.currentLength = (s as any).length
              setDataViewValue(
                this.#buffer,
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
          setDataViewValue(this.#buffer, offset, spec.type, addr)
          break
        }

        case 'string': {
          const s = val as string | undefined
          if (!s) {
            setDataViewValue(this.#buffer, offset, spec.type, 0n)
            break
          }
          const bytes = cstr(s)
          const hold = new Uint8Array(bytes.buffer)
          this.#retained.push(hold)
          setDataViewValue(
            this.#buffer,
            offset,
            spec.type,
            BigInt(this._ptr(hold.buffer)),
          )
          break
        }

        case 'void':
        case 'u64':
        case 'i64': {
          setDataViewValue(
            this.#buffer,
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
            this.#buffer,
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
  }

  protected abstract _ptr(
    buffer: ArrayBufferLike | NodeJS.TypedArray<ArrayBufferLike>,
  ): Pointer
  protected abstract _read(
    pointer: Pointer,
    index: number,
    type: PrimitiveLabel,
  ): any
  protected abstract _pack(): Bytes
}
