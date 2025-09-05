/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SurfaceFlags
 */
export enum SDL_SurfaceFlags {
  /**< Surface uses preallocated pixel memory */
  SDL_SURFACE_PREALLOCATED = 0x00000001,
  /**< Surface needs to be locked to access pixels */
  SDL_SURFACE_LOCK_NEEDED = 0x00000002,
  /**< Surface is currently locked */
  SDL_SURFACE_LOCKED = 0x00000004,
  /**< Surface uses pixel memory allocated with SDL_aligned_alloc() */
  SDL_SURFACE_SIMD_ALIGNED = 0x00000008,
}
