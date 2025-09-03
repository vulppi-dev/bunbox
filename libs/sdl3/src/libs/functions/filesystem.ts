import type { FFIFunction } from 'bun:ffi';

export const FILESYSTEM_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CopyFile
   */
  SDL_CopyFile: { args: ['cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateDirectory
   */
  SDL_CreateDirectory: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnumerateDirectory
   */
  SDL_EnumerateDirectory: { args: ['cstring', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetBasePath
   */
  SDL_GetBasePath: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentDirectory
   */
  SDL_GetCurrentDirectory: { args: [], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPathInfo
   */
  SDL_GetPathInfo: { args: ['cstring', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPrefPath
   */
  SDL_GetPrefPath: { args: ['cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetUserFolder
   */
  SDL_GetUserFolder: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GlobDirectory
   */
  SDL_GlobDirectory: {
    args: ['cstring', 'cstring', 'u32', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemovePath
   */
  SDL_RemovePath: { args: ['cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenamePath
   */
  SDL_RenamePath: { args: ['cstring', 'cstring'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
