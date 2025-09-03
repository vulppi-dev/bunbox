/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ThreadState
 */
export enum SDL_ThreadState {
  /**< The thread is not valid */
  SDL_THREAD_UNKNOWN,
  /**< The thread is currently running */
  SDL_THREAD_ALIVE,
  /**< The thread is detached and can't be waited on */
  SDL_THREAD_DETACHED,
  /**< The thread has finished and should be cleaned up with SDL_WaitThread() */
  SDL_THREAD_COMPLETE,
}
