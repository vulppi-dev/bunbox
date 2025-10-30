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
