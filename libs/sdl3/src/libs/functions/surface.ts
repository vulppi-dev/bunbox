import type { FFIFunction } from 'bun:ffi';

export const SURFACE_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_AddSurfaceAlternateImage
   */
  SDL_AddSurfaceAlternateImage: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurface
   */
  SDL_BlitSurface: { args: ['ptr', 'ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurface9Grid
   */
  SDL_BlitSurface9Grid: {
    args: [
      'ptr',
      'ptr',
      'i32',
      'i32',
      'i32',
      'i32',
      'f32',
      'u32',
      'ptr',
      'ptr',
    ],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurfaceScaled
   */
  SDL_BlitSurfaceScaled: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurfaceTiled
   */
  SDL_BlitSurfaceTiled: { args: ['ptr', 'ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurfaceTiledWithScale
   */
  SDL_BlitSurfaceTiledWithScale: {
    args: ['ptr', 'ptr', 'f32', 'u32', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurfaceUnchecked
   */
  SDL_BlitSurfaceUnchecked: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_BlitSurfaceUncheckedScaled
   */
  SDL_BlitSurfaceUncheckedScaled: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ClearSurface
   */
  SDL_ClearSurface: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertPixels
   */
  SDL_ConvertPixels: {
    args: ['i32', 'i32', 'u32', 'ptr', 'i32', 'u32', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertPixelsAndColorspace
   */
  SDL_ConvertPixelsAndColorspace: {
    args: [
      'i32',
      'i32',
      'u32',
      'u32',
      'ptr',
      'i32',
      'u32',
      'u32',
      'ptr',
      'i32',
    ],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertSurface
   */
  SDL_ConvertSurface: { args: ['ptr', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ConvertSurfaceAndColorspace
   */
  SDL_ConvertSurfaceAndColorspace: {
    args: ['ptr', 'u32', 'u32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSurface
   */
  SDL_CreateSurface: { args: ['i32', 'i32', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSurfaceFrom
   */
  SDL_CreateSurfaceFrom: {
    args: ['ptr', 'i32', 'i32', 'i32', 'u32'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreateSurfacePalette
   */
  SDL_CreateSurfacePalette: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroySurface
   */
  SDL_DestroySurface: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DuplicateSurface
   */
  SDL_DuplicateSurface: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FillSurfaceRect
   */
  SDL_FillSurfaceRect: { args: ['ptr', 'ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FillSurfaceRects
   */
  SDL_FillSurfaceRects: { args: ['ptr', 'ptr', 'i32', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_FlipSurface
   */
  SDL_FlipSurface: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceAlphaMod
   */
  SDL_GetSurfaceAlphaMod: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceBlendMode
   */
  SDL_GetSurfaceBlendMode: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceClipRect
   */
  SDL_GetSurfaceClipRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceColorKey
   */
  SDL_GetSurfaceColorKey: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceColorMod
   */
  SDL_GetSurfaceColorMod: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceColorspace
   */
  SDL_GetSurfaceColorspace: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceImages
   */
  SDL_GetSurfaceImages: { args: ['ptr', 'ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfacePalette
   */
  SDL_GetSurfacePalette: { args: ['ptr'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSurfaceProperties
   */
  SDL_GetSurfaceProperties: { args: ['ptr'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadBMP
   */
  SDL_LoadBMP: { args: ['cstring'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LoadBMP_IO
   */
  SDL_LoadBMP_IO: { args: ['ptr', 'bool'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_LockSurface
   */
  SDL_LockSurface: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapSurfaceRGB
   */
  SDL_MapSurfaceRGB: { args: ['ptr', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapSurfaceRGBA
   */
  SDL_MapSurfaceRGBA: { args: ['ptr', 'u8', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PremultiplyAlpha
   */
  SDL_PremultiplyAlpha: {
    args: ['i32', 'i32', 'u32', 'ptr', 'i32', 'u32', 'ptr', 'i32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_PremultiplySurfaceAlpha
   */
  SDL_PremultiplySurfaceAlpha: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadSurfacePixel
   */
  SDL_ReadSurfacePixel: {
    args: ['ptr', 'i32', 'i32', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ReadSurfacePixelFloat
   */
  SDL_ReadSurfacePixelFloat: {
    args: ['ptr', 'i32', 'i32', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_RemoveSurfaceAlternateImages
   */
  SDL_RemoveSurfaceAlternateImages: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SaveBMP
   */
  SDL_SaveBMP: { args: ['ptr', 'cstring'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SaveBMP_IO
   */
  SDL_SaveBMP_IO: { args: ['ptr', 'ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_ScaleSurface
   */
  SDL_ScaleSurface: { args: ['ptr', 'i32', 'i32', 'u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceAlphaMod
   */
  SDL_SetSurfaceAlphaMod: { args: ['ptr', 'u8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceBlendMode
   */
  SDL_SetSurfaceBlendMode: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceClipRect
   */
  SDL_SetSurfaceClipRect: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceColorKey
   */
  SDL_SetSurfaceColorKey: { args: ['ptr', 'bool', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceColorMod
   */
  SDL_SetSurfaceColorMod: { args: ['ptr', 'u8', 'u8', 'u8'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceColorspace
   */
  SDL_SetSurfaceColorspace: { args: ['ptr', 'u32'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfacePalette
   */
  SDL_SetSurfacePalette: { args: ['ptr', 'ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetSurfaceRLE
   */
  SDL_SetSurfaceRLE: { args: ['ptr', 'bool'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_StretchSurface
   */
  SDL_StretchSurface: {
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SurfaceHasAlternateImages
   */
  SDL_SurfaceHasAlternateImages: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SurfaceHasColorKey
   */
  SDL_SurfaceHasColorKey: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SurfaceHasRLE
   */
  SDL_SurfaceHasRLE: { args: ['ptr'], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_UnlockSurface
   */
  SDL_UnlockSurface: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteSurfacePixel
   */
  SDL_WriteSurfacePixel: {
    args: ['ptr', 'i32', 'i32', 'u8', 'u8', 'u8', 'u8'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_WriteSurfacePixelFloat
   */
  SDL_WriteSurfacePixelFloat: {
    args: ['ptr', 'i32', 'i32', 'f32', 'f32', 'f32', 'f32'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
