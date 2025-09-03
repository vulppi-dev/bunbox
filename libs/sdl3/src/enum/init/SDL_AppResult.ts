/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AppResult
 */
export enum SDL_AppResult {
  /**< Value that requests that the app continue from the main callbacks. */
  SDL_APP_CONTINUE,
  /**< Value that requests termination with success from the main callbacks. */
  SDL_APP_SUCCESS,
  /**< Value that requests termination with error from the main callbacks. */
  SDL_APP_FAILURE,
}
