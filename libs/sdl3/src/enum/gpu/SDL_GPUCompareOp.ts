/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUCompareOp
 */
export enum SDL_GPUCompareOp {
  SDL_GPU_COMPAREOP_INVALID,
  /**< The comparison always evaluates false. */
  SDL_GPU_COMPAREOP_NEVER,
  /**< The comparison evaluates reference < test. */
  SDL_GPU_COMPAREOP_LESS,
  /**< The comparison evaluates reference == test. */
  SDL_GPU_COMPAREOP_EQUAL,
  /**< The comparison evaluates reference <= test. */
  SDL_GPU_COMPAREOP_LESS_OR_EQUAL,
  /**< The comparison evaluates reference > test. */
  SDL_GPU_COMPAREOP_GREATER,
  /**< The comparison evaluates reference != test. */
  SDL_GPU_COMPAREOP_NOT_EQUAL,
  /**< The comparison evaluates reference >= test. */
  SDL_GPU_COMPAREOP_GREATER_OR_EQUAL,
  /**< The comparison always evaluates true. */
  SDL_GPU_COMPAREOP_ALWAYS,
}
