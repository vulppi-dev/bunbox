import type { FFIFunction } from 'bun:ffi';

export const MESSAGEBOX_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowMessageBox
   */
  SDL_ShowMessageBox: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowSimpleMessageBox
   */
  SDL_ShowSimpleMessageBox: {
    args: ['u32', 'cstring', 'cstring', 'ptr'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
