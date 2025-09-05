import type { FFIFunction } from 'bun:ffi';

export const SYSTEM_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidActivity
   */
  SDL_GetAndroidActivity: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidCachePath
   */
  SDL_GetAndroidCachePath: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidExternalStoragePath
   */
  SDL_GetAndroidExternalStoragePath: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidExternalStorageState
   */
  SDL_GetAndroidExternalStorageState: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidInternalStoragePath
   */
  SDL_GetAndroidInternalStoragePath: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidJNIEnv
   */
  SDL_GetAndroidJNIEnv: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAndroidSDKVersion
   */
  SDL_GetAndroidSDKVersion: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDirect3D9AdapterIndex
   */
  SDL_GetDirect3D9AdapterIndex: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDXGIOutputInfo
   */
  SDL_GetDXGIOutputInfo: { args: ['u32', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGDKDefaultUser
   */
  SDL_GetGDKDefaultUser: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGDKTaskQueue
   */
  SDL_GetGDKTaskQueue: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSandbox
   */
  SDL_GetSandbox: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsChromebook
   */
  SDL_IsChromebook: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsDeXMode
   */
  SDL_IsDeXMode: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsTablet
   */
  SDL_IsTablet: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsTV
   */
  SDL_IsTV: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationDidChangeStatusBarOrientation
   */
  SDL_OnApplicationDidChangeStatusBarOrientation: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationDidEnterBackground
   */
  SDL_OnApplicationDidEnterBackground: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationDidEnterForeground
   */
  SDL_OnApplicationDidEnterForeground: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationDidReceiveMemoryWarning
   */
  SDL_OnApplicationDidReceiveMemoryWarning: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationWillEnterBackground
   */
  SDL_OnApplicationWillEnterBackground: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationWillEnterForeground
   */
  SDL_OnApplicationWillEnterForeground: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OnApplicationWillTerminate
   */
  SDL_OnApplicationWillTerminate: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RequestAndroidPermission
   */
  SDL_RequestAndroidPermission: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SendAndroidBackButton
   */
  SDL_SendAndroidBackButton: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SendAndroidMessage
   */
  SDL_SendAndroidMessage: { args: ['u32', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetiOSAnimationCallback
   */
  SDL_SetiOSAnimationCallback: {
    args: ['ptr', 'i32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetiOSEventPump
   */
  SDL_SetiOSEventPump: { args: ['bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLinuxThreadPriority
   */
  SDL_SetLinuxThreadPriority: { args: ['i64', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetLinuxThreadPriorityAndPolicy
   */
  SDL_SetLinuxThreadPriorityAndPolicy: {
    args: ['i64', 'i32', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetWindowsMessageHook
   */
  SDL_SetWindowsMessageHook: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetX11EventHook
   */
  SDL_SetX11EventHook: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowAndroidToast
   */
  SDL_ShowAndroidToast: {
    args: ['cstring', 'i32', 'i32', 'i32', 'i32'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
