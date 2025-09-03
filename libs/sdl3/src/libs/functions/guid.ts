import type { FFIFunction } from 'bun:ffi';

export const GUID_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GUIDToString
   */
  SDL_GUIDToString: { args: ['ptr', 'cstring', 'i32'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StringToGUID
   */
  SDL_StringToGUID: { args: ['ptr', 'cstring', 'i32'], returns: 'ptr' },
} as const satisfies Record<string, FFIFunction>;
