import type { FFIFunction } from 'bun:ffi'

export const JOYSTICK_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AttachVirtualJoystick
   */
  SDL_AttachVirtualJoystick: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseJoystick
   */
  SDL_CloseJoystick: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DetachVirtualJoystick
   */
  SDL_DetachVirtualJoystick: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickAxis
   */
  SDL_GetJoystickAxis: { args: ['ptr', 'i32'], returns: 'i16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickAxisInitialState
   */
  SDL_GetJoystickAxisInitialState: {
    args: ['ptr', 'i32', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickBall
   */
  SDL_GetJoystickBall: { args: ['ptr', 'i32', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickButton
   */
  SDL_GetJoystickButton: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickConnectionState
   */
  SDL_GetJoystickConnectionState: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickFirmwareVersion
   */
  SDL_GetJoystickFirmwareVersion: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickFromID
   */
  SDL_GetJoystickFromID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickFromPlayerIndex
   */
  SDL_GetJoystickFromPlayerIndex: { args: ['i32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickGUID
   */
  SDL_GetJoystickGUID: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickGUIDForID
   */
  SDL_GetJoystickGUIDForID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickGUIDInfo
   */
  SDL_GetJoystickGUIDInfo: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickHat
   */
  SDL_GetJoystickHat: { args: ['ptr', 'i32'], returns: 'u8' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickID
   */
  SDL_GetJoystickID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickName
   */
  SDL_GetJoystickName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickNameForID
   */
  SDL_GetJoystickNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickPath
   */
  SDL_GetJoystickPath: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickPathForID
   */
  SDL_GetJoystickPathForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickPlayerIndex
   */
  SDL_GetJoystickPlayerIndex: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickPlayerIndexForID
   */
  SDL_GetJoystickPlayerIndexForID: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickPowerInfo
   */
  SDL_GetJoystickPowerInfo: { args: ['ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickProduct
   */
  SDL_GetJoystickProduct: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickProductForID
   */
  SDL_GetJoystickProductForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickProductVersion
   */
  SDL_GetJoystickProductVersion: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickProductVersionForID
   */
  SDL_GetJoystickProductVersionForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickProperties
   */
  SDL_GetJoystickProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoysticks
   */
  SDL_GetJoysticks: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickSerial
   */
  SDL_GetJoystickSerial: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickType
   */
  SDL_GetJoystickType: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickTypeForID
   */
  SDL_GetJoystickTypeForID: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickVendor
   */
  SDL_GetJoystickVendor: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetJoystickVendorForID
   */
  SDL_GetJoystickVendorForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumJoystickAxes
   */
  SDL_GetNumJoystickAxes: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumJoystickBalls
   */
  SDL_GetNumJoystickBalls: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumJoystickButtons
   */
  SDL_GetNumJoystickButtons: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumJoystickHats
   */
  SDL_GetNumJoystickHats: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasJoystick
   */
  SDL_HasJoystick: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsJoystickVirtual
   */
  SDL_IsJoystickVirtual: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_JoystickConnected
   */
  SDL_JoystickConnected: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_JoystickEventsEnabled
   */
  SDL_JoystickEventsEnabled: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockJoysticks
   */
  SDL_LockJoysticks: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenJoystick
   */
  SDL_OpenJoystick: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RumbleJoystick
   */
  SDL_RumbleJoystick: { args: ['ptr', 'u16', 'u16', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RumbleJoystickTriggers
   */
  SDL_RumbleJoystickTriggers: {
    args: ['ptr', 'u16', 'u16', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SendJoystickEffect
   */
  SDL_SendJoystickEffect: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SendJoystickVirtualSensorData
   */
  SDL_SendJoystickVirtualSensorData: {
    args: ['ptr', 'i32', 'u64', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickEventsEnabled
   */
  SDL_SetJoystickEventsEnabled: { args: ['bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickLED
   */
  SDL_SetJoystickLED: { args: ['ptr', 'u8', 'u8', 'u8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickPlayerIndex
   */
  SDL_SetJoystickPlayerIndex: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickVirtualAxis
   */
  SDL_SetJoystickVirtualAxis: { args: ['ptr', 'i32', 'i16'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickVirtualBall
   */
  SDL_SetJoystickVirtualBall: {
    args: ['ptr', 'i32', 'i16', 'i16'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickVirtualButton
   */
  SDL_SetJoystickVirtualButton: {
    args: ['ptr', 'i32', 'bool'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickVirtualHat
   */
  SDL_SetJoystickVirtualHat: { args: ['ptr', 'i32', 'u8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetJoystickVirtualTouchpad
   */
  SDL_SetJoystickVirtualTouchpad: {
    args: ['ptr', 'i32', 'i32', 'bool', 'f32', 'f32', 'f32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockJoysticks
   */
  SDL_UnlockJoysticks: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateJoysticks
   */
  SDL_UpdateJoysticks: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
