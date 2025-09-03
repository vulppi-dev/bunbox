import type { FFIFunction } from 'bun:ffi';

export const SHARED_OBJECT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/
   */
  //SDL_: {},
} as const satisfies Record<string, FFIFunction>;
