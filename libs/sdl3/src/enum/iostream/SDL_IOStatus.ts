/**
 * @description https://wiki.libsdl.org/SDL3/SDL_IOStatus
 */
export enum SDL_IOStatus {
  SDL_IO_STATUS_READY /**< Everything is ready (no errors and not EOF). */,
  SDL_IO_STATUS_ERROR /**< Read or write I/O error */,
  SDL_IO_STATUS_EOF /**< End of file */,
  SDL_IO_STATUS_NOT_READY /**< Non blocking I/O, not ready */,
  SDL_IO_STATUS_READONLY /**< Tried to write a read-only buffer */,
  SDL_IO_STATUS_WRITEONLY /**< Tried to read a write-only buffer */,
}
