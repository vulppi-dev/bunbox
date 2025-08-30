/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AssertState
 */
export enum SDL_AssertState {
  SDL_ASSERTION_RETRY /**< Retry the assert immediately. */,
  SDL_ASSERTION_BREAK /**< Make the debugger trigger a breakpoint. */,
  SDL_ASSERTION_ABORT /**< Terminate the program. */,
  SDL_ASSERTION_IGNORE /**< Ignore the assert. */,
  SDL_ASSERTION_ALWAYS_IGNORE /**< Ignore the assert from now on. */,
}
