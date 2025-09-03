/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUPrimitiveType
 */
export enum SDL_GPUPrimitiveType {
  /**< A series of separate triangles. */
  SDL_GPU_PRIMITIVETYPE_TRIANGLELIST,
  /**< A series of connected triangles. */
  SDL_GPU_PRIMITIVETYPE_TRIANGLESTRIP,
  /**< A series of separate lines. */
  SDL_GPU_PRIMITIVETYPE_LINELIST,
  /**< A series of connected lines. */
  SDL_GPU_PRIMITIVETYPE_LINESTRIP,
  /**< A series of separate points. */
  SDL_GPU_PRIMITIVETYPE_POINTLIST,
}
