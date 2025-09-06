import type { FFIFunction } from 'bun:ffi';

export const VIDEO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreatePopupWindow
   */
  SDL_CreatePopupWindow: {
    args: ['ptr', 'i32', 'i32', 'i32', 'i32', 'u32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindow
   */
  SDL_CreateWindow: { args: ['cstring', 'i32', 'i32', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindowWithProperties
   */
  SDL_CreateWindowWithProperties: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyWindow
   */
  SDL_DestroyWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyWindowSurface
   */
  SDL_DestroyWindowSurface: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DisableScreenSaver
   */
  SDL_DisableScreenSaver: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetCurrentConfig
   */
  SDL_EGL_GetCurrentConfig: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetCurrentDisplay
   */
  SDL_EGL_GetCurrentDisplay: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetProcAddress
   */
  SDL_EGL_GetProcAddress: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetWindowSurface
   */
  SDL_EGL_GetWindowSurface: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_SetAttributeCallbacks
   */
  SDL_EGL_SetAttributeCallbacks: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnableScreenSaver
   */
  SDL_EnableScreenSaver: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlashWindow
   */
  SDL_FlashWindow: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetClosestFullscreenDisplayMode
   */
  SDL_GetClosestFullscreenDisplayMode: {
    args: ['u32', 'i32', 'i32', 'f32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentDisplayMode
   */
  SDL_GetCurrentDisplayMode: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentDisplayOrientation
   */
  SDL_GetCurrentDisplayOrientation: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentVideoDriver
   */
  SDL_GetCurrentVideoDriver: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDesktopDisplayMode
   */
  SDL_GetDesktopDisplayMode: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayBounds
   */
  SDL_GetDisplayBounds: { args: ['u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayContentScale
   */
  SDL_GetDisplayContentScale: { args: ['u32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForPoint
   */
  SDL_GetDisplayForPoint: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForRect
   */
  SDL_GetDisplayForRect: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForWindow
   */
  SDL_GetDisplayForWindow: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayName
   */
  SDL_GetDisplayName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayProperties
   */
  SDL_GetDisplayProperties: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplays
   */
  SDL_GetDisplays: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayUsableBounds
   */
  SDL_GetDisplayUsableBounds: { args: ['u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetFullscreenDisplayModes
   */
  SDL_GetFullscreenDisplayModes: { args: ['u32', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGrabbedWindow
   */
  SDL_GetGrabbedWindow: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNaturalDisplayOrientation
   */
  SDL_GetNaturalDisplayOrientation: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumVideoDrivers
   */
  SDL_GetNumVideoDrivers: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPrimaryDisplay
   */
  SDL_GetPrimaryDisplay: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSystemTheme
   */
  SDL_GetSystemTheme: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetVideoDriver
   */
  SDL_GetVideoDriver: { args: ['i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowAspectRatio
   */
  SDL_GetWindowAspectRatio: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowBordersSize
   */
  SDL_GetWindowBordersSize: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowDisplayScale
   */
  SDL_GetWindowDisplayScale: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFlags
   */
  SDL_GetWindowFlags: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFromID
   */
  SDL_GetWindowFromID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFullscreenMode
   */
  SDL_GetWindowFullscreenMode: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowICCProfile
   */
  SDL_GetWindowICCProfile: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowID
   */
  SDL_GetWindowID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowKeyboardGrab
   */
  SDL_GetWindowKeyboardGrab: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMaximumSize
   */
  SDL_GetWindowMaximumSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMinimumSize
   */
  SDL_GetWindowMinimumSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseGrab
   */
  SDL_GetWindowMouseGrab: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseRect
   */
  SDL_GetWindowMouseRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowOpacity
   */
  SDL_GetWindowOpacity: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowParent
   */
  SDL_GetWindowParent: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPixelDensity
   */
  SDL_GetWindowPixelDensity: { args: ['ptr'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPixelFormat
   */
  SDL_GetWindowPixelFormat: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPosition
   */
  SDL_GetWindowPosition: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProgressState
   */
  // SDL_GetWindowProgressState: { args: ['ptr'], returns: 'u32' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProgressValue
   */
  // SDL_GetWindowProgressValue: { args: ['ptr'], returns: 'f32' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProperties
   */
  SDL_GetWindowProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindows
   */
  SDL_GetWindows: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSafeArea
   */
  SDL_GetWindowSafeArea: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSize
   */
  SDL_GetWindowSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSizeInPixels
   */
  SDL_GetWindowSizeInPixels: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSurface
   */
  SDL_GetWindowSurface: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSurfaceVSync
   */
  SDL_GetWindowSurfaceVSync: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowTitle
   */
  SDL_GetWindowTitle: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_CreateContext
   */
  SDL_GL_CreateContext: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_DestroyContext
   */
  SDL_GL_DestroyContext: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_ExtensionSupported
   */
  SDL_GL_ExtensionSupported: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetAttribute
   */
  SDL_GL_GetAttribute: { args: ['u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetCurrentContext
   */
  SDL_GL_GetCurrentContext: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetCurrentWindow
   */
  SDL_GL_GetCurrentWindow: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetProcAddress
   */
  SDL_GL_GetProcAddress: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetSwapInterval
   */
  SDL_GL_GetSwapInterval: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_LoadLibrary
   */
  SDL_GL_LoadLibrary: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_MakeCurrent
   */
  SDL_GL_MakeCurrent: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_ResetAttributes
   */
  SDL_GL_ResetAttributes: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SetAttribute
   */
  SDL_GL_SetAttribute: { args: ['u32', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SetSwapInterval
   */
  SDL_GL_SetSwapInterval: { args: ['i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SwapWindow
   */
  SDL_GL_SwapWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_UnloadLibrary
   */
  SDL_GL_UnloadLibrary: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HideWindow
   */
  SDL_HideWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MaximizeWindow
   */
  SDL_MaximizeWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MinimizeWindow
   */
  SDL_MinimizeWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RaiseWindow
   */
  SDL_RaiseWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RestoreWindow
   */
  SDL_RestoreWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ScreenSaverEnabled
   */
  SDL_ScreenSaverEnabled: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowAlwaysOnTop
   */
  SDL_SetWindowAlwaysOnTop: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowAspectRatio
   */
  SDL_SetWindowAspectRatio: { args: ['ptr', 'f32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowBordered
   */
  SDL_SetWindowBordered: { args: ['ptr', 'bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFocusable
   */
  SDL_SetWindowFocusable: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFullscreen
   */
  SDL_SetWindowFullscreen: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFullscreenMode
   */
  SDL_SetWindowFullscreenMode: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowHitTest
   */
  SDL_SetWindowHitTest: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowIcon
   */
  SDL_SetWindowIcon: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowKeyboardGrab
   */
  SDL_SetWindowKeyboardGrab: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMaximumSize
   */
  SDL_SetWindowMaximumSize: { args: ['ptr', 'i32', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMinimumSize
   */
  SDL_SetWindowMinimumSize: { args: ['ptr', 'i32', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowModal
   */
  SDL_SetWindowModal: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseGrab
   */
  SDL_SetWindowMouseGrab: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseRect
   */
  SDL_SetWindowMouseRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowOpacity
   */
  SDL_SetWindowOpacity: { args: ['ptr', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowParent
   */
  SDL_SetWindowParent: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowPosition
   */
  SDL_SetWindowPosition: { args: ['ptr', 'i32', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowProgressState
   */
  // SDL_SetWindowProgressState: { args: ['ptr', 'u32'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowProgressValue
   */
  // SDL_SetWindowProgressValue: { args: ['ptr', 'f32'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowResizable
   */
  SDL_SetWindowResizable: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowShape
   */
  SDL_SetWindowShape: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowSize
   */
  SDL_SetWindowSize: { args: ['ptr', 'i32', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowSurfaceVSync
   */
  SDL_SetWindowSurfaceVSync: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowTitle
   */
  SDL_SetWindowTitle: { args: ['ptr', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowWindow
   */
  SDL_ShowWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowWindowSystemMenu
   */
  SDL_ShowWindowSystemMenu: { args: ['ptr', 'i32', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SyncWindow
   */
  SDL_SyncWindow: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateWindowSurface
   */
  SDL_UpdateWindowSurface: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateWindowSurfaceRects
   */
  SDL_UpdateWindowSurfaceRects: {
    args: ['ptr', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WindowHasSurface
   */
  SDL_WindowHasSurface: { args: ['ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
