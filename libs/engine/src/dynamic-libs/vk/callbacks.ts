import type { FFIFunction } from 'bun:ffi';

export const vkCallback = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;
