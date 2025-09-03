/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBlendFactor
 */
export enum SDL_GPUBlendFactor {
  SDL_GPU_BLENDFACTOR_INVALID,
  /**< 0 */
  SDL_GPU_BLENDFACTOR_ZERO,
  /**< 1 */
  SDL_GPU_BLENDFACTOR_ONE,
  /**< source color */
  SDL_GPU_BLENDFACTOR_SRC_COLOR,
  /**< 1 - source color */
  SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_COLOR,
  /**< destination color */
  SDL_GPU_BLENDFACTOR_DST_COLOR,
  /**< 1 - destination color */
  SDL_GPU_BLENDFACTOR_ONE_MINUS_DST_COLOR,
  /**< source alpha */
  SDL_GPU_BLENDFACTOR_SRC_ALPHA,
  /**< 1 - source alpha */
  SDL_GPU_BLENDFACTOR_ONE_MINUS_SRC_ALPHA,
  /**< destination alpha */
  SDL_GPU_BLENDFACTOR_DST_ALPHA,
  /**< 1 - destination alpha */
  SDL_GPU_BLENDFACTOR_ONE_MINUS_DST_ALPHA,
  /**< blend constant */
  SDL_GPU_BLENDFACTOR_CONSTANT_COLOR,
  /**< 1 - blend constant */
  SDL_GPU_BLENDFACTOR_ONE_MINUS_CONSTANT_COLOR,
  /**< min(source alpha, 1 - destination alpha) */
  SDL_GPU_BLENDFACTOR_SRC_ALPHA_SATURATE,
}
