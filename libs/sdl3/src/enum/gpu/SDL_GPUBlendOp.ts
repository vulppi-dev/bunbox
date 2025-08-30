/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBlendOp
 */
export enum SDL_GPUBlendOp {
  SDL_GPU_BLENDOP_INVALID,
  SDL_GPU_BLENDOP_ADD /**< (source * source_factor) + (destination * destination_factor) */,
  SDL_GPU_BLENDOP_SUBTRACT /**< (source * source_factor) - (destination * destination_factor) */,
  SDL_GPU_BLENDOP_REVERSE_SUBTRACT /**< (destination * destination_factor) - (source * source_factor) */,
  SDL_GPU_BLENDOP_MIN /**< min(source, destination) */,
  SDL_GPU_BLENDOP_MAX /**< max(source, destination) */,
}
