import type { FFIFunction } from 'bun:ffi'

export const IO_STREAM_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadFile
   */
  SDL_LoadFile: { args: ['cstring', 'ptr'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>
