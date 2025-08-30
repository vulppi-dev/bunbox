/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUShaderFormat
 */
export enum SDL_GPUShaderFormat {
  SDL_GPU_SHADERFORMAT_INVALID = 0,
  /**< Shaders for NDA'd platforms. */
  SDL_GPU_SHADERFORMAT_PRIVATE = 1 << 0,
  /**< SPIR-V shaders for Vulkan. */
  SDL_GPU_SHADERFORMAT_SPIRV = 1 << 1,
  /**< DXBC SM5_1 shaders for D3D12. */
  SDL_GPU_SHADERFORMAT_DXBC = 1 << 2,
  /**< DXIL SM6_0 shaders for D3D12. */
  SDL_GPU_SHADERFORMAT_DXIL = 1 << 3,
  /**< MSL shaders for Metal. */
  SDL_GPU_SHADERFORMAT_MSL = 1 << 4,
  /**< Precompiled metallib shaders for Metal. */
  SDL_GPU_SHADERFORMAT_METALLIB = 1 << 5,
}
