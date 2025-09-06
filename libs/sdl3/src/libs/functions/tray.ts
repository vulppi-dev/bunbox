import type { FFIFunction } from 'bun:ffi';

export const TRAY_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClickTrayEntry
   */
  SDL_ClickTrayEntry: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTray
   */
  SDL_CreateTray: { args: ['ptr', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTrayMenu
   */
  SDL_CreateTrayMenu: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTraySubmenu
   */
  SDL_CreateTraySubmenu: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyTray
   */
  SDL_DestroyTray: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayEntries
   */
  SDL_GetTrayEntries: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayEntryChecked
   */
  SDL_GetTrayEntryChecked: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayEntryEnabled
   */
  SDL_GetTrayEntryEnabled: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayEntryLabel
   */
  SDL_GetTrayEntryLabel: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayEntryParent
   */
  SDL_GetTrayEntryParent: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayMenu
   */
  SDL_GetTrayMenu: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayMenuParentEntry
   */
  SDL_GetTrayMenuParentEntry: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTrayMenuParentTray
   */
  SDL_GetTrayMenuParentTray: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTraySubmenu
   */
  SDL_GetTraySubmenu: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_InsertTrayEntryAt
   */
  SDL_InsertTrayEntryAt: {
    args: ['ptr', 'i32', 'cstring', 'u32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_IsTraySupported
   */
  // SDL_IsTraySupported: { args: [], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveTrayEntry
   */
  SDL_RemoveTrayEntry: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayEntryCallback
   */
  SDL_SetTrayEntryCallback: { args: ['ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayEntryChecked
   */
  SDL_SetTrayEntryChecked: { args: ['ptr', 'bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayEntryEnabled
   */
  SDL_SetTrayEntryEnabled: { args: ['ptr', 'bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayEntryLabel
   */
  SDL_SetTrayEntryLabel: { args: ['ptr', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayIcon
   */
  SDL_SetTrayIcon: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTrayTooltip
   */
  SDL_SetTrayTooltip: { args: ['ptr', 'cstring'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateTrays
   */
  SDL_UpdateTrays: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
