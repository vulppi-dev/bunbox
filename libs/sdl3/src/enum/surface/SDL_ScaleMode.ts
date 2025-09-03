/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ScaleMode
 */
export enum SDL_ScaleMode {
  SDL_SCALEMODE_INVALID = -1,
  /**< nearest pixel sampling */
  SDL_SCALEMODE_NEAREST,
  /**< linear filtering */
  SDL_SCALEMODE_LINEAR,
  /**< nearest pixel sampling with improved scaling for pixel art */
  SDL_SCALEMODE_PIXELART,
}
