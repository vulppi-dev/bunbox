/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOTaskType
 */
export enum SDL_AsyncIOTaskType {
  /**< A read operation. */
  SDL_ASYNCIO_TASK_READ,
  /**< A write operation. */
  SDL_ASYNCIO_TASK_WRITE,
  /**< A close operation. */
  SDL_ASYNCIO_TASK_CLOSE,
}
