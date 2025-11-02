import { type Pointer, read } from 'bun:ffi';

export type TypedBufferCtor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | BigUint64ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | BigInt64ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export function pointerCopyBuffer(
  ptr: Pointer,
  bfr: ArrayBuffer,
  offset: number = 0,
) {
  const bfrView = new Uint8Array(bfr);
  for (let i = 0; i < bfr.byteLength; i++) {
    bfrView[i] = read.u8(ptr, i + offset);
  }
}

export function pointerToBuffer<
  Out extends TypedBufferCtor = Uint8ArrayConstructor,
>(ptr: Pointer, length: number, BufferOut?: Out): InstanceType<Out> {
  const buffer = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = read.u8(ptr, i);
  }
  if (!BufferOut || buffer instanceof BufferOut) {
    // @ts-ignore
    return buffer;
  } else {
    // @ts-ignore
    return new BufferOut(buffer.buffer);
  }
}

export function bufferToPointerList(
  buffer: ArrayBuffer | BigUint64Array,
  length: number,
): Pointer[] {
  const safeView = new BigUint64Array(buffer);
  return Array.from({ length }, (_, i) => {
    return Number(safeView[i]) as Pointer;
  });
}
