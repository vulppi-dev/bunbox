import type { FFIFunction } from 'bun:ffi';

export const MUTEX_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BroadcastCondition
   */
  SDL_BroadcastCondition: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateCondition
   */
  SDL_CreateCondition: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateMutex
   */
  SDL_CreateMutex: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateRWLock
   */
  SDL_CreateRWLock: { args: [], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSemaphore
   */
  SDL_CreateSemaphore: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyCondition
   */
  SDL_DestroyCondition: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyMutex
   */
  SDL_DestroyMutex: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyRWLock
   */
  SDL_DestroyRWLock: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroySemaphore
   */
  SDL_DestroySemaphore: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSemaphoreValue
   */
  SDL_GetSemaphoreValue: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockMutex
   */
  SDL_LockMutex: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockRWLockForReading
   */
  SDL_LockRWLockForReading: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockRWLockForWriting
   */
  SDL_LockRWLockForWriting: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetInitialized
   */
  SDL_SetInitialized: { args: ['ptr', 'bool'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShouldInit
   */
  SDL_ShouldInit: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ShouldQuit
   */
  SDL_ShouldQuit: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SignalCondition
   */
  SDL_SignalCondition: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SignalSemaphore
   */
  SDL_SignalSemaphore: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TryLockMutex
   */
  SDL_TryLockMutex: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TryLockRWLockForReading
   */
  SDL_TryLockRWLockForReading: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TryLockRWLockForWriting
   */
  SDL_TryLockRWLockForWriting: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TryWaitSemaphore
   */
  SDL_TryWaitSemaphore: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockMutex
   */
  SDL_UnlockMutex: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockRWLock
   */
  SDL_UnlockRWLock: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitCondition
   */
  SDL_WaitCondition: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitConditionTimeout
   */
  SDL_WaitConditionTimeout: { args: ['ptr', 'ptr', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitSemaphore
   */
  SDL_WaitSemaphore: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitSemaphoreTimeout
   */
  SDL_WaitSemaphoreTimeout: { args: ['ptr', 'i32'], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
