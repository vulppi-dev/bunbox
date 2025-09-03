import type { FFIFunction } from 'bun:ffi';

export const LOCALE_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPreferredLocales
   */
  SDL_GetPreferredLocales: { args: ['ptr'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>;
