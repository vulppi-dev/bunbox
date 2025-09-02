import type { FFIFunction } from 'bun:ffi'

export const CLIPBOARD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearClipboardData
   */
  SDL_ClearClipboardData: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetClipboardData
   */
  SDL_GetClipboardData: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetClipboardMimeTypes
   */
  SDL_GetClipboardMimeTypes: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetClipboardText
   */
  SDL_GetClipboardText: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPrimarySelectionText
   */
  SDL_GetPrimarySelectionText: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasClipboardData
   */
  SDL_HasClipboardData: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasClipboardText
   */
  SDL_HasClipboardText: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasPrimarySelectionText
   */
  SDL_HasPrimarySelectionText: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetClipboardData
   */
  SDL_SetClipboardData: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'u64'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetClipboardText
   */
  SDL_SetClipboardText: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetPrimarySelectionText
   */
  SDL_SetPrimarySelectionText: { args: ['cstring'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>
