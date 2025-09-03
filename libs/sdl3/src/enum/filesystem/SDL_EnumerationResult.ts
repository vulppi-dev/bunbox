/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EnumerationResult
 */
export enum SDL_EnumerationResult {
  /**< Value that requests that enumeration continue. */
  SDL_ENUM_CONTINUE,
  /**< Value that requests that enumeration stop, successfully. */
  SDL_ENUM_SUCCESS,
  /**< Value that requests that enumeration stop, as a failure. */
  SDL_ENUM_FAILURE,
}
