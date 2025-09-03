import type { FFIFunction } from 'bun:ffi';

export const STD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_free
   */
  SDL_free: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
