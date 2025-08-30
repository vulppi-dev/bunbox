import type { FFIFunction } from 'bun:ffi';

export const ERROR_BINDINGS = {
  SDL_GetError: { args: [], returns: 'cstring' },
} as const satisfies Record<string, FFIFunction>;
