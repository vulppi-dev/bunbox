import type { AllFields, InferField } from './fields';
import {
  PTR_SIZE,
  calculateFieldSize,
  readFieldValue,
  writeFieldValue,
  type ReadOptions,
  type WriteOptions,
} from './utils';

export type { ReadOptions, WriteOptions } from './utils';

export function toBuffer<F extends AllFields>(
  field: F,
  value: Partial<InferField<F>>,
  options: WriteOptions,
): Uint8Array<ArrayBufferLike> {
  const pack = options.pack ?? PTR_SIZE;
  const { size } = calculateFieldSize(field, pack);
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);

  writeFieldValue(field, value, view, 0, options);

  return new Uint8Array(buffer);
}

export function toObject<F extends AllFields>(
  field: F,
  value: Uint8Array<ArrayBufferLike>,
  options: ReadOptions,
): InferField<F> {
  const arrayView = value instanceof Uint8Array ? value : new Uint8Array(value);
  const dataView = new DataView(
    arrayView.buffer,
    arrayView.byteOffset,
    arrayView.byteLength,
  );

  return readFieldValue(field, dataView, 0, options);
}
