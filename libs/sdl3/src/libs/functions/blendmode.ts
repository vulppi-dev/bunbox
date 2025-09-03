import type { FFIFunction } from 'bun:ffi';

export const BLENDMODE_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ComposeCustomBlendMode
   */
  SDL_ComposeCustomBlendMode: {
    args: ['u32', 'u32', 'u32', 'u32', 'u32', 'u32'],
    returns: 'u32',
  },
} as const satisfies Record<string, FFIFunction>;
