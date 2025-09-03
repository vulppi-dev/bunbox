import type { FFIFunction } from 'bun:ffi';

export const MISC_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenURL
   */
  SDL_OpenURL: { args: ['cstring'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
