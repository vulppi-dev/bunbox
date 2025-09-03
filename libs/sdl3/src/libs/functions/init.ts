import type { FFIFunction } from 'bun:ffi'

export const INIT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAppMetadataProperty
   */
  SDL_GetAppMetadataProperty: { args: ['cstring'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Init
   */
  SDL_Init: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_InitSubSystem
   */
  SDL_InitSubSystem: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsMainThread
   */
  SDL_IsMainThread: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Quit
   */
  SDL_Quit: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_QuitSubSystem
   */
  SDL_QuitSubSystem: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RunOnMainThread
   */
  SDL_RunOnMainThread: { args: ['ptr', 'ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAppMetadata
   */
  SDL_SetAppMetadata: {
    args: ['cstring', 'cstring', 'cstring'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAppMetadataProperty
   */
  SDL_SetAppMetadataProperty: { args: ['cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WasInit
   */
  SDL_WasInit: { args: ['u32'], returns: 'u32' },
} as const satisfies Record<string, FFIFunction>
