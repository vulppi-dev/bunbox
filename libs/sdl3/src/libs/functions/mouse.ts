import type { FFIFunction } from 'bun:ffi';

export const MOUSE_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CaptureMouse
   */
  SDL_CaptureMouse: { args: ['bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateColorCursor
   */
  SDL_CreateColorCursor: { args: ['ptr', 'i32', 'i32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateCursor
   */
  SDL_CreateCursor: {
    args: ['ptr', 'ptr', 'i32', 'i32', 'i32', 'i32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSystemCursor
   */
  SDL_CreateSystemCursor: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CursorVisible
   */
  SDL_CursorVisible: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyCursor
   */
  SDL_DestroyCursor: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCursor
   */
  SDL_GetCursor: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultCursor
   */
  SDL_GetDefaultCursor: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGlobalMouseState
   */
  SDL_GetGlobalMouseState: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMice
   */
  SDL_GetMice: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMouseFocus
   */
  SDL_GetMouseFocus: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMouseNameForID
   */
  SDL_GetMouseNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMouseState
   */
  SDL_GetMouseState: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRelativeMouseState
   */
  SDL_GetRelativeMouseState: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseGrab
   */
  SDL_GetWindowMouseGrab: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseRect
   */
  SDL_GetWindowMouseRect: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowRelativeMouseMode
   */
  SDL_GetWindowRelativeMouseMode: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasMouse
   */
  SDL_HasMouse: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HideCursor
   */
  SDL_HideCursor: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetCursor
   */
  SDL_SetCursor: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRelativeMouseTransform
   */
  // SDL_SetRelativeMouseTransform: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseGrab
   */
  SDL_SetWindowMouseGrab: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseRect
   */
  SDL_SetWindowMouseRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowRelativeMouseMode
   */
  SDL_SetWindowRelativeMouseMode: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowCursor
   */
  SDL_ShowCursor: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WarpMouseGlobal
   */
  SDL_WarpMouseGlobal: { args: ['f32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WarpMouseInWindow
   */
  SDL_WarpMouseInWindow: { args: ['ptr', 'f32', 'f32'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
