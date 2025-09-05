/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TrayEntryFlags
 */
export enum SDL_TrayEntryFlags {
  /**< Make the entry a simple button. Required. */
  SDL_TRAYENTRY_BUTTON = 0x00000001,
  /**< Make the entry a checkbox. Required. */
  SDL_TRAYENTRY_CHECKBOX = 0x00000002,
  /**< Prepare the entry to have a submenu. Required */
  SDL_TRAYENTRY_SUBMENU = 0x00000004,
  /**< Make the entry disabled. Optional. */
  SDL_TRAYENTRY_DISABLED = 0x80000000,
  /**< Make the entry checked. This is valid only for checkboxes. Optional. */
  SDL_TRAYENTRY_CHECKED = 0x40000000,
}
