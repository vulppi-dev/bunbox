import type { FFIFunction } from 'bun:ffi'

export const TIMER_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Delay
   */
  SDL_Delay: { args: ['u32'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
