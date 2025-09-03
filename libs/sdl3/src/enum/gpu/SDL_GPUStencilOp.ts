/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUStencilOp
 */
export enum SDL_GPUStencilOp {
  SDL_GPU_STENCILOP_INVALID,
  /**< Keeps the current value. */
  SDL_GPU_STENCILOP_KEEP,
  /**< Sets the value to 0. */
  SDL_GPU_STENCILOP_ZERO,
  /**< Sets the value to reference. */
  SDL_GPU_STENCILOP_REPLACE,
  /**< Increments the current value and clamps to the maximum value. */
  SDL_GPU_STENCILOP_INCREMENT_AND_CLAMP,
  /**< Decrements the current value and clamps to 0. */
  SDL_GPU_STENCILOP_DECREMENT_AND_CLAMP,
  /**< Bitwise-inverts the current value. */
  SDL_GPU_STENCILOP_INVERT,
  /**< Increments the current value and wraps back to 0. */
  SDL_GPU_STENCILOP_INCREMENT_AND_WRAP,
  /**< Decrements the current value and wraps to the maximum value. */
  SDL_GPU_STENCILOP_DECREMENT_AND_WRAP,
}
