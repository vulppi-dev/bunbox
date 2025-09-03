import type { FFIFunction } from 'bun:ffi';

export const DIALOG_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowFileDialogWithProperties
   */
  SDL_ShowFileDialogWithProperties: {
    args: ['u32', 'ptr', 'ptr', 'u32'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowOpenFileDialog
   */
  SDL_ShowOpenFileDialog: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'i32', 'cstring', 'bool'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowOpenFolderDialog
   */
  SDL_ShowOpenFolderDialog: {
    args: ['ptr', 'ptr', 'ptr', 'cstring', 'bool'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShowSaveFileDialog
   */
  SDL_ShowSaveFileDialog: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'i32', 'cstring'],
    returns: 'void',
  },
} as const satisfies Record<string, FFIFunction>;
