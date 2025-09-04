import type { FFIFunction } from 'bun:ffi';

export const POWER_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPowerInfo
   */
  SDL_GetPowerInfo: { args: ['ptr', 'ptr'], returns: 'u32' },
} as const satisfies Record<string, FFIFunction>;
