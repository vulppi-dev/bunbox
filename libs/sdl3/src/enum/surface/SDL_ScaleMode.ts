/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ScaleMode
 */
export enum SDL_ScaleMode {
  SDL_SCALEMODE_INVALID = -1,
  SDL_SCALEMODE_NEAREST /**< nearest pixel sampling */,
  SDL_SCALEMODE_LINEAR /**< linear filtering */,
  SDL_SCALEMODE_PIXELART /**< nearest pixel sampling with improved scaling for pixel art */,
}
