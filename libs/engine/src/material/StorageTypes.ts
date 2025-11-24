/**
 * Shared helpers for storage buffer material properties.
 */
export type StorageBufferValue = ArrayBuffer | ArrayBufferView;

export function isStorageValue(value: unknown): value is StorageBufferValue {
  return (
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value as ArrayBufferView)
  );
}
