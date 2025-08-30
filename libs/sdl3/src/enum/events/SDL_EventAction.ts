/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EventAction
 */
export enum SDL_EventAction {
  SDL_ADDEVENT /**< Add events to the back of the queue. */,
  SDL_PEEKEVENT /**< Check but don't remove events from the queue front. */,
  SDL_GETEVENT /**< Retrieve/remove events from the front of the queue. */,
}
