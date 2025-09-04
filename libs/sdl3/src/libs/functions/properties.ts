import type { FFIFunction } from 'bun:ffi';

export const PROPERTIES_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearProperty
   */
  SDL_ClearProperty: { args: ['u32', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CopyProperties
   */
  SDL_CopyProperties: { args: ['u32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateProperties
   */
  SDL_CreateProperties: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyProperties
   */
  SDL_DestroyProperties: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnumerateProperties
   */
  SDL_EnumerateProperties: { args: ['u32', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetBooleanProperty
   */
  SDL_GetBooleanProperty: { args: ['u32', 'cstring', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetFloatProperty
   */
  SDL_GetFloatProperty: { args: ['u32', 'cstring', 'f32'], returns: 'f32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGlobalProperties
   */
  SDL_GetGlobalProperties: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumberProperty
   */
  SDL_GetNumberProperty: { args: ['u32', 'cstring', 'i64'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPointerProperty
   */
  SDL_GetPointerProperty: { args: ['u32', 'cstring', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPropertyType
   */
  SDL_GetPropertyType: { args: ['u32', 'cstring'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetStringProperty
   */
  SDL_GetStringProperty: {
    args: ['u32', 'cstring', 'cstring'],
    returns: 'cstring',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasProperty
   */
  SDL_HasProperty: { args: ['u32', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockProperties
   */
  SDL_LockProperties: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetBooleanProperty
   */
  SDL_SetBooleanProperty: { args: ['u32', 'cstring', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetFloatProperty
   */
  SDL_SetFloatProperty: { args: ['u32', 'cstring', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetNumberProperty
   */
  SDL_SetNumberProperty: { args: ['u32', 'cstring', 'i64'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetPointerProperty
   */
  SDL_SetPointerProperty: { args: ['u32', 'cstring', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetPointerPropertyWithCleanup
   */
  SDL_SetPointerPropertyWithCleanup: {
    args: ['u32', 'cstring', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetStringProperty
   */
  SDL_SetStringProperty: {
    args: ['u32', 'cstring', 'cstring'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockProperties
   */
  SDL_UnlockProperties: { args: ['u32'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
