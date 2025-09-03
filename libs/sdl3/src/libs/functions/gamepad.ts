import type { FFIFunction } from 'bun:ffi'

export const GAMEPAD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddGamepadMapping
   */
  SDL_AddGamepadMapping: { args: ['cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddGamepadMappingsFromFile
   */
  SDL_AddGamepadMappingsFromFile: { args: ['cstring'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddGamepadMappingsFromIO
   */
  SDL_AddGamepadMappingsFromIO: { args: ['ptr', 'bool'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseGamepad
   */
  SDL_CloseGamepad: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadConnected
   */
  SDL_GamepadConnected: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadEventsEnabled
   */
  SDL_GamepadEventsEnabled: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadHasAxis
   */
  SDL_GamepadHasAxis: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadHasButton
   */
  SDL_GamepadHasButton: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadHasSensor
   */
  SDL_GamepadHasSensor: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GamepadSensorEnabled
   */
  SDL_GamepadSensorEnabled: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadAppleSFSymbolsNameForAxis
   */
  SDL_GetGamepadAppleSFSymbolsNameForAxis: {
    args: ['ptr', 'u32'],
    returns: 'cstring',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadAppleSFSymbolsNameForButton
   */
  SDL_GetGamepadAppleSFSymbolsNameForButton: {
    args: ['ptr', 'u32'],
    returns: 'cstring',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadAxis
   */
  SDL_GetGamepadAxis: { args: ['ptr', 'u32'], returns: 'i16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadAxisFromString
   */
  SDL_GetGamepadAxisFromString: { args: ['cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadBindings
   */
  SDL_GetGamepadBindings: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadButton
   */
  SDL_GetGamepadButton: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadButtonFromString
   */
  SDL_GetGamepadButtonFromString: { args: ['cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadButtonLabel
   */
  SDL_GetGamepadButtonLabel: { args: ['ptr', 'u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadButtonLabelForType
   */
  SDL_GetGamepadButtonLabelForType: { args: ['u32', 'u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadConnectionState
   */
  SDL_GetGamepadConnectionState: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadFirmwareVersion
   */
  SDL_GetGamepadFirmwareVersion: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadFromID
   */
  SDL_GetGamepadFromID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadFromPlayerIndex
   */
  SDL_GetGamepadFromPlayerIndex: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadGUIDForID
   */
  SDL_GetGamepadGUIDForID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadID
   */
  SDL_GetGamepadID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadJoystick
   */
  SDL_GetGamepadJoystick: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadMapping
   */
  SDL_GetGamepadMapping: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadMappingForGUID
   */
  SDL_GetGamepadMappingForGUID: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadMappingForID
   */
  SDL_GetGamepadMappingForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadMappings
   */
  SDL_GetGamepadMappings: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadName
   */
  SDL_GetGamepadName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadNameForID
   */
  SDL_GetGamepadNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadPath
   */
  SDL_GetGamepadPath: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadPathForID
   */
  SDL_GetGamepadPathForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadPlayerIndex
   */
  SDL_GetGamepadPlayerIndex: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadPlayerIndexForID
   */
  SDL_GetGamepadPlayerIndexForID: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadPowerInfo
   */
  SDL_GetGamepadPowerInfo: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadProduct
   */
  SDL_GetGamepadProduct: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadProductForID
   */
  SDL_GetGamepadProductForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadProductVersion
   */
  SDL_GetGamepadProductVersion: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadProductVersionForID
   */
  SDL_GetGamepadProductVersionForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadProperties
   */
  SDL_GetGamepadProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepads
   */
  SDL_GetGamepads: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadSensorData
   */
  SDL_GetGamepadSensorData: {
    args: ['ptr', 'u32', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadSensorDataRate
   */
  SDL_GetGamepadSensorDataRate: { args: ['ptr', 'u32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadSerial
   */
  SDL_GetGamepadSerial: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadSteamHandle
   */
  SDL_GetGamepadSteamHandle: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadStringForAxis
   */
  SDL_GetGamepadStringForAxis: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadStringForButton
   */
  SDL_GetGamepadStringForButton: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadStringForType
   */
  SDL_GetGamepadStringForType: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadTouchpadFinger
   */
  SDL_GetGamepadTouchpadFinger: {
    args: ['ptr', 'i32', 'i32', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadType
   */
  SDL_GetGamepadType: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadTypeForID
   */
  SDL_GetGamepadTypeForID: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadTypeFromString
   */
  SDL_GetGamepadTypeFromString: { args: ['cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadVendor
   */
  SDL_GetGamepadVendor: { args: ['ptr'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGamepadVendorForID
   */
  SDL_GetGamepadVendorForID: { args: ['u32'], returns: 'u16' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumGamepadTouchpadFingers
   */
  SDL_GetNumGamepadTouchpadFingers: { args: ['ptr', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumGamepadTouchpads
   */
  SDL_GetNumGamepadTouchpads: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRealGamepadType
   */
  SDL_GetRealGamepadType: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRealGamepadTypeForID
   */
  SDL_GetRealGamepadTypeForID: { args: ['u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasGamepad
   */
  SDL_HasGamepad: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsGamepad
   */
  SDL_IsGamepad: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenGamepad
   */
  SDL_OpenGamepad: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReloadGamepadMappings
   */
  SDL_ReloadGamepadMappings: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RumbleGamepad
   */
  SDL_RumbleGamepad: { args: ['ptr', 'u16', 'u16', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RumbleGamepadTriggers
   */
  SDL_RumbleGamepadTriggers: {
    args: ['ptr', 'u16', 'u16', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SendGamepadEffect
   */
  SDL_SendGamepadEffect: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGamepadEventsEnabled
   */
  SDL_SetGamepadEventsEnabled: { args: ['bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGamepadLED
   */
  SDL_SetGamepadLED: { args: ['ptr', 'u8', 'u8', 'u8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGamepadMapping
   */
  SDL_SetGamepadMapping: { args: ['u32', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGamepadPlayerIndex
   */
  SDL_SetGamepadPlayerIndex: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGamepadSensorEnabled
   */
  SDL_SetGamepadSensorEnabled: {
    args: ['ptr', 'u32', 'bool'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateGamepads
   */
  SDL_UpdateGamepads: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
