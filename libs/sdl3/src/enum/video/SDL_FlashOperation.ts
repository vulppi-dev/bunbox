/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FlashOperation
 */
export enum SDL_FlashOperation {
  /**< Cancel any window flash state */
  SDL_FLASH_CANCEL,
  /**< Flash the window briefly to get attention */
  SDL_FLASH_BRIEFLY,
  /**< Flash the window until it gets focus */
  SDL_FLASH_UNTIL_FOCUSED,
}
