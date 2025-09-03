/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MessageBoxFlags
 */
export enum SDL_MessageBoxFlags {
  /**< error dialog */
  SDL_MESSAGEBOX_ERROR = 0x00000010,
  /**< warning dialog */
  SDL_MESSAGEBOX_WARNING = 0x00000020,
  /**< informational dialog */
  SDL_MESSAGEBOX_INFORMATION = 0x00000040,
  /**< buttons placed left to right */
  SDL_MESSAGEBOX_BUTTONS_LEFT_TO_RIGHT = 0x00000080,
  /**< buttons placed right to left */
  SDL_MESSAGEBOX_BUTTONS_RIGHT_TO_LEFT = 0x00000100,
}
