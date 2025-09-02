import type { FFIFunction } from 'bun:ffi'

export const ENDIAN_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Swap16
   */
  // SDL_Swap16: { args: ['u16'], returns: 'u16' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Swap32
   */
  // SDL_Swap32: { args: ['u32'], returns: 'u32' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Swap64
   */
  // SDL_Swap64: { args: ['u64'], returns: 'u64' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SwapFloat
   */
  // SDL_SwapFloat: { args: ['f32'], returns: 'f32' }, --- NOT FOUND ---
} as const satisfies Record<string, FFIFunction>
