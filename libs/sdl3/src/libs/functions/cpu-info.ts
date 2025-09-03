import type { FFIFunction } from 'bun:ffi';

export const CPU_INFO_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetCPUCacheLineSize
   */
  SDL_GetCPUCacheLineSize: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetNumLogicalCPUCores
   */
  SDL_GetNumLogicalCPUCores: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSIMDAlignment
   */
  SDL_GetSIMDAlignment: { args: [], returns: 'u64' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_GetSystemRAM
   */
  SDL_GetSystemRAM: { args: [], returns: 'i32' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasAltiVec
   */
  SDL_HasAltiVec: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasARMSIMD
   */
  SDL_HasARMSIMD: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasAVX
   */
  SDL_HasAVX: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasAVX2
   */
  SDL_HasAVX2: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasAVX512F
   */
  SDL_HasAVX512F: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasLASX
   */
  SDL_HasLASX: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasLSX
   */
  SDL_HasLSX: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasMMX
   */
  SDL_HasMMX: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasNEON
   */
  SDL_HasNEON: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasSSE
   */
  SDL_HasSSE: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasSSE2
   */
  SDL_HasSSE2: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasSSE3
   */
  SDL_HasSSE3: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasSSE41
   */
  SDL_HasSSE41: { args: [], returns: 'bool' },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_HasSSE42
   */
  SDL_HasSSE42: { args: [], returns: 'bool' },
} as const satisfies Record<string, FFIFunction>;
