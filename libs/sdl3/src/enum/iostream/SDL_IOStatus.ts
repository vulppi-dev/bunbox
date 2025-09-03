/**
 * @description https://wiki.libsdl.org/SDL3/SDL_IOStatus
 */
export enum SDL_IOStatus {
  /**< Everything is ready (no errors and not EOF). */
  SDL_IO_STATUS_READY,
  /**< Read or write I/O error */
  SDL_IO_STATUS_ERROR,
  /**< End of file */
  SDL_IO_STATUS_EOF,
  /**< Non blocking I/O, not ready */
  SDL_IO_STATUS_NOT_READY,
  /**< Tried to write a read-only buffer */
  SDL_IO_STATUS_READONLY,
  /**< Tried to read a write-only buffer */
  SDL_IO_STATUS_WRITEONLY,
}
