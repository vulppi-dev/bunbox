import type { FFIFunction } from 'bun:ffi';

export const MAIN_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AppEvent
   */
  SDL_AppEvent: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AppInit
   */
  SDL_AppInit: { args: ['ptr', 'i32', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AppIterate
   */
  SDL_AppIterate: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AppQuit
   */
  SDL_AppQuit: { args: ['ptr', 'u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnterAppMainCallbacks
   */
  SDL_EnterAppMainCallbacks: {
    args: ['i32', 'ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'i32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GDKSuspendComplete
   */
  SDL_GDKSuspendComplete: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_main
   */
  SDL_main: { args: ['i32', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RegisterApp
   */
  SDL_RegisterApp: { args: ['cstring', 'u32', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RunApp
   */
  SDL_RunApp: { args: ['i32', 'ptr', 'ptr', 'ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetMainReady
   */
  SDL_SetMainReady: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnregisterApp
   */
  SDL_UnregisterApp: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
