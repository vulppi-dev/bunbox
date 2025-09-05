import type { FFIFunction } from 'bun:ffi';

export const SHARED_OBJECT_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadFunction
   */
  SDL_LoadFunction: { args: ['ptr', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadObject
   */
  SDL_LoadObject: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnloadObject
   */
  SDL_UnloadObject: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
