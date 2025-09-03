import type { FFIFunction } from 'bun:ffi';

export const RENDER_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddVulkanRenderSemaphores
   */
  // SDL_AddVulkanRenderSemaphores: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertEventToRenderCoordinates
   */
  // SDL_ConvertEventToRenderCoordinates: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPURenderer
   */
  // SDL_CreateGPURenderer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateGPURenderState
   */
  // SDL_CreateGPURenderState: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateRenderer
   */
  SDL_CreateRenderer: { args: ['ptr', 'cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateRendererWithProperties
   */
  // SDL_CreateRendererWithProperties: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSoftwareRenderer
   */
  // SDL_CreateSoftwareRenderer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTexture
   */
  // SDL_CreateTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTextureFromSurface
   */
  // SDL_CreateTextureFromSurface: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateTextureWithProperties
   */
  // SDL_CreateTextureWithProperties: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateWindowAndRenderer
   */
  // SDL_CreateWindowAndRenderer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyGPURenderState
   */
  // SDL_DestroyGPURenderState: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyRenderer
   */
  SDL_DestroyRenderer: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyTexture
   */
  // SDL_DestroyTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlushRenderer
   */
  // SDL_FlushRenderer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCurrentRenderOutputSize
   */
  // SDL_GetCurrentRenderOutputSize: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetDefaultTextureScaleMode
   */
  // SDL_GetDefaultTextureScaleMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumRenderDrivers
   */
  // SDL_GetNumRenderDrivers: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderClipRect
   */
  // SDL_GetRenderClipRect: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderColorScale
   */
  // SDL_GetRenderColorScale: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawBlendMode
   */
  // SDL_GetRenderDrawBlendMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawColor
   */
  // SDL_GetRenderDrawColor: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDrawColorFloat
   */
  // SDL_GetRenderDrawColorFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderDriver
   */
  // SDL_GetRenderDriver: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderer
   */
  // SDL_GetRenderer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererFromTexture
   */
  // SDL_GetRendererFromTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererName
   */
  // SDL_GetRendererName: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRendererProperties
   */
  // SDL_GetRendererProperties: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderLogicalPresentation
   */
  // SDL_GetRenderLogicalPresentation: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderLogicalPresentationRect
   */
  // SDL_GetRenderLogicalPresentationRect: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderMetalCommandEncoder
   */
  // SDL_GetRenderMetalCommandEncoder: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderMetalLayer
   */
  // SDL_GetRenderMetalLayer: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderOutputSize
   */
  SDL_GetRenderOutputSize: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderSafeArea
   */
  // SDL_GetRenderSafeArea: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderScale
   */
  // SDL_GetRenderScale: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderTarget
   */
  // SDL_GetRenderTarget: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderTextureAddressMode
   */
  // SDL_GetRenderTextureAddressMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderViewport
   */
  // SDL_GetRenderViewport: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderVSync
   */
  // SDL_GetRenderVSync: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRenderWindow
   */
  // SDL_GetRenderWindow: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureAlphaMod
   */
  // SDL_GetTextureAlphaMod: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureAlphaModFloat
   */
  // SDL_GetTextureAlphaModFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureBlendMode
   */
  // SDL_GetTextureBlendMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureColorMod
   */
  // SDL_GetTextureColorMod: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureColorModFloat
   */
  // SDL_GetTextureColorModFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureProperties
   */
  // SDL_GetTextureProperties: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureScaleMode
   */
  // SDL_GetTextureScaleMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetTextureSize
   */
  // SDL_GetTextureSize: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockTexture
   */
  // SDL_LockTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockTextureToSurface
   */
  // SDL_LockTextureToSurface: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderClear
   */
  SDL_RenderClear: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderClipEnabled
   */
  // SDL_RenderClipEnabled: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderCoordinatesFromWindow
   */
  // SDL_RenderCoordinatesFromWindow: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderCoordinatesToWindow
   */
  // SDL_RenderCoordinatesToWindow: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderDebugText
   */
  // SDL_RenderDebugText: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderDebugTextFormat
   */
  // SDL_RenderDebugTextFormat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderFillRect
   */
  SDL_RenderFillRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderFillRects
   */
  // SDL_RenderFillRects: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderGeometry
   */
  // SDL_RenderGeometry: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderGeometryRaw
   */
  // SDL_RenderGeometryRaw: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderLine
   */
  // SDL_RenderLine: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderLines
   */
  // SDL_RenderLines: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPoint
   */
  // SDL_RenderPoint: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPoints
   */
  // SDL_RenderPoints: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderPresent
   */
  SDL_RenderPresent: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderReadPixels
   */
  // SDL_RenderReadPixels: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderRect
   */
  // SDL_RenderRect: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderRects
   */
  // SDL_RenderRects: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture
   */
  // SDL_RenderTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture9Grid
   */
  // SDL_RenderTexture9Grid: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTexture9GridTiled
   */
  // SDL_RenderTexture9GridTiled: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureAffine
   */
  // SDL_RenderTextureAffine: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureRotated
   */
  // SDL_RenderTextureRotated: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderTextureTiled
   */
  // SDL_RenderTextureTiled: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RenderViewportSet
   */
  // SDL_RenderViewportSet: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetDefaultTextureScaleMode
   */
  // SDL_SetDefaultTextureScaleMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetGPURenderStateFragmentUniforms
   */
  // SDL_SetGPURenderStateFragmentUniforms: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderClipRect
   */
  // SDL_SetRenderClipRect: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderColorScale
   */
  // SDL_SetRenderColorScale: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderDrawBlendMode
   */
  // SDL_SetRenderDrawBlendMode: { args: [], returns: 'void' },
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
  // SDL_SetRenderDrawColorFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderGPUState
   */
  // SDL_SetRenderGPUState: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderLogicalPresentation
   */
  // SDL_SetRenderLogicalPresentation: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderScale
   */
  // SDL_SetRenderScale: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderTarget
   */
  // SDL_SetRenderTarget: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderTextureAddressMode
   */
  // SDL_SetRenderTextureAddressMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderViewport
   */
  // SDL_SetRenderViewport: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetRenderVSync
   */
  // SDL_SetRenderVSync: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureAlphaMod
   */
  // SDL_SetTextureAlphaMod: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureAlphaModFloat
   */
  // SDL_SetTextureAlphaModFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureBlendMode
   */
  // SDL_SetTextureBlendMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureColorMod
   */
  // SDL_SetTextureColorMod: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureColorModFloat
   */
  // SDL_SetTextureColorModFloat: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetTextureScaleMode
   */
  // SDL_SetTextureScaleMode: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockTexture
   */
  // SDL_UnlockTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateNVTexture
   */
  // SDL_UpdateNVTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateTexture
   */
  // SDL_UpdateTexture: { args: [], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UpdateYUVTexture
   */
  // SDL_UpdateYUVTexture: { args: [], returns: 'void' },
} as const satisfies Record<string, FFIFunction>;
