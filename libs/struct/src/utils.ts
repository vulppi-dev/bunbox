import type { AllFields, FieldType, InferField, StructDesc } from './fields';

export type Bytes = 1 | 2 | 4 | 8;

export const PTR_SIZE = 8 as const;

export const TYPE_BYTES: Record<FieldType, Bytes> = {
  bool: 1,
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
  string: PTR_SIZE,
  void: PTR_SIZE,
  struct: PTR_SIZE,
  array: PTR_SIZE,
};

export function alignTo(offset: number, align: number): number {
  const mask = align - 1;
  return (offset + mask) & ~mask;
}

function pointerLayout(pack?: Bytes): { size: number; alignment: number } {
  const alignment = pack ? Math.min(PTR_SIZE, pack) : PTR_SIZE;
  return { size: PTR_SIZE, alignment };
}

function getFieldAlignment(alignment: number, pack?: Bytes): number {
  if (!pack) return alignment;
  return Math.min(alignment, pack);
}

export type StructOffsets = Array<[number, number]>;

type WriteOptions = {
  pack?: Bytes;
  stringToPointer: (value: string) => bigint;
};

type ReadOptions = {
  pack?: Bytes;
  pointerToString: (pointer: bigint) => string;
};

function calculateStructLayout(
  desc: StructDesc,
  isUnion: boolean,
  pack?: Bytes,
): { size: number; alignment: number; offsets: StructOffsets } {
  const offsets: StructOffsets = [];
  const entries = Object.values(desc);

  let cursor = 0;
  let maxAlign = 1;
  let overlayMaxSize = 0;

  for (const field of entries) {
    const child = calculateFieldSize(field, pack);
    let alignment = getFieldAlignment(child.alignment, pack);
    const size = child.size;

    alignment = Math.max(alignment, 1);
    maxAlign = Math.max(maxAlign, alignment);

    let offset = 0;
    if (isUnion) {
      overlayMaxSize = Math.max(overlayMaxSize, size);
    } else {
      offset = alignTo(cursor, alignment);
      cursor = offset + size;
    }

    offsets.push([offset, size]);
  }

  const rawSize = isUnion ? overlayMaxSize : cursor;
  const size = alignTo(rawSize, maxAlign);

  return {
    size,
    alignment: maxAlign,
    offsets,
  };
}

export function calculateFieldSize(
  field: AllFields,
  pack?: Bytes,
): { size: number; alignment: number; offsets?: StructOffsets } {
  if (field.meta?.isPointer) {
    return pointerLayout(pack);
  }

  switch (field.type) {
    case 'struct': {
      const { size, alignment, offsets } = calculateStructLayout(
        field.fields,
        field.isUnion ?? false,
        pack,
      );

      return { size, alignment, offsets };
    }

    case 'array': {
      if (typeof field.length !== 'number' || field.length <= 0) {
        return pointerLayout(pack);
      }

      const length = field.length;
      const elementLayout = calculateFieldSize(field.to, pack);
      const elementAlignment = getFieldAlignment(elementLayout.alignment, pack);
      const stride = alignTo(elementLayout.size, elementAlignment);
      const totalSize = stride * length;

      return {
        size: totalSize,
        alignment: elementAlignment,
      };
    }

    default: {
      const primitiveSize = TYPE_BYTES[field.type as FieldType];
      const alignment = getFieldAlignment(primitiveSize, pack);

      return {
        size: primitiveSize,
        alignment,
      };
    }
  }
}

const LITTLE_ENDIAN = true;

function normalizePointer(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (value == null) return 0n;
  throw new Error('Expected pointer-compatible value (bigint or number).');
}

function getDefaultValue(field: AllFields): unknown {
  const metaDefault = field.meta?.default;
  if (metaDefault !== undefined) return metaDefault;

  switch (field.type) {
    case 'bool':
      return false;
    case 'u8':
    case 'u16':
    case 'u32':
    case 'i8':
    case 'i16':
    case 'i32':
    case 'f32':
    case 'f64':
      return 0;
    case 'u64':
    case 'i64':
    case 'void':
      return 0n;
    case 'string':
      return '';
    case 'array': {
      if (typeof field.length === 'number' && field.length > 0) {
        return new Array(field.length).fill(0);
      }
      return 0n;
    }
    case 'struct':
      return {};
    default:
      return 0;
  }
}

