/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBufferUsageFlags
 */
export enum SDL_GPUBufferUsageFlags {
  /**< Buffer is a vertex buffer. */
  SDL_GPU_BUFFERUSAGE_VERTEX = 1 << 0,
  /**< Buffer is an index buffer. */
  SDL_GPU_BUFFERUSAGE_INDEX = 1 << 1,
  /**< Buffer is an indirect buffer. */
  SDL_GPU_BUFFERUSAGE_INDIRECT = 1 << 2,
  /**< Buffer supports storage reads in graphics stages. */
  SDL_GPU_BUFFERUSAGE_GRAPHICS_STORAGE_READ = 1 << 3,
  /**< Buffer supports storage reads in the compute stage. */
  SDL_GPU_BUFFERUSAGE_COMPUTE_STORAGE_READ = 1 << 4,
  /**< Buffer supports storage writes in the compute stage. */
  SDL_GPU_BUFFERUSAGE_COMPUTE_STORAGE_WRITE = 1 << 5,
}
