/**
 * Shared helpers for storage buffer material properties.
 */
export type StorageBufferValue = ArrayBuffer | ArrayBufferView;
export type StorageBufferValueOrArray =
  | StorageBufferValue
  | StorageBufferValue[];

export function isStorageValue(value: unknown): value is StorageBufferValue {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value as ArrayBufferView)
  );
}

export function isStorageValueOrArray(
  value: unknown,
): value is StorageBufferValueOrArray {
  if (Array.isArray(value)) {
    return value.every((v) => isStorageValue(v));
  }
  return isStorageValue(value);
}
