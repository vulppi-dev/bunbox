import type { FFIFunction } from 'bun:ffi'

export const ASYNC_IO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOFromFile
   */
  SDL_AsyncIOFromFile: { args: ['cstring', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CloseAsyncIO
   */
  SDL_CloseAsyncIO: { args: ['ptr', 'bool', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateAsyncIOQueue
   */
  SDL_CreateAsyncIOQueue: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyAsyncIOQueue
   */
  SDL_DestroyAsyncIOQueue: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAsyncIOResult
   */
  SDL_GetAsyncIOResult: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAsyncIOSize
   */
  SDL_GetAsyncIOSize: { args: ['ptr'], returns: 'i64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadFileAsync
   */
  SDL_LoadFileAsync: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadAsyncIO
   */
  SDL_ReadAsyncIO: {
    args: ['ptr', 'ptr', 'u64', 'u64', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SignalAsyncIOQueue
   */
  SDL_SignalAsyncIOQueue: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitAsyncIOResult
   */
  SDL_WaitAsyncIOResult: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteAsyncIO
   */
  SDL_WriteAsyncIO: {
    args: ['ptr', 'ptr', 'u64', 'u64', 'ptr', 'ptr'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>
