import type { FFIFunction } from 'bun:ffi';

export const VERSION_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRevision
   */
  SDL_GetRevision: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetVersion
   */
  SDL_GetVersion: { args: [], returns: 'i32' },
} as const satisfies Record<string, FFIFunction>;
