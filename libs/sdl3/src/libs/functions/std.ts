import type { FFIFunction } from 'bun:ffi';

export const STD_BINDINGS = {
  SDL_free: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
