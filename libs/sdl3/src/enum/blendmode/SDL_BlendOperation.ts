/**
 * @description https://wiki.libsdl.org/SDL3/SDL_BlendOperation
 */
export enum SDL_BlendOperation {
  SDL_BLENDOPERATION_ADD = 0x1 /**< dst + src: supported by all renderers */,
  SDL_BLENDOPERATION_SUBTRACT = 0x2 /**< src - dst : supported by D3D, OpenGL, OpenGLES, and Vulkan */,
  SDL_BLENDOPERATION_REV_SUBTRACT = 0x3 /**< dst - src : supported by D3D, OpenGL, OpenGLES, and Vulkan */,
  SDL_BLENDOPERATION_MINIMUM = 0x4 /**< min(dst, src) : supported by D3D, OpenGL, OpenGLES, and Vulkan */,
  SDL_BLENDOPERATION_MAXIMUM = 0x5 /**< max(dst, src) : supported by D3D, OpenGL, OpenGLES, and Vulkan */,
}