function writePrimitive(
  type: FieldType,
  value: unknown,
  view: DataView,
  offset: number,
) {
  switch (type) {
    case 'bool':
      view.setUint8(offset, value ? 1 : 0);
      break;
    case 'u8':
      view.setUint8(offset, Number(value ?? 0));
      break;
    case 'i8':
      view.setInt8(offset, Number(value ?? 0));
      break;
    case 'u16':
      view.setUint16(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'i16':
      view.setInt16(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'u32':
      view.setUint32(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'i32':
      view.setInt32(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'f32':
      view.setFloat32(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'f64':
      view.setFloat64(offset, Number(value ?? 0), LITTLE_ENDIAN);
      break;
    case 'u64':
      view.setBigUint64(offset, normalizePointer(value), LITTLE_ENDIAN);
      break;
    case 'i64': {
      const normalized =
        typeof value === 'bigint' ? value : BigInt(Number(value ?? 0));
      view.setBigInt64(offset, normalized, LITTLE_ENDIAN);
      break;
    }
    case 'string':
    case 'void':
      view.setBigUint64(offset, normalizePointer(value), LITTLE_ENDIAN);
      break;
    default:
      throw new Error(`Unsupported primitive field type: ${type}`);
  }
}

function readPrimitive(
  type: FieldType,
  view: DataView,
  offset: number,
): unknown {
  switch (type) {
    case 'bool':
      return view.getUint8(offset) !== 0;
    case 'u8':
      return view.getUint8(offset);
    case 'i8':
      return view.getInt8(offset);
    case 'u16':
      return view.getUint16(offset, LITTLE_ENDIAN);
    case 'i16':
      return view.getInt16(offset, LITTLE_ENDIAN);
    case 'u32':
      return view.getUint32(offset, LITTLE_ENDIAN);
    case 'i32':
      return view.getInt32(offset, LITTLE_ENDIAN);
    case 'f32':
      return view.getFloat32(offset, LITTLE_ENDIAN);
    case 'f64':
      return view.getFloat64(offset, LITTLE_ENDIAN);
    case 'u64':
      return view.getBigUint64(offset, LITTLE_ENDIAN);
    case 'i64':
      return view.getBigInt64(offset, LITTLE_ENDIAN);
    case 'string':
    case 'void':
      return view.getBigUint64(offset, LITTLE_ENDIAN);
    default:
      throw new Error(`Unsupported primitive field type: ${type}`);
  }
}

export function writeFieldValue<F extends AllFields>(
  field: F,
  value: Partial<InferField<F>> | undefined,
  view: DataView,
  offset: number,
  options: WriteOptions,
): void {
  const pack = options.pack ?? PTR_SIZE;
  const resolvedValue = value ?? (getDefaultValue(field) as InferField<F>);

  if (field.meta?.isPointer) {
    view.setBigUint64(offset, normalizePointer(resolvedValue), LITTLE_ENDIAN);
    return;
  }

  if (field.type === 'string') {
    const pointerValue =
      typeof resolvedValue === 'string'
        ? options.stringToPointer(resolvedValue)
        : normalizePointer(resolvedValue);
    view.setBigUint64(offset, pointerValue, LITTLE_ENDIAN);
    return;
  }

  if (field.type === 'array') {
    if (typeof field.length !== 'number' || field.length <= 0) {
      view.setBigUint64(offset, normalizePointer(resolvedValue), LITTLE_ENDIAN);
      return;
    }

    const length = field.length;
    const elementLayout = calculateFieldSize(field.to, pack);
    const elementAlignment = getFieldAlignment(elementLayout.alignment, pack);
    const stride = alignTo(elementLayout.size, elementAlignment);

    const slice = new Uint8Array(
      view.buffer,
      view.byteOffset + offset,
      stride * length,
    );
    slice.fill(0);

    const arrayValue = Array.isArray(resolvedValue)
      ? (resolvedValue as unknown[])
      : [];

    for (let i = 0; i < length; i++) {
      const elementValue = arrayValue[i] ?? getDefaultValue(field.to);
      writeFieldValue(
        field.to,
        elementValue as InferField<typeof field.to>,
        view,
        offset + stride * i,
        options,
      );
    }

    return;
  }

  if (field.type === 'struct') {
    const { offsets, size } = calculateStructLayout(
      field.fields,
      field.isUnion ?? false,
      pack,
    );

    const slice = new Uint8Array(view.buffer, view.byteOffset + offset, size);
    slice.fill(0);

    const entries = Object.entries(field.fields);
    const objectValue =
      resolvedValue && typeof resolvedValue === 'object'
        ? (resolvedValue as Record<string, unknown>)
        : {};

    entries.forEach(([key, childField], index) => {
      const [childOffset] = offsets[index] ?? [0, 0];
      const childValue = objectValue[key] ?? getDefaultValue(childField);
      writeFieldValue(
        childField,
        childValue as InferField<typeof childField>,
        view,
        offset + childOffset,
        options,
      );
    });

    return;
  }

  writePrimitive(field.type as FieldType, resolvedValue, view, offset);
}

export function readFieldValue<F extends AllFields>(
  field: F,
  view: DataView,
  offset: number,
  options: ReadOptions,
): InferField<F> {
  const pack = options.pack ?? PTR_SIZE;

  if (field.meta?.isPointer) {
    return view.getBigUint64(offset, LITTLE_ENDIAN) as unknown as InferField<F>;
  }

  if (field.type === 'string') {
    const pointer = view.getBigUint64(offset, LITTLE_ENDIAN);
    return options.pointerToString(pointer) as InferField<F>;
  }

  if (field.type === 'array') {
    if (typeof field.length !== 'number' || field.length <= 0) {
      return view.getBigUint64(
        offset,
        LITTLE_ENDIAN,
      ) as unknown as InferField<F>;
    }

    const length = field.length;
    const elementLayout = calculateFieldSize(field.to, pack);
    const elementAlignment = getFieldAlignment(elementLayout.alignment, pack);
    const stride = alignTo(elementLayout.size, elementAlignment);

    const result: unknown[] = new Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = readFieldValue(field.to, view, offset + stride * i, options);
    }

    return result as InferField<F>;
  }

  if (field.type === 'struct') {
    const { offsets } = calculateStructLayout(
      field.fields,
      field.isUnion ?? false,
      pack,
    );

    const entries = Object.entries(field.fields);
    const result: Record<string, unknown> = {};

    entries.forEach(([key, childField], index) => {
      const [childOffset] = offsets[index] ?? [0, 0];
      result[key] = readFieldValue(
        childField,
        view,
        offset + childOffset,
        options,
      );
    });

    return result as InferField<F>;
  }

  return readPrimitive(field.type as FieldType, view, offset) as InferField<F>;
}
