import type { FFIFunction } from 'bun:ffi'

export const VIDEO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindow
   */
  SDL_CreateWindow: { args: ['cstring', 'i32', 'i32', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyWindow
   */
  SDL_DestroyWindow: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
