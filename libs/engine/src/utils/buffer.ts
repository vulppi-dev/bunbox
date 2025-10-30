import { type Pointer, read } from 'bun:ffi';

export function pointerCopyBuffer(ptr: Pointer, bfr: Uint8Array) {
  for (let i = 0; i < bfr.byteLength; i++) {
    bfr[i] = read.u8(ptr, i);
  }
}

export function pointerToBuffer(ptr: Pointer, length: number) {
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = read.u8(ptr, i);
  }
  return buffer;
}
