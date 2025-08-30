import type { FFIFunction } from 'bun:ffi'

export const INIT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Init
   */
  SDL_Init: { args: ['u32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Quit
   */
  SDL_Quit: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
