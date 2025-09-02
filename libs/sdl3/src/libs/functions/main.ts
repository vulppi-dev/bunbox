import type { FFIFunction } from 'bun:ffi'

export const MAIN_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/
   */
  //SDL_: {},
} as const satisfies Record<string, FFIFunction>
