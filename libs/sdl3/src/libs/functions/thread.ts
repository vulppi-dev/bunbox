import type { FFIFunction } from 'bun:ffi';

export const THREAD_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CleanupTLS
   */
  SDL_CleanupTLS: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateThread
   */
  SDL_CreateThread: { args: ['ptr', 'cstring', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateThreadWithProperties
   */
  SDL_CreateThreadWithProperties: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DetachThread
   */
  SDL_DetachThread: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentThreadID
   */
  SDL_GetCurrentThreadID: { args: [], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetThreadID
   */
  SDL_GetThreadID: { args: ['ptr'], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetThreadName
   */
  SDL_GetThreadName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetThreadState
   */
  SDL_GetThreadState: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTLS
   */
  SDL_GetTLS: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetCurrentThreadPriority
   */
  SDL_SetCurrentThreadPriority: { args: ['u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTLS
   */
  SDL_SetTLS: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitThread
   */
  SDL_WaitThread: { args: ['ptr', 'ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
