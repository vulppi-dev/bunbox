/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ProcessIO
 */
export enum SDL_ProcessIO {
  SDL_PROCESS_STDIO_INHERITED /**< The I/O stream is inherited from the application. */,
  SDL_PROCESS_STDIO_NULL /**< The I/O stream is ignored. */,
  SDL_PROCESS_STDIO_APP /**< The I/O stream is connected to a new SDL_IOStream that the application can read or write */,
  SDL_PROCESS_STDIO_REDIRECT /**< The I/O stream is redirected to an existing SDL_IOStream. */,
}
