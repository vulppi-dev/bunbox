import type { FFIFunction } from 'bun:ffi';

export const METAL_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Metal_CreateView
   */
  SDL_Metal_CreateView: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Metal_DestroyView
   */
  SDL_Metal_DestroyView: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Metal_GetLayer
   */
  SDL_Metal_GetLayer: { args: ['ptr'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>;
