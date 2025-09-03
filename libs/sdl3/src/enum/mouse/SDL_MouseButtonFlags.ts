/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseButtonFlags
 */
export enum SDL_MouseButtonFlags {
  SDL_BUTTON_LEFT = 1,
  SDL_BUTTON_MIDDLE = 2,
  SDL_BUTTON_RIGHT = 3,
  SDL_BUTTON_X1 = 4,
  SDL_BUTTON_X2 = 5,

  SDL_BUTTON_LMASK = 1 << (SDL_BUTTON_LEFT - 1),
  SDL_BUTTON_MMASK = 1 << (SDL_BUTTON_MIDDLE - 1),
  SDL_BUTTON_RMASK = 1 << (SDL_BUTTON_RIGHT - 1),
  SDL_BUTTON_X1MASK = 1 << (SDL_BUTTON_X1 - 1),
  SDL_BUTTON_X2MASK = 1 << (SDL_BUTTON_X2 - 1),
}
