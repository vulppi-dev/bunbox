import type { FFIFunction } from 'bun:ffi';

export const VULKAN_BINDINGS = {
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_CreateSurface
   */
  SDL_Vulkan_CreateSurface: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_DestroySurface
   */
  SDL_Vulkan_DestroySurface: {
    args: ['ptr', 'ptr', 'ptr'],
    returns: 'void',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_GetInstanceExtensions
   */
  SDL_Vulkan_GetInstanceExtensions: {
    args: ['ptr'],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_GetPresentationSupport
   */
  SDL_Vulkan_GetPresentationSupport: {
    args: ['ptr', 'ptr', 'u32'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_GetVkGetInstanceProcAddr
   */
  SDL_Vulkan_GetVkGetInstanceProcAddr: {
    args: [],
    returns: 'ptr',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_LoadLibrary
   */
  SDL_Vulkan_LoadLibrary: {
    args: ['cstring'],
    returns: 'bool',
  },
  /**
   * @description https://wiki.libsdl.org/SDL3/SDL_Vulkan_UnloadLibrary
   */
  SDL_Vulkan_UnloadLibrary: {
    args: [],
    returns: 'void',
  },
} as const satisfies Record<string, FFIFunction>;
