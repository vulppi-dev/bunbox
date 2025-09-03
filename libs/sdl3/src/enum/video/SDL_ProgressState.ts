/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ProgressState
 */
export enum SDL_ProgressState {
  /**< An invalid progress state indicating an error; check SDL_GetError() */
  SDL_PROGRESS_STATE_INVALID = -1,
  /**< No progress bar is shown */
  SDL_PROGRESS_STATE_NONE,
  /**< The progress bar is shown in a indeterminate state */
  SDL_PROGRESS_STATE_INDETERMINATE,
  /**< The progress bar is shown in a normal state */
  SDL_PROGRESS_STATE_NORMAL,
  /**< The progress bar is shown in a paused state */
  SDL_PROGRESS_STATE_PAUSED,
  /**< The progress bar is shown in a state indicating the application had an error */
  SDL_PROGRESS_STATE_ERROR,
}
