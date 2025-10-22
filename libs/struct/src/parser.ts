import type { AllFields, InferField } from './fields';
import {
  PTR_SIZE,
  calculateFieldSize,
  readFieldValue,
  writeFieldValue,
  type Bytes,
} from './utils';

declare global {
  namespace globalThis {
    const ___STRUCTS_SETUP___: {
      pack: Bytes;
      stringToPointer: (str: string) => bigint;
      pointerToString: (ptr: bigint) => string;
    } | null;
  }
}

export function setupStruct({
  pack,
  stringToPointer,
  pointerToString,
}: {
  pack: Bytes;
  stringToPointer: (str: string) => bigint;
  pointerToString: (ptr: bigint) => string;
}) {
  Reflect.defineProperty(globalThis, '___STRUCTS_SETUP___', {
    value: {
      pack,
      stringToPointer,
      pointerToString,
    },
    writable: false,
    configurable: false,
    enumerable: false,
  });
}

export function prepareObject<F extends AllFields>(field: F): InferField<F> {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }

  // Respect explicit default if provided
  const metaDefault = (field as any).meta?.default;
  if (metaDefault !== undefined) {
    return metaDefault as InferField<F>;
  }

  // Pointer storage defaults to null pointer
  if ((field as any).meta?.isPointer) {
    return 0n as unknown as InferField<F>;
  }

  switch (field.type) {
    case 'bool':
      return false as InferField<F>;
    case 'u8':
    case 'u16':
    case 'u32':
    case 'i8':
    case 'i16':
    case 'i32':
    case 'f32':
    case 'f64':
      return 0 as InferField<F>;
    case 'u64':
    case 'i64':
    case 'void':
      return 0n as InferField<F>;
    case 'string':
      return '' as InferField<F>;
    case 'array': {
      const length = (field.length as number) ?? 0;
      if (typeof length !== 'number' || length <= 0) {
        // dynamic array -> pointer default
        return 0n as unknown as InferField<F>;
      }
      const result: unknown[] = new Array(length);
      for (let i = 0; i < length; i++) {
        result[i] = prepareObject(field.to as AllFields);
      }
      return result as InferField<F>;
    }
    case 'struct': {
      const out: Record<string, unknown> = {};
      for (const [key, child] of Object.entries(field.fields)) {
        out[key] = prepareObject(child as AllFields);
      }
      return out as InferField<F>;
    }
    default:
      // Fallback for completeness; shouldn't be reached.
      return 0 as InferField<F>;
  }
}

export function objectToBuffer<F extends AllFields>(
  field: F,
  value: InferField<F>,
): Uint8Array<ArrayBufferLike> {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }
  const options = ___STRUCTS_SETUP___!;

  const pack = options.pack ?? PTR_SIZE;
  const { size } = calculateFieldSize(field, pack);
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);

  writeFieldValue(field, value, view, 0, options);

  return new Uint8Array(buffer);
}

export function bufferToObject<F extends AllFields>(
  field: F,
  value: Uint8Array<ArrayBufferLike>,
): InferField<F> {
  if (typeof ___STRUCTS_SETUP___ === 'undefined') {
    throw new Error('Structs not setup. Please call setupStruct first.');
  }
  const options = ___STRUCTS_SETUP___!;
  const arrayView = value instanceof Uint8Array ? value : new Uint8Array(value);
  const dataView = new DataView(
    arrayView.buffer,
    arrayView.byteOffset,
    arrayView.byteLength,
  );

  return readFieldValue(field, dataView, 0, options);
}
