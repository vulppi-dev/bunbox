/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayOrientation
 */
export enum SDL_DisplayOrientation {
  SDL_ORIENTATION_UNKNOWN /**< The display orientation can't be determined */,
  SDL_ORIENTATION_LANDSCAPE /**< The display is in landscape mode, with the right side up, relative to portrait mode */,
  SDL_ORIENTATION_LANDSCAPE_FLIPPED /**< The display is in landscape mode, with the left side up, relative to portrait mode */,
  SDL_ORIENTATION_PORTRAIT /**< The display is in portrait mode */,
  SDL_ORIENTATION_PORTRAIT_FLIPPED /**< The display is in portrait mode, upside down */,
}
