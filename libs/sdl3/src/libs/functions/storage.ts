import type { FFIFunction } from 'bun:ffi';

export const STORAGE_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseStorage
   */
  SDL_CloseStorage: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CopyStorageFile
   */
  SDL_CopyStorageFile: { args: ['ptr', 'cstring', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateStorageDirectory
   */
  SDL_CreateStorageDirectory: { args: ['ptr', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EnumerateStorageDirectory
   */
  SDL_EnumerateStorageDirectory: {
    args: ['ptr', 'cstring', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetStorageFileSize
   */
  SDL_GetStorageFileSize: { args: ['ptr', 'cstring', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetStoragePathInfo
   */
  SDL_GetStoragePathInfo: { args: ['ptr', 'cstring', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetStorageSpaceRemaining
   */
  SDL_GetStorageSpaceRemaining: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GlobStorageDirectory
   */
  SDL_GlobStorageDirectory: {
    args: ['ptr', 'cstring', 'cstring', 'u32', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenFileStorage
   */
  SDL_OpenFileStorage: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenStorage
   */
  SDL_OpenStorage: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenTitleStorage
   */
  SDL_OpenTitleStorage: { args: ['cstring', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_OpenUserStorage
   */
  SDL_OpenUserStorage: { args: ['cstring', 'cstring', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadStorageFile
   */
  SDL_ReadStorageFile: {
    args: ['ptr', 'cstring', 'ptr', 'u64'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveStoragePath
   */
  SDL_RemoveStoragePath: { args: ['ptr', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenameStoragePath
   */
  SDL_RenameStoragePath: {
    args: ['ptr', 'cstring', 'cstring'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StorageReady
   */
  SDL_StorageReady: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteStorageFile
   */
  SDL_WriteStorageFile: {
    args: ['ptr', 'cstring', 'ptr', 'u64'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
