import type { FFIFunction } from 'bun:ffi';

export const HAPTIC_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseHaptic
   */
  SDL_CloseHaptic: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateHapticEffect
   */
  SDL_CreateHapticEffect: { args: ['ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyHapticEffect
   */
  SDL_DestroyHapticEffect: { args: ['ptr', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticEffectStatus
   */
  SDL_GetHapticEffectStatus: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticFeatures
   */
  SDL_GetHapticFeatures: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticFromID
   */
  SDL_GetHapticFromID: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticID
   */
  SDL_GetHapticID: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticName
   */
  SDL_GetHapticName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHapticNameForID
   */
  SDL_GetHapticNameForID: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetHaptics
   */
  SDL_GetHaptics: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMaxHapticEffects
   */
  SDL_GetMaxHapticEffects: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMaxHapticEffectsPlaying
   */
  SDL_GetMaxHapticEffectsPlaying: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumHapticAxes
   */
  SDL_GetNumHapticAxes: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HapticEffectSupported
   */
  SDL_HapticEffectSupported: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HapticRumbleSupported
   */
  SDL_HapticRumbleSupported: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_InitHapticRumble
   */
  SDL_InitHapticRumble: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsJoystickHaptic
   */
  SDL_IsJoystickHaptic: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsMouseHaptic
   */
  SDL_IsMouseHaptic: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenHaptic
   */
  SDL_OpenHaptic: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenHapticFromJoystick
   */
  SDL_OpenHapticFromJoystick: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenHapticFromMouse
   */
  SDL_OpenHapticFromMouse: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PauseHaptic
   */
  SDL_PauseHaptic: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PlayHapticRumble
   */
  SDL_PlayHapticRumble: { args: ['ptr', 'f32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ResumeHaptic
   */
  SDL_ResumeHaptic: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RunHapticEffect
   */
  SDL_RunHapticEffect: { args: ['ptr', 'i32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHapticAutocenter
   */
  SDL_SetHapticAutocenter: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetHapticGain
   */
  SDL_SetHapticGain: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StopHapticEffect
   */
  SDL_StopHapticEffect: { args: ['ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StopHapticEffects
   */
  SDL_StopHapticEffects: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StopHapticRumble
   */
  SDL_StopHapticRumble: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateHapticEffect
   */
  SDL_UpdateHapticEffect: { args: ['ptr', 'i32', 'ptr'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
