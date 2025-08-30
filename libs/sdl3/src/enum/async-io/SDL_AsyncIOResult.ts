/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOResult
 */
export enum SDL_AsyncIOResult {
  SDL_ASYNCIO_COMPLETE /**< request was completed without error */,
  SDL_ASYNCIO_FAILURE /**< request failed for some reason; check SDL_GetError()! */,
  SDL_ASYNCIO_CANCELED /**< request was canceled before completing. */,
}
