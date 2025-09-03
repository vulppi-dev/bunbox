import type { FFIFunction } from 'bun:ffi';

export const TIMER_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddTimer
   */
  SDL_AddTimer: { args: ['u32', 'ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddTimerNS
   */
  SDL_AddTimerNS: { args: ['u64', 'ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Delay
   */
  SDL_Delay: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DelayNS
   */
  SDL_DelayNS: { args: ['u64'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DelayPrecise
   */
  SDL_DelayPrecise: { args: ['u32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPerformanceCounter
   */
  SDL_GetPerformanceCounter: { args: [], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPerformanceFrequency
   */
  SDL_GetPerformanceFrequency: { args: [], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTicks
   */
  SDL_GetTicks: { args: [], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTicksNS
   */
  SDL_GetTicksNS: { args: [], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveTimer
   */
  SDL_RemoveTimer: { args: ['u32'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
