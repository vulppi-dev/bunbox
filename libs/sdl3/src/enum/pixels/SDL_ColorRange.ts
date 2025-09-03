/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ColorRange
 */
export enum SDL_ColorRange {
  SDL_COLOR_RANGE_UNKNOWN = 0,
  /**< Narrow range, e.g. 16-235 for 8-bit RGB and luma, and 16-240 for 8-bit chroma */
  SDL_COLOR_RANGE_LIMITED = 1,
  /**< Full range, e.g. 0-255 for 8-bit RGB and luma, and 1-255 for 8-bit chroma */
  SDL_COLOR_RANGE_FULL = 2,
}
