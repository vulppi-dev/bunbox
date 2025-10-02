/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureUsageFlags
 */
export enum SDL_GPUTextureUsageFlags {
  /**< Texture supports sampling. */
  SDL_GPU_TEXTUREUSAGE_SAMPLER = 1 << 0,
  /**< Texture is a color render target. */
  SDL_GPU_TEXTUREUSAGE_COLOR_TARGET = 1 << 1,
  /**< Texture is a depth stencil target. */
  SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET = 1 << 2,
  /**< Texture supports storage reads in graphics stages. */
  SDL_GPU_TEXTUREUSAGE_GRAPHICS_STORAGE_READ = 1 << 3,
  /**< Texture supports storage reads in the compute stage. */
  SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_READ = 1 << 4,
  /**< Texture supports storage writes in the compute stage. */
  SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_WRITE = 1 << 5,
  /**< Texture supports reads and writes in the same compute shader. This is NOT equivalent to READ | WRITE. */
  SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_SIMULTANEOUS_READ_WRITE = 1 << 6,
}
