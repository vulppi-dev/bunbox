import type { FFIFunction } from 'bun:ffi';

export const DARWIN_FUNCTIONS = {} as const satisfies Record<
  string,
  FFIFunction
>;
export const LINUX_FUNCTIONS = {} as const satisfies Record<
  string,
  FFIFunction
>;
export const WINDOWS_FUNCTIONS = {} as const satisfies Record<
  string,
  FFIFunction
>;
