import type { FFIFunction } from 'bun:ffi'

export const EVENTS_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddEventWatch
   */
  SDL_AddEventWatch: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EventEnabled
   */
  SDL_EventEnabled: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FilterEvents
   */
  SDL_FilterEvents: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushEvent
   */
  SDL_FlushEvent: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushEvents
   */
  SDL_FlushEvents: { args: ['u32', 'u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetEventDescription
   */
  // SDL_GetEventDescription: { args: ['ptr', 'cstring', 'i32'], returns: 'i32' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetEventFilter
   */
  SDL_GetEventFilter: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetWindowFromEvent
   */
  SDL_GetWindowFromEvent: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasEvent
   */
  SDL_HasEvent: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasEvents
   */
  SDL_HasEvents: { args: ['u32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PeepEvents
   */
  SDL_PeepEvents: { args: ['ptr', 'i32', 'u32', 'u32', 'u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PollEvent
   */
  SDL_PollEvent: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PumpEvents
   */
  SDL_PumpEvents: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PushEvent
   */
  SDL_PushEvent: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RegisterEvents
   */
  SDL_RegisterEvents: { args: ['i32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveEventWatch
   */
  SDL_RemoveEventWatch: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetEventEnabled
   */
  SDL_SetEventEnabled: { args: ['u32', 'bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetEventFilter
   */
  SDL_SetEventFilter: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitEvent
   */
  SDL_WaitEvent: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitEventTimeout
   */
  SDL_WaitEventTimeout: { args: ['ptr', 'i32'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>
