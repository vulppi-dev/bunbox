/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUSamplerAddressMode
 */
export enum SDL_GPUSamplerAddressMode {
  SDL_GPU_SAMPLERADDRESSMODE_REPEAT /**< Specifies that the coordinates will wrap around. */,
  SDL_GPU_SAMPLERADDRESSMODE_MIRRORED_REPEAT /**< Specifies that the coordinates will wrap around mirrored. */,
  SDL_GPU_SAMPLERADDRESSMODE_CLAMP_TO_EDGE /**< Specifies that the coordinates will clamp to the 0-1 range. */,
}
