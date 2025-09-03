import type { FFIFunction } from 'bun:ffi';

export const VIDEO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/
   */
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreatePopupWindow
   */
  // SDL_CreatePopupWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindow
   */
  SDL_CreateWindow: { args: ['cstring', 'i32', 'i32', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindowWithProperties
   */
  // SDL_CreateWindowWithProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyWindow
   */
  SDL_DestroyWindow: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyWindowSurface
   */
  // SDL_DestroyWindowSurface: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DisableScreenSaver
   */
  // SDL_DisableScreenSaver: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetCurrentConfig
   */
  // SDL_EGL_GetCurrentConfig: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetCurrentDisplay
   */
  // SDL_EGL_GetCurrentDisplay: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetProcAddress
   */
  // SDL_EGL_GetProcAddress: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_GetWindowSurface
   */
  // SDL_EGL_GetWindowSurface: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EGL_SetAttributeCallbacks
   */
  // SDL_EGL_SetAttributeCallbacks: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnableScreenSaver
   */
  // SDL_EnableScreenSaver: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlashWindow
   */
  // SDL_FlashWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetClosestFullscreenDisplayMode
   */
  // SDL_GetClosestFullscreenDisplayMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentDisplayMode
   */
  // SDL_GetCurrentDisplayMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentDisplayOrientation
   */
  // SDL_GetCurrentDisplayOrientation: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentVideoDriver
   */
  // SDL_GetCurrentVideoDriver: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDesktopDisplayMode
   */
  // SDL_GetDesktopDisplayMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayBounds
   */
  // SDL_GetDisplayBounds: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayContentScale
   */
  // SDL_GetDisplayContentScale: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForPoint
   */
  // SDL_GetDisplayForPoint: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForRect
   */
  // SDL_GetDisplayForRect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayForWindow
   */
  // SDL_GetDisplayForWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayName
   */
  // SDL_GetDisplayName: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayProperties
   */
  // SDL_GetDisplayProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplays
   */
  // SDL_GetDisplays: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDisplayUsableBounds
   */
  // SDL_GetDisplayUsableBounds: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetFullscreenDisplayModes
   */
  // SDL_GetFullscreenDisplayModes: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGrabbedWindow
   */
  // SDL_GetGrabbedWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNaturalDisplayOrientation
   */
  // SDL_GetNaturalDisplayOrientation: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumVideoDrivers
   */
  // SDL_GetNumVideoDrivers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPrimaryDisplay
   */
  // SDL_GetPrimaryDisplay: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSystemTheme
   */
  // SDL_GetSystemTheme: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetVideoDriver
   */
  // SDL_GetVideoDriver: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowAspectRatio
   */
  // SDL_GetWindowAspectRatio: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowBordersSize
   */
  // SDL_GetWindowBordersSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowDisplayScale
   */
  // SDL_GetWindowDisplayScale: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFlags
   */
  SDL_GetWindowFlags: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFromID
   */
  // SDL_GetWindowFromID: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFullscreenMode
   */
  // SDL_GetWindowFullscreenMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowICCProfile
   */
  // SDL_GetWindowICCProfile: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowID
   */
  // SDL_GetWindowID: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowKeyboardGrab
   */
  // SDL_GetWindowKeyboardGrab: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMaximumSize
   */
  // SDL_GetWindowMaximumSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMinimumSize
   */
  // SDL_GetWindowMinimumSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseGrab
   */
  // SDL_GetWindowMouseGrab: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowMouseRect
   */
  // SDL_GetWindowMouseRect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowOpacity
   */
  // SDL_GetWindowOpacity: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowParent
   */
  // SDL_GetWindowParent: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPixelDensity
   */
  // SDL_GetWindowPixelDensity: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPixelFormat
   */
  // SDL_GetWindowPixelFormat: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowPosition
   */
  // SDL_GetWindowPosition: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProgressState
   */
  // SDL_GetWindowProgressState: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProgressValue
   */
  // SDL_GetWindowProgressValue: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowProperties
   */
  // SDL_GetWindowProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindows
   */
  // SDL_GetWindows: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSafeArea
   */
  // SDL_GetWindowSafeArea: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSize
   */
  // SDL_GetWindowSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSizeInPixels
   */
  // SDL_GetWindowSizeInPixels: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSurface
   */
  // SDL_GetWindowSurface: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowSurfaceVSync
   */
  // SDL_GetWindowSurfaceVSync: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowTitle
   */
  // SDL_GetWindowTitle: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_CreateContext
   */
  // SDL_GL_CreateContext: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_DestroyContext
   */
  // SDL_GL_DestroyContext: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_ExtensionSupported
   */
  // SDL_GL_ExtensionSupported: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetAttribute
   */
  // SDL_GL_GetAttribute: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetCurrentContext
   */
  // SDL_GL_GetCurrentContext: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetCurrentWindow
   */
  // SDL_GL_GetCurrentWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetProcAddress
   */
  // SDL_GL_GetProcAddress: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_GetSwapInterval
   */
  // SDL_GL_GetSwapInterval: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_LoadLibrary
   */
  // SDL_GL_LoadLibrary: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_MakeCurrent
   */
  // SDL_GL_MakeCurrent: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_ResetAttributes
   */
  // SDL_GL_ResetAttributes: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SetAttribute
   */
  // SDL_GL_SetAttribute: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SetSwapInterval
   */
  // SDL_GL_SetSwapInterval: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_SwapWindow
   */
  // SDL_GL_SwapWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GL_UnloadLibrary
   */
  // SDL_GL_UnloadLibrary: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HideWindow
   */
  // SDL_HideWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MaximizeWindow
   */
  // SDL_MaximizeWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MinimizeWindow
   */
  // SDL_MinimizeWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RaiseWindow
   */
  // SDL_RaiseWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RestoreWindow
   */
  // SDL_RestoreWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ScreenSaverEnabled
   */
  // SDL_ScreenSaverEnabled: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowAlwaysOnTop
   */
  // SDL_SetWindowAlwaysOnTop: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowAspectRatio
   */
  // SDL_SetWindowAspectRatio: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowBordered
   */
  // SDL_SetWindowBordered: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFocusable
   */
  // SDL_SetWindowFocusable: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFullscreen
   */
  // SDL_SetWindowFullscreen: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowFullscreenMode
   */
  // SDL_SetWindowFullscreenMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowHitTest
   */
  // SDL_SetWindowHitTest: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowIcon
   */
  // SDL_SetWindowIcon: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowKeyboardGrab
   */
  // SDL_SetWindowKeyboardGrab: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMaximumSize
   */
  // SDL_SetWindowMaximumSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMinimumSize
   */
  // SDL_SetWindowMinimumSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowModal
   */
  // SDL_SetWindowModal: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseGrab
   */
  // SDL_SetWindowMouseGrab: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowMouseRect
   */
  // SDL_SetWindowMouseRect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowOpacity
   */
  // SDL_SetWindowOpacity: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowParent
   */
  // SDL_SetWindowParent: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowPosition
   */
  // SDL_SetWindowPosition: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowProgressState
   */
  // SDL_SetWindowProgressState: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowProgressValue
   */
  // SDL_SetWindowProgressValue: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowResizable
   */
  // SDL_SetWindowResizable: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowShape
   */
  // SDL_SetWindowShape: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowSize
   */
  // SDL_SetWindowSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowSurfaceVSync
   */
  // SDL_SetWindowSurfaceVSync: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowTitle
   */
  // SDL_SetWindowTitle: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowWindow
   */
  // SDL_ShowWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowWindowSystemMenu
   */
  // SDL_ShowWindowSystemMenu: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SyncWindow
   */
  // SDL_SyncWindow: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateWindowSurface
   */
  // SDL_UpdateWindowSurface: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateWindowSurfaceRects
   */
  // SDL_UpdateWindowSurfaceRects: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WindowHasSurface
   */
  // SDL_WindowHasSurface: {},
} as const satisfies Record<string, FFIFunction>;
