/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUCullMode
 */
export enum SDL_GPUCullMode {
  /**< No triangles are culled. */
  SDL_GPU_CULLMODE_NONE,
  /**< Front-facing triangles are culled. */
  SDL_GPU_CULLMODE_FRONT,
  /**< Back-facing triangles are culled. */
  SDL_GPU_CULLMODE_BACK,
}
