import type { FFIFunction } from 'bun:ffi'

export const BITS_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasExactlyOneBitSet32
   */
  SDL_HasExactlyOneBitSet32: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MostSignificantBitIndex32
   */
  SDL_MostSignificantBitIndex32: { args: ['u32'], returns: 'i32' },
} as const satisfies Record<string, FFIFunction>
