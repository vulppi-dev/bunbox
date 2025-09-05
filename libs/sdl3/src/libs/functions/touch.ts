import type { FFIFunction } from 'bun:ffi';

export const TOUCH_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTouchDeviceName
   */
  SDL_GetTouchDeviceName: { args: ['u64'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTouchDevices
   */
  SDL_GetTouchDevices: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTouchDeviceType
   */
  SDL_GetTouchDeviceType: { args: ['u64'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTouchFingers
   */
  SDL_GetTouchFingers: { args: ['u64', 'ptr'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>;
