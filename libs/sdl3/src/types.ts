import type { SDL_HitTestResult } from '$enum'
import type { Pointer } from '@bunbox/struct'

// MARK: Timer

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TimerCallback
 */
export type SDL_TimerCallback = (
  userdata: any,
  timerId: SDL_TimerID,
  interval: number,
) => number

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TimerID
 */
export type SDL_TimerID = number & { __time_id: undefined }

// MARK: Video

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayID
 */
export type SDL_DisplayID = number & { __display_id: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayModeData
 */
export type SDL_DisplayModeData = Record<string, unknown> & {
  __display_mode_data: undefined
}

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLAttrib
 */
export type SDL_EGLAttrib = Pointer & { __egl_attrib: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLAttribArrayCallback
 */
export type SDL_EGLAttribArrayCallback = (userdata: any) => SDL_EGLAttrib

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLConfig
 */
export type SDL_EGLConfig = Pointer & { __egl_config: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLDisplay
 */
export type SDL_EGLDisplay = Pointer & { __egl_display: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLint
 */
export type SDL_EGLint = number & { __egl_int: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLIntArrayCallback
 */
export type SDL_EGLIntArrayCallback = (
  userdata: any,
  display: SDL_EGLDisplay,
  config: SDL_EGLConfig,
) => SDL_EGLint

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLSurface
 */
export type SDL_EGLSurface = Pointer & { __egl_surface: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GLContext
 */
export type SDL_GLContext = Pointer & { __gl_context: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HitTest
 */
export type SDL_HitTest = (
  win: Pointer,
  area: Pointer,
  data: Pointer,
) => SDL_HitTestResult

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Window
 */
export type SDL_Window = Record<string, unknown> & { __window: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_WindowID
 */
export type SDL_WindowID = number & { __window_id: undefined }
