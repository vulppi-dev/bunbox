/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPULoadOp
 */
export enum SDL_GPULoadOp {
  /**< The previous contents of the texture will be preserved. */
  SDL_GPU_LOADOP_LOAD,
  /**< The contents of the texture will be cleared to a color. */
  SDL_GPU_LOADOP_CLEAR,
  /**< The previous contents of the texture need not be preserved. The contents will be undefined. */
  SDL_GPU_LOADOP_DONT_CARE,
}
