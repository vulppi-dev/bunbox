import type { FFIFunction } from 'bun:ffi';

export const RENDERER_BINDINGS = {
  SDL_CreateGPUDevice: { args: ['u32', 'bool', 'ptr'], returns: 'ptr' },
  SDL_DestroyGPUDevice: { args: ['ptr'], returns: 'void' },
  SDL_ClaimWindowForGPUDevice: { args: ['ptr', 'ptr'], returns: 'bool' },
  SDL_ReleaseWindowFromGPUDevice: { args: ['ptr', 'ptr'], returns: 'void' },
  SDL_GetGPUSwapchainTextureFormat: { args: ['ptr', 'ptr'], returns: 'u32' },

  SDL_AcquireGPUCommandBuffer: { args: ['ptr'], returns: 'ptr' },
  SDL_SubmitGPUCommandBuffer: { args: ['ptr'], returns: 'void' },
  SDL_WaitAndAcquireGPUSwapchainTexture: {
    // (cmdBuf, window, &swapTex, &w, &h) -> bool
    args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'],
    returns: 'bool',
  },

  // Render pass
  SDL_BeginGPURenderPass: {
    args: ['ptr', 'ptr', 'u32', 'ptr'],
    returns: 'ptr',
  },
  SDL_EndGPURenderPass: { args: ['ptr'], returns: 'void' },

  // Pipeline + draw
  SDL_CreateGPUShader: { args: ['ptr', 'ptr'], returns: 'ptr' },
  SDL_ReleaseGPUShader: { args: ['ptr', 'ptr'], returns: 'void' },

  SDL_CreateGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'ptr' },
  SDL_ReleaseGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'void' },

  SDL_BindGPUGraphicsPipeline: { args: ['ptr', 'ptr'], returns: 'void' },
  SDL_DrawGPUPrimitives: {
    args: ['ptr', 'u32', 'u32', 'u32', 'u32'],
    returns: 'void',
  },
} as const satisfies Record<string, FFIFunction>;
