/**
 * @description https://wiki.libsdl.org/SDL3/SDL_BlendFactor
 */
export enum SDL_BlendFactor {
  SDL_BLENDFACTOR_ZERO = 0x1 /**< 0, 0, 0, 0 */,
  SDL_BLENDFACTOR_ONE = 0x2 /**< 1, 1, 1, 1 */,
  SDL_BLENDFACTOR_SRC_COLOR = 0x3 /**< srcR, srcG, srcB, srcA */,
  SDL_BLENDFACTOR_ONE_MINUS_SRC_COLOR = 0x4 /**< 1-srcR, 1-srcG, 1-srcB, 1-srcA */,
  SDL_BLENDFACTOR_SRC_ALPHA = 0x5 /**< srcA, srcA, srcA, srcA */,
  SDL_BLENDFACTOR_ONE_MINUS_SRC_ALPHA = 0x6 /**< 1-srcA, 1-srcA, 1-srcA, 1-srcA */,
  SDL_BLENDFACTOR_DST_COLOR = 0x7 /**< dstR, dstG, dstB, dstA */,
  SDL_BLENDFACTOR_ONE_MINUS_DST_COLOR = 0x8 /**< 1-dstR, 1-dstG, 1-dstB, 1-dstA */,
  SDL_BLENDFACTOR_DST_ALPHA = 0x9 /**< dstA, dstA, dstA, dstA */,
  SDL_BLENDFACTOR_ONE_MINUS_DST_ALPHA = 0xa /**< 1-dstA, 1-dstA, 1-dstA, 1-dstA */,
}
