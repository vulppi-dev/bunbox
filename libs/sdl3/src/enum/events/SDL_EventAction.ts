/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EventAction
 */
export enum SDL_EventAction {
  /**< Add events to the back of the queue. */
  SDL_ADDEVENT,
  /**< Check but don't remove events from the queue front. */
  SDL_PEEKEVENT,
  /**< Retrieve/remove events from the front of the queue. */
  SDL_GETEVENT,
}
