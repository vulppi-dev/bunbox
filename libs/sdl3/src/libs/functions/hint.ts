import type { FFIFunction } from 'bun:ffi';

export const HINT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddHintCallback
   */
  SDL_AddHintCallback: { args: ['cstring', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHint
   */
  SDL_GetHint: { args: ['cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHintBoolean
   */
  SDL_GetHintBoolean: { args: ['cstring', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveHintCallback
   */
  SDL_RemoveHintCallback: { args: ['cstring', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetHint
   */
  SDL_ResetHint: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetHints
   */
  SDL_ResetHints: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHint
   */
  SDL_SetHint: { args: ['cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHintWithPriority
   */
  SDL_SetHintWithPriority: {
    args: ['cstring', 'cstring', 'u32'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
