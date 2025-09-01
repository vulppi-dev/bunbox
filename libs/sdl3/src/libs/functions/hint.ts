import type { FFIFunction } from 'bun:ffi'

export const HINT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddHintCallback
   */
  // SDL_AddHintCallback: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHint
   */
  // SDL_GetHint: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHintBoolean
   */
  // SDL_GetHintBoolean: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveHintCallback
   */
  // SDL_RemoveHintCallback: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetHint
   */
  // SDL_ResetHint: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetHints
   */
  // SDL_ResetHints: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHint
   */
  SDL_SetHint: { args: ['cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHintWithPriority
   */
  // SDL_SetHintWithPriority: {},
} as const satisfies Record<string, FFIFunction>
