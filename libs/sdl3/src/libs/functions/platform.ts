import type { FFIFunction } from 'bun:ffi';

export const PLATFORM_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPlatform
   */
  SDL_GetPlatform: { args: [], returns: 'cstring' },
} as const satisfies Record<string, FFIFunction>;
