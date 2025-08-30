/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUStoreOp
 */
export enum SDL_GPUStoreOp {
  SDL_GPU_STOREOP_STORE /**< The contents generated during the render pass will be written to memory. */,
  SDL_GPU_STOREOP_DONT_CARE /**< The contents generated during the render pass are not needed and may be discarded. The contents will be undefined. */,
  SDL_GPU_STOREOP_RESOLVE /**< The multisample contents generated during the render pass will be resolved to a non-multisample texture. The contents in the multisample texture may then be discarded and will be undefined. */,
  SDL_GPU_STOREOP_RESOLVE_AND_STORE /**< The multisample contents generated during the render pass will be resolved to a non-multisample texture. The contents in the multisample texture will be written to memory. */,
}
