import type { AbstractStruct, Bytes } from '.'
import {
  ArrayTypes,
  TYPE_BYTES,
  type MetaLabel,
  type StructSchema,
} from './types'

export function alignTo(offset: number, align: number): number {
  const mask = align - 1
  return (offset + mask) & ~mask
}

export function populateValues(
  schema: StructSchema,
  values: Record<string, any>,
) {
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

export function calcSchemaLayout(
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

export function getDataViewValue(
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

export function setDataViewValue(
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
