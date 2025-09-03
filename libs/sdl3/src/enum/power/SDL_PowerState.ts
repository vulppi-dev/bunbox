/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PowerState
 */
export enum SDL_PowerState {
  /**< error determining power status */
  SDL_POWERSTATE_ERROR = -1,
  /**< cannot determine power status */
  SDL_POWERSTATE_UNKNOWN,
  /**< Not plugged in, running on the battery */
  SDL_POWERSTATE_ON_BATTERY,
  /**< Plugged in, no battery available */
  SDL_POWERSTATE_NO_BATTERY,
  /**< Plugged in, charging battery */
  SDL_POWERSTATE_CHARGING,
  /**< Plugged in, battery charged */
  SDL_POWERSTATE_CHARGED,
}
