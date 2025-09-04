import type { FFIFunction } from 'bun:ffi';

export const RENDER_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddVulkanRenderSemaphores
   */
  SDL_AddVulkanRenderSemaphores: {
    args: ['ptr', 'u32', 'i64', 'i64'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertEventToRenderCoordinates
   */
  SDL_ConvertEventToRenderCoordinates: {
    args: ['ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPURenderer
   */
  // SDL_CreateGPURenderer: { args: ['ptr', 'u32', 'ptr'], returns: 'ptr' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPURenderState
   */
  // SDL_CreateGPURenderState: { args: ['ptr'], returns: 'ptr' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateRenderer
   */
  SDL_CreateRenderer: { args: ['ptr', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateRendererWithProperties
   */
  SDL_CreateRendererWithProperties: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSoftwareRenderer
   */
  SDL_CreateSoftwareRenderer: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTexture
   */
  SDL_CreateTexture: {
    args: ['ptr', 'u32', 'u32', 'int', 'int'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTextureFromSurface
   */
  SDL_CreateTextureFromSurface: { args: ['ptr', 'ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTextureWithProperties
   */
  SDL_CreateTextureWithProperties: { args: ['ptr', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindowAndRenderer
   */
  SDL_CreateWindowAndRenderer: {
    args: ['int', 'int', 'u32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyGPURenderState
   */
  // SDL_DestroyGPURenderState: { args: ['ptr'], returns: 'void' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyRenderer
   */
  SDL_DestroyRenderer: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyTexture
   */
  SDL_DestroyTexture: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushRenderer
   */
  SDL_FlushRenderer: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentRenderOutputSize
   */
  SDL_GetCurrentRenderOutputSize: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultTextureScaleMode
   */
  // SDL_GetDefaultTextureScaleMode: { args: ['ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumRenderDrivers
   */
  SDL_GetNumRenderDrivers: { args: [], returns: 'int' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderClipRect
   */
  SDL_GetRenderClipRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderColorScale
   */
  SDL_GetRenderColorScale: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawBlendMode
   */
  SDL_GetRenderDrawBlendMode: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawColor
   */
  SDL_GetRenderDrawColor: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawColorFloat
   */
  SDL_GetRenderDrawColorFloat: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDriver
   */
  SDL_GetRenderDriver: { args: ['int', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderer
   */
  SDL_GetRenderer: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererFromTexture
   */
  SDL_GetRendererFromTexture: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererName
   */
  SDL_GetRendererName: { args: ['ptr'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererProperties
   */
  SDL_GetRendererProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderLogicalPresentation
   */
  SDL_GetRenderLogicalPresentation: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderLogicalPresentationRect
   */
  SDL_GetRenderLogicalPresentationRect: {
    args: ['ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderMetalCommandEncoder
   */
  SDL_GetRenderMetalCommandEncoder: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderMetalLayer
   */
  SDL_GetRenderMetalLayer: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderOutputSize
   */
  SDL_GetRenderOutputSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderSafeArea
   */
  SDL_GetRenderSafeArea: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderScale
   */
  SDL_GetRenderScale: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderTarget
   */
  SDL_GetRenderTarget: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderTextureAddressMode
   */
  // SDL_GetRenderTextureAddressMode: { args: ['ptr', 'ptr'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderViewport
   */
  SDL_GetRenderViewport: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderVSync
   */
  SDL_GetRenderVSync: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderWindow
   */
  SDL_GetRenderWindow: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureAlphaMod
   */
  SDL_GetTextureAlphaMod: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureAlphaModFloat
   */
  SDL_GetTextureAlphaModFloat: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureBlendMode
   */
  SDL_GetTextureBlendMode: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureColorMod
   */
  SDL_GetTextureColorMod: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureColorModFloat
   */
  SDL_GetTextureColorModFloat: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureProperties
   */
  SDL_GetTextureProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureScaleMode
   */
  SDL_GetTextureScaleMode: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureSize
   */
  SDL_GetTextureSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockTexture
   */
  SDL_LockTexture: { args: ['ptr', 'ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockTextureToSurface
   */
  SDL_LockTextureToSurface: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderClear
   */
  SDL_RenderClear: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderClipEnabled
   */
  SDL_RenderClipEnabled: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderCoordinatesFromWindow
   */
  SDL_RenderCoordinatesFromWindow: {
    args: ['ptr', 'f32', 'f32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderCoordinatesToWindow
   */
  SDL_RenderCoordinatesToWindow: {
    args: ['ptr', 'f32', 'f32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderDebugText
   */
  SDL_RenderDebugText: {
    args: ['ptr', 'f32', 'f32', 'cstring'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderDebugTextFormat
   */
  SDL_RenderDebugTextFormat: {
    args: ['ptr', 'f32', 'f32', 'cstring', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderFillRect
   */
  SDL_RenderFillRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderFillRects
   */
  SDL_RenderFillRects: { args: ['ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderGeometry
   */
  SDL_RenderGeometry: {
    args: ['ptr', 'ptr', 'ptr', 'int', 'ptr', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderGeometryRaw
   */
  SDL_RenderGeometryRaw: {
    args: [
      'ptr', // renderer
      'ptr', // texture (optional)
      'ptr',
      'int', // xy, xy_stride
      'ptr',
      'int', // color, color_stride
      'ptr',
      'int', // uv, uv_stride
      'int', // num_vertices
      'ptr',
      'int',
      'int', // indices, num_indices, size_indices
    ],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderLine
   */
  SDL_RenderLine: {
    args: ['ptr', 'f32', 'f32', 'f32', 'f32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderLines
   */
  SDL_RenderLines: { args: ['ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPoint
   */
  SDL_RenderPoint: { args: ['ptr', 'f32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPoints
   */
  SDL_RenderPoints: { args: ['ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPresent
   */
  SDL_RenderPresent: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderReadPixels
   */
  SDL_RenderReadPixels: {
    args: ['ptr', 'ptr', 'u32', 'ptr', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderRect
   */
  SDL_RenderRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderRects
   */
  SDL_RenderRects: { args: ['ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture
   */
  SDL_RenderTexture: { args: ['ptr', 'ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture9Grid
   */
  SDL_RenderTexture9Grid: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'int', 'int', 'int', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture9GridTiled
   */
  // SDL_RenderTexture9GridTiled: {
  //   args: ['ptr', 'ptr', 'ptr', 'ptr', 'int', 'int', 'int', 'int'],
  //   returns: 'bool',
  // }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureAffine
   */
  SDL_RenderTextureAffine: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureRotated
   */
  SDL_RenderTextureRotated: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'f64', 'ptr', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureTiled
   */
  SDL_RenderTextureTiled: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'int', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderViewportSet
   */
  SDL_RenderViewportSet: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetDefaultTextureScaleMode
   */
  // SDL_SetDefaultTextureScaleMode: { args: ['u32'], returns: 'void' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPURenderStateFragmentUniforms
   */
  // SDL_SetGPURenderStateFragmentUniforms: {
  //   args: ['ptr', 'u32', 'ptr', 'u32'],
  //   returns: 'bool',
  // },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderClipRect
   */
  SDL_SetRenderClipRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderColorScale
   */
  SDL_SetRenderColorScale: { args: ['ptr', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderDrawBlendMode
   */
  SDL_SetRenderDrawBlendMode: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderDrawColor
   */
  SDL_SetRenderDrawColor: {
    args: ['ptr', 'int', 'int', 'int', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderDrawColorFloat
   */
  SDL_SetRenderDrawColorFloat: {
    args: ['ptr', 'f32', 'f32', 'f32', 'f32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderGPUState
   */
  // SDL_SetRenderGPUState: { args: ['ptr', 'ptr', 'u32'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderLogicalPresentation
   */
  SDL_SetRenderLogicalPresentation: {
    args: ['ptr', 'int', 'int', 'u32', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderScale
   */
  SDL_SetRenderScale: { args: ['ptr', 'f32', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderTarget
   */
  SDL_SetRenderTarget: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderTextureAddressMode
   */
  // SDL_SetRenderTextureAddressMode: { args: ['ptr', 'u32'], returns: 'bool' }, --- NOT FOUND ---
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderViewport
   */
  SDL_SetRenderViewport: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderVSync
   */
  SDL_SetRenderVSync: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureAlphaMod
   */
  SDL_SetTextureAlphaMod: { args: ['ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureAlphaModFloat
   */
  SDL_SetTextureAlphaModFloat: { args: ['ptr', 'f32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureBlendMode
   */
  SDL_SetTextureBlendMode: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureColorMod
   */
  SDL_SetTextureColorMod: {
    args: ['ptr', 'int', 'int', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureColorModFloat
   */
  SDL_SetTextureColorModFloat: {
    args: ['ptr', 'f32', 'f32', 'f32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureScaleMode
   */
  SDL_SetTextureScaleMode: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockTexture
   */
  SDL_UnlockTexture: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateNVTexture
   */
  SDL_UpdateNVTexture: {
    args: ['ptr', 'ptr', 'ptr', 'int', 'ptr', 'int'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateTexture
   */
  SDL_UpdateTexture: { args: ['ptr', 'ptr', 'ptr', 'int'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateYUVTexture
   */
  SDL_UpdateYUVTexture: {
    args: ['ptr', 'ptr', 'ptr', 'int', 'ptr', 'int', 'ptr', 'int'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
