/**
 * @description https://wiki.libsdl.org/SDL3/SDL_BlendMode
 */
export enum SDL_BlendMode {
  /**< no blending: dstRGBA = srcRGBA */
  SDL_BLENDMODE_NONE = 0x00000000,
  /**< alpha blending: dstRGB = (srcRGB * srcA) + (dstRGB * (1-srcA)), dstA = srcA + (dstA * (1-srcA)) */
  SDL_BLENDMODE_BLEND = 0x00000001,
  /**< pre-multiplied alpha blending: dstRGBA = srcRGBA + (dstRGBA * (1-srcA)) */
  SDL_BLENDMODE_BLEND_PREMULTIPLIED = 0x00000010,
  /**< additive blending: dstRGB = (srcRGB * srcA) + dstRGB, dstA = dstA */
  SDL_BLENDMODE_ADD = 0x00000002,
  /**< pre-multiplied additive blending: dstRGB = srcRGB + dstRGB, dstA = dstA */
  SDL_BLENDMODE_ADD_PREMULTIPLIED = 0x00000020,
  /**< color modulate: dstRGB = srcRGB * dstRGB, dstA = dstA */
  SDL_BLENDMODE_MOD = 0x00000004,
  /**< color multiply: dstRGB = (srcRGB * dstRGB) + (dstRGB * (1-srcA)), dstA = dstA */
  SDL_BLENDMODE_MUL = 0x00000008,
  SDL_BLENDMODE_INVALID = 0x7fffffff,
}
