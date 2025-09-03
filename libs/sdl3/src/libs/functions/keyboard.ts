import type { FFIFunction } from 'bun:ffi'

export const KEYBOARD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearComposition
   */
  SDL_ClearComposition: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyboardFocus
   */
  SDL_GetKeyboardFocus: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyboardNameForID
   */
  SDL_GetKeyboardNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyboards
   */
  SDL_GetKeyboards: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyboardState
   */
  SDL_GetKeyboardState: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyFromName
   */
  SDL_GetKeyFromName: { args: ['cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyFromScancode
   */
  SDL_GetKeyFromScancode: { args: ['u32', 'u32', 'bool'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetKeyName
   */
  SDL_GetKeyName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetModState
   */
  SDL_GetModState: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetScancodeFromKey
   */
  SDL_GetScancodeFromKey: { args: ['u32', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetScancodeFromName
   */
  SDL_GetScancodeFromName: { args: ['cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetScancodeName
   */
  SDL_GetScancodeName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextInputArea
   */
  SDL_GetTextInputArea: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasKeyboard
   */
  SDL_HasKeyboard: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasScreenKeyboardSupport
   */
  SDL_HasScreenKeyboardSupport: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResetKeyboard
   */
  SDL_ResetKeyboard: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ScreenKeyboardShown
   */
  SDL_ScreenKeyboardShown: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetModState
   */
  SDL_SetModState: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetScancodeName
   */
  SDL_SetScancodeName: { args: ['u32', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextInputArea
   */
  SDL_SetTextInputArea: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StartTextInput
   */
  SDL_StartTextInput: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StartTextInputWithProperties
   */
  SDL_StartTextInputWithProperties: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StopTextInput
   */
  SDL_StopTextInput: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TextInputActive
   */
  SDL_TextInputActive: { args: ['ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>
