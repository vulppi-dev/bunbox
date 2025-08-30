/**
 * @description https://wiki.libsdl.org/SDL3/SDL_IOWhence
 */
export enum SDL_IOWhence {
  SDL_IO_SEEK_SET /**< Seek from the beginning of data */,
  SDL_IO_SEEK_CUR /**< Seek relative to current read point */,
  SDL_IO_SEEK_END /**< Seek relative to the end of data */,
}
