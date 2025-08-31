import type { FFIFunction } from 'bun:ffi'

export const GPU_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AcquireGPUCommandBuffer
   */
  SDL_AcquireGPUCommandBuffer: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AcquireGPUSwapchainTexture
   */
  // SDL_AcquireGPUSwapchainTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BeginGPUComputePass
   */
  // SDL_BeginGPUComputePass: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BeginGPUCopyPass
   */
  // SDL_BeginGPUCopyPass: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BeginGPURenderPass
   */
  SDL_BeginGPURenderPass: {
    args: ['ptr', 'ptr', 'u32', 'ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUComputePipeline
   */
  // SDL_BindGPUComputePipeline: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUComputeSamplers
   */
  // SDL_BindGPUComputeSamplers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUComputeStorageBuffers
   */
  // SDL_BindGPUComputeStorageBuffers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUComputeStorageTextures
   */
  // SDL_BindGPUComputeStorageTextures: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUFragmentSamplers
   */
  // SDL_BindGPUFragmentSamplers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUFragmentStorageBuffers
   */
  // SDL_BindGPUFragmentStorageBuffers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUFragmentStorageTextures
   */
  // SDL_BindGPUFragmentStorageTextures: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUGraphicsPipeline
   */
  SDL_BindGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUIndexBuffer
   */
  // SDL_BindGPUIndexBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUVertexBuffers
   */
  // SDL_BindGPUVertexBuffers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUVertexSamplers
   */
  // SDL_BindGPUVertexSamplers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUVertexStorageBuffers
   */
  // SDL_BindGPUVertexStorageBuffers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BindGPUVertexStorageTextures
   */
  // SDL_BindGPUVertexStorageTextures: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitGPUTexture
   */
  // SDL_BlitGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CalculateGPUTextureFormatSize
   */
  // SDL_CalculateGPUTextureFormatSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CancelGPUCommandBuffer
   */
  // SDL_CancelGPUCommandBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClaimWindowForGPUDevice
   */
  SDL_ClaimWindowForGPUDevice: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CopyGPUBufferToBuffer
   */
  // SDL_CopyGPUBufferToBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CopyGPUTextureToTexture
   */
  // SDL_CopyGPUTextureToTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUBuffer
   */
  // SDL_CreateGPUBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUComputePipeline
   */
  // SDL_CreateGPUComputePipeline: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUDevice
   */
  SDL_CreateGPUDevice: { args: ['u32', 'bool', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUDeviceWithProperties
   */
  // SDL_CreateGPUDeviceWithProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUGraphicsPipeline
   */
  SDL_CreateGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUSampler
   */
  // SDL_CreateGPUSampler: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUShader
   */
  SDL_CreateGPUShader: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUTexture
   */
  // SDL_CreateGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPUTransferBuffer
   */
  // SDL_CreateGPUTransferBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyGPUDevice
   */
  SDL_DestroyGPUDevice: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DispatchGPUCompute
   */
  // SDL_DispatchGPUCompute: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DispatchGPUComputeIndirect
   */
  // SDL_DispatchGPUComputeIndirect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DownloadFromGPUBuffer
   */
  // SDL_DownloadFromGPUBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DownloadFromGPUTexture
   */
  // SDL_DownloadFromGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DrawGPUIndexedPrimitives
   */
  // SDL_DrawGPUIndexedPrimitives: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DrawGPUIndexedPrimitivesIndirect
   */
  // SDL_DrawGPUIndexedPrimitivesIndirect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DrawGPUPrimitives
   */
  SDL_DrawGPUPrimitives: {
    args: ['ptr', 'u32', 'u32', 'u32', 'u32'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DrawGPUPrimitivesIndirect
   */
  // SDL_DrawGPUPrimitivesIndirect: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EndGPUComputePass
   */
  // SDL_EndGPUComputePass: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EndGPUCopyPass
   */
  // SDL_EndGPUCopyPass: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_EndGPURenderPass
   */
  SDL_EndGPURenderPass: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GDKResumeGPU
   */
  // SDL_GDKResumeGPU: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GDKSuspendGPU
   */
  // SDL_GDKSuspendGPU: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GenerateMipmapsForGPUTexture
   */
  // SDL_GenerateMipmapsForGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGPUDeviceDriver
   */
  SDL_GetGPUDeviceDriver: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGPUDeviceProperties
   */
  // SDL_GetGPUDeviceProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGPUDriver
   */
  // SDL_GetGPUDriver: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGPUShaderFormats
   */
  // SDL_GetGPUShaderFormats: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetGPUSwapchainTextureFormat
   */
  SDL_GetGPUSwapchainTextureFormat: { args: ['ptr', 'ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumGPUDrivers
   */
  // SDL_GetNumGPUDrivers: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GPUSupportsProperties
   */
  // SDL_GPUSupportsProperties: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GPUSupportsShaderFormats
   */
  // SDL_GPUSupportsShaderFormats: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureFormatTexelBlockSize
   */
  // SDL_GPUTextureFormatTexelBlockSize: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureSupportsFormat
   */
  // SDL_GPUTextureSupportsFormat: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureSupportsSampleCount
   */
  // SDL_GPUTextureSupportsSampleCount: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_InsertGPUDebugLabel
   */
  // SDL_InsertGPUDebugLabel: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapGPUTransferBuffer
   */
  // SDL_MapGPUTransferBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PopGPUDebugGroup
   */
  // SDL_PopGPUDebugGroup: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PushGPUComputeUniformData
   */
  // SDL_PushGPUComputeUniformData: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PushGPUDebugGroup
   */
  // SDL_PushGPUDebugGroup: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PushGPUFragmentUniformData
   */
  // SDL_PushGPUFragmentUniformData: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PushGPUVertexUniformData
   */
  // SDL_PushGPUVertexUniformData: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_QueryGPUFence
   */
  // SDL_QueryGPUFence: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUBuffer
   */
  // SDL_ReleaseGPUBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUComputePipeline
   */
  // SDL_ReleaseGPUComputePipeline: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUFence
   */
  // SDL_ReleaseGPUFence: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUGraphicsPipeline
   */
  SDL_ReleaseGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUSampler
   */
  // SDL_ReleaseGPUSampler: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUShader
   */
  SDL_ReleaseGPUShader: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUTexture
   */
  // SDL_ReleaseGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseGPUTransferBuffer
   */
  // SDL_ReleaseGPUTransferBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReleaseWindowFromGPUDevice
   */
  SDL_ReleaseWindowFromGPUDevice: { args: ['ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUAllowedFramesInFlight
   */
  // SDL_SetGPUAllowedFramesInFlight: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUBlendConstants
   */
  // SDL_SetGPUBlendConstants: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUBufferName
   */
  // SDL_SetGPUBufferName: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUScissor
   */
  // SDL_SetGPUScissor: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUStencilReference
   */
  // SDL_SetGPUStencilReference: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUSwapchainParameters
   */
  // SDL_SetGPUSwapchainParameters: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUTextureName
   */
  // SDL_SetGPUTextureName: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPUViewport
   */
  // SDL_SetGPUViewport: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SubmitGPUCommandBuffer
   */
  SDL_SubmitGPUCommandBuffer: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SubmitGPUCommandBufferAndAcquireFence
   */
  // SDL_SubmitGPUCommandBufferAndAcquireFence: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnmapGPUTransferBuffer
   */
  // SDL_UnmapGPUTransferBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UploadToGPUBuffer
   */
  // SDL_UploadToGPUBuffer: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UploadToGPUTexture
   */
  // SDL_UploadToGPUTexture: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitAndAcquireGPUSwapchainTexture
   */
  SDL_WaitAndAcquireGPUSwapchainTexture: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitForGPUFences
   */
  // SDL_WaitForGPUFences: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitForGPUIdle
   */
  // SDL_WaitForGPUIdle: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WaitForGPUSwapchain
   */
  // SDL_WaitForGPUSwapchain: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WindowSupportsGPUPresentMode
   */
  // SDL_WindowSupportsGPUPresentMode: {},
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WindowSupportsGPUSwapchainComposition
   */
  // SDL_WindowSupportsGPUSwapchainComposition: {},
} as const satisfies Record<string, FFIFunction>
