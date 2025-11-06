import { type Pointer, read } from 'bun:ffi';
import {
  JSCallback,
  type FFIFunction,
  type FFITypeOrString,
  type FFITypeToArgsType,
  type FFITypeToReturnsType,
  type ToFFIType,
} from 'bun:ffi';

type InferFFIFunction<F extends FFIFunction> = (
  ...args: F['args'] extends infer A extends readonly FFITypeOrString[]
    ? { [L in keyof A]: FFITypeToArgsType[ToFFIType<A[L]>] }
    : [unknown] extends [F['args']]
      ? []
      : never
) => [unknown] extends [F['returns']]
  ? undefined
  : FFITypeToReturnsType[ToFFIType<NonNullable<F['returns']>>];

export function cstr(str: string) {
  return Buffer.from(str + '\0', 'utf8');
}

export function buildCallback<
  F extends FFIFunction,
  Fn extends InferFFIFunction<F>,
>(pattern: F, fn: Fn) {
  return new JSCallback(fn as any, pattern);
}

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
