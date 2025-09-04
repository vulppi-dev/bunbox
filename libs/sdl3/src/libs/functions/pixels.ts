import type { FFIFunction } from 'bun:ffi';

export const PIXELS_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_CreatePalette
   */
  SDL_CreatePalette: { args: ['i32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_DestroyPalette
   */
  SDL_DestroyPalette: { args: ['ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetMasksForPixelFormat
   */
  SDL_GetMasksForPixelFormat: {
    args: ['u32', 'ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPixelFormatDetails
   */
  SDL_GetPixelFormatDetails: { args: ['u32'], returns: 'ptr' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPixelFormatForMasks
   */
  SDL_GetPixelFormatForMasks: {
    args: ['i32', 'u32', 'u32', 'u32', 'u32'],
    returns: 'u32',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetPixelFormatName
   */
  SDL_GetPixelFormatName: { args: ['u32'], returns: 'cstring' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRGB
   */
  SDL_GetRGB: { args: ['u32', 'u32', 'ptr', 'ptr', 'ptr'], returns: 'void' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetRGBA
   */
  SDL_GetRGBA: {
    args: ['u32', 'u32', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapRGB
   */
  SDL_MapRGB: { args: ['u32', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapRGBA
   */
  SDL_MapRGBA: { args: ['u32', 'u8', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapSurfaceRGB
   */
  SDL_MapSurfaceRGB: { args: ['ptr', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_MapSurfaceRGBA
   */
  SDL_MapSurfaceRGBA: { args: ['ptr', 'u8', 'u8', 'u8', 'u8'], returns: 'u32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_SetPaletteColors
   */
  SDL_SetPaletteColors: {
    args: ['ptr', 'ptr', 'i32', 'i32'],
    returns: 'bool',
  },
} as const satisfies Record<string, FFIFunction>;
