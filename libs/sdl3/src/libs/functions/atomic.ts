import type { FFIFunction } from 'bun:ffi'

export const ATOMIC_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddAtomicInt
   */
  SDL_AddAtomicInt: { args: ['ptr', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddAtomicU32
   */
  SDL_AddAtomicU32: { args: ['ptr', 'i32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CompareAndSwapAtomicInt
   */
  SDL_CompareAndSwapAtomicInt: { args: ['ptr', 'i32', 'i32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CompareAndSwapAtomicPointer
   */
  SDL_CompareAndSwapAtomicPointer: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CompareAndSwapAtomicU32
   */
  SDL_CompareAndSwapAtomicU32: { args: ['ptr', 'u32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAtomicInt
   */
  SDL_GetAtomicInt: { args: ['ptr'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAtomicPointer
   */
  SDL_GetAtomicPointer: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetAtomicU32
   */
  SDL_GetAtomicU32: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockSpinlock
   */
  SDL_LockSpinlock: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MemoryBarrierAcquireFunction
   */
  SDL_MemoryBarrierAcquireFunction: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MemoryBarrierReleaseFunction
   */
  SDL_MemoryBarrierReleaseFunction: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAtomicInt
   */
  SDL_SetAtomicInt: { args: ['ptr', 'i32'], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAtomicPointer
   */
  SDL_SetAtomicPointer: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetAtomicU32
   */
  SDL_SetAtomicU32: { args: ['ptr', 'u32'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_TryLockSpinlock
   */
  SDL_TryLockSpinlock: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockSpinlock
   */
  SDL_UnlockSpinlock: { args: ['ptr'], returns: 'void' },
} as const satisfies Record<string, FFIFunction>
