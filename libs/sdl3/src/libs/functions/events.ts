import type { FFIFunction } from 'bun:ffi'

export const EVENTS_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PollEvent
   */
  SDL_PollEvent: { args: ['ptr'], returns: 'i32' },
} as const satisfies Record<string, FFIFunction>
