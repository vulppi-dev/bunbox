import type { SDL_AssertState, SDL_HitTestResult } from '$enum'
import { type Pointer } from 'bun:ffi'

// MARK: Assert

export type SDL_AssertionHandler = (
  data: Pointer,
  userdata: Pointer,
) => SDL_AssertState

// MARK: AsyncIO

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIO
 */
export type SDL_AsyncIO = Record<string, unknown> & { __async_io: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOQueue
 */
export type SDL_AsyncIOQueue = Record<string, unknown> & {
  __async_io_queue: undefined
}

// MARK: Atomic

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIO
 */
export type SDL_SpinLock = number & { __spin_lock: undefined }

// MARK: Audio

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioDeviceID
 */
export type SDL_AudioDeviceID = number & { __audio_device_id: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioIterationCallback
 */
export type SDL_AudioIterationCallback = (
  userdata: Pointer,
  devId: SDL_AudioDeviceID,
  start: boolean,
) => void

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioPostmixCallback
 */
export type SDL_AudioPostmixCallback = (
  userdata: Pointer,
  spec: Pointer,
  buffer: Pointer,
  bufferLength: number,
) => void

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStream
 */
export type SDL_AudioStream = Pointer & { __audio_stream: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStreamCallback
 */
export type SDL_AudioStreamCallback = (
  userdata: Pointer,
  stream: Pointer,
  additionalAmount: number,
  totalAmount: number,
) => void

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStreamDataCompleteCallback
 */
export type SDL_AudioStreamDataCompleteCallback = (
  userdata: Pointer,
  buffer: Pointer,
  bufferLength: number,
) => void

// MARK: Camera

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Camera
 */
export type SDL_Camera = Record<string, unknown> & { __camera: undefined }

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CameraID
 */
export type SDL_CameraID = number & { __camera_id: undefined }

// MARK: Timer

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TimerCallback
 */
export type SDL_TimerCallback = (
  userdata: Pointer,
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
export type SDL_EGLAttribArrayCallback = (userdata: Pointer) => SDL_EGLAttrib

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
  userdata: Pointer,
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
