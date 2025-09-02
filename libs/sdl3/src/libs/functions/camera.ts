import type { FFIFunction } from 'bun:ffi'

export const CAMERA_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AcquireCameraFrame
   */
  SDL_AcquireCameraFrame: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseCamera
   */
  SDL_CloseCamera: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraDriver
   */
  SDL_GetCameraDriver: { args: ['i32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraFormat
   */
  SDL_GetCameraFormat: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraID
   */
  SDL_GetCameraID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraName
   */
  SDL_GetCameraName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraPermissionState
   */
  SDL_GetCameraPermissionState: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraPosition
   */
  SDL_GetCameraPosition: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraProperties
   */
  SDL_GetCameraProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameras
   */
  SDL_GetCameras: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCameraSupportedFormats
   */
  SDL_GetCameraSupportedFormats: { args: ['u32', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentCameraDriver
   */
  SDL_GetCurrentCameraDriver: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumCameraDrivers
   */
  SDL_GetNumCameraDrivers: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenCamera
   */
  SDL_OpenCamera: { args: ['u32', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseCameraFrame
   */
  SDL_ReleaseCameraFrame: { args: ['ptr', 'ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
