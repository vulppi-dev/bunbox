import type { FFIFunction } from 'bun:ffi';

export const ERROR_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearError
   */
  SDL_ClearError: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetError
   */
  SDL_GetError: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OutOfMemory
   */
  SDL_OutOfMemory: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetError
   */
  SDL_SetError: { args: ['cstring', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetErrorV
   */
  SDL_SetErrorV: { args: ['cstring', 'ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
