// sdl3_gpu_vulkan_triangle.ts
// Draw a triangle with SDL3_gpu using the Vulkan backend
// Comments in EN; explanations in PT-BR.

import {
  SDL_EventType,
  SDL_GPUPrimitiveType,
  SDL_GPUShaderFormat,
  SDL_GPULoadOp,
  SDL_GPUStoreOp,
  SDL_InitFlags,
  SDL_Scancode,
  SDL_GPUCompareOp,
  SDL_GPUStencilOp,
} from '$enum'
import { SDL_WindowFlags } from '$enum'
import { SDL, cstr, ptr, wgsl_to_spirv_bin } from '$libs'
import {
  SDL_Event,
  SDL_FColor,
  SDL_GPUColorTargetDescription,
  SDL_GPUColorTargetInfo,
  SDL_GPUShaderCreateInfo,
  SDL_GPUGraphicsPipelineCreateInfo,
  SDL_GPUGraphicsPipelineTargetInfo,
  SDL_GPUDepthStencilState,
  SDL_GPUMultisampleState,
} from '$structs'

// --- init video ---
if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO))
  throw new Error('SDL_Init failed')

// Create a Vulkan-capable window (recommended for clarity)
const win = SDL.SDL_CreateWindow(
  cstr('SDL3_gpu Vulkan Triangle'),
  800,
  600,
  SDL_WindowFlags.SDL_WINDOW_RESIZABLE | SDL_WindowFlags.SDL_WINDOW_VULKAN,
)
if (!win) throw new Error('SDL_CreateWindow failed')

// --- force Vulkan backend on SDL_gpu ---
// Option A: name = "vulkan" here (preferred)
const device = SDL.SDL_CreateGPUDevice(
  SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV, // we'll provide SPIR-V
  true, // debug mode
  cstr('vulkan'), // force Vulkan backend
)
if (!device) throw new Error('SDL_CreateGPUDevice failed')

// (Optional) verify backend name
const backendName = SDL.SDL_GetGPUDeviceDriver(device)
if (backendName?.toString() !== 'vulkan') {
  console.warn('GPU backend is not Vulkan:', backendName?.toString())
}

// Claim the window for this GPU device
if (!SDL.SDL_ClaimWindowForGPUDevice(device, win))
  throw new Error(SDL.SDL_GetError().toString())

// Get swapchain texture format for the window
const swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(device, win)

// --- shaders (WGSL -> SPIR-V) ---
const VS_WGSL = `
struct Out { @builtin(position) pos: vec4<f32> };
@vertex fn main(@builtin(vertex_index) i:u32) -> Out {
  var p = array<vec2<f32>,3>(
    vec2(-0.6,-0.6), vec2(0.6,-0.6), vec2(0.0,0.6)
  );
  var o:Out; o.pos = vec4(p[i], 0.0, 1.0); return o;
}`
const FS_WGSL = `
@fragment fn main() -> @location(0) vec4<f32> {
  return vec4(0.20, 0.80, 1.00, 1.0);
}`

function makeShader(code: Uint8Array, stage: number) {
  const ci = new SDL_GPUShaderCreateInfo()
  ci.set('code', code)
  ci.set('code_size', BigInt(code.byteLength))
  ci.set('entrypoint', ptr(cstr('main')))
  ci.set('format', SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV)
  ci.set('stage', stage)
  ci.flush()
  const sh = SDL.SDL_CreateGPUShader(device, ci.pointer)
  if (!sh) throw new Error('SDL_CreateGPUShader failed')
  return sh
}

const vs = makeShader(
  wgsl_to_spirv_bin(VS_WGSL, 'vertex', 'main'),
  /* SDL_GPUShaderStage */ 0x1, // SDL_GPU_SHADERSTAGE_VERTEX
)
const fs = makeShader(
  wgsl_to_spirv_bin(FS_WGSL, 'fragment', 'main'),
  /* SDL_GPUShaderStage */ 0x2, // SDL_GPU_SHADERSTAGE_FRAGMENT
)

// --- graphics pipeline (no depth/stencil) ---
const colorDesc = new SDL_GPUColorTargetDescription()
colorDesc.set('format', swapFormat)
colorDesc.flush()

const targetInfo = new SDL_GPUGraphicsPipelineTargetInfo()
targetInfo.set('color_target_descriptions', colorDesc)
targetInfo.set('num_color_targets', 1)
targetInfo.set('has_depth_stencil_target', false)
targetInfo.flush()

const depthstencil = new SDL_GPUDepthStencilState()
depthstencil.set('compare_op', SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS)

// front face
depthstencil
  .get('front_stencil_state')
  .set('fail_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('front_stencil_state')
  .set('pass_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('front_stencil_state')
  .set('depth_fail_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('front_stencil_state')
  .set('compare_op', SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS)

depthstencil
  .get('back_stencil_state')
  .set('fail_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('back_stencil_state')
  .set('pass_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('back_stencil_state')
  .set('depth_fail_op', SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP)
depthstencil
  .get('back_stencil_state')
  .set('compare_op', SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS)

depthstencil.set('compare_mask', 0xff)
depthstencil.set('write_mask', 0x00)
depthstencil.set('enable_depth_test', false)
depthstencil.set('enable_depth_write', false)
depthstencil.set('enable_stencil_test', false)
depthstencil.flush()

const multisample = new SDL_GPUMultisampleState()
multisample.set('sample_count', 1)
multisample.set('sample_mask', 0)
multisample.set('enable_mask', false)
multisample.set('enable_alpha_to_coverage', false)
multisample.flush()

const gpci = new SDL_GPUGraphicsPipelineCreateInfo()
gpci.set('vertex_shader', vs)
gpci.set('fragment_shader', fs)
gpci.set(
  'primitive_type',
  SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_TRIANGLELIST,
)
gpci.set('target_info', targetInfo)
gpci.set('depth_stencil_state', depthstencil)
gpci.set('multisample_state', multisample)
gpci.flush()

gpci.read()
console.log(
  gpci.get('multisample_state').buffer,
  gpci.get('multisample_state').get('enable_mask'),
)

const pipeline = SDL.SDL_CreateGPUGraphicsPipeline(device, gpci.pointer)
if (!pipeline) throw new Error('SDL_CreateGPUGraphicsPipeline failed')

// --- frame/loop ---
const CLEAR = new SDL_FColor()
CLEAR.set('r', 0.06)
CLEAR.set('g', 0.06)
CLEAR.set('b', 0.09)
CLEAR.set('a', 1)
CLEAR.flush()

const colorTarget = new SDL_GPUColorTargetInfo()

let running = true
while (running) {
  // events
  const e = new SDL_Event()
  while (SDL.SDL_PollEvent(e.pointer)) {
    e.read()
    const t = e.get('type')
    if (t === SDL_EventType.SDL_EVENT_QUIT) running = false
    else if (t === SDL_EventType.SDL_EVENT_KEY_DOWN) {
      if (e.get('key').get('scancode') === SDL_Scancode.SDL_SCANCODE_ESCAPE)
        running = false
    }
  }

  const cmdbuf = SDL.SDL_AcquireGPUCommandBuffer(device)
  if (!cmdbuf) continue

  // acquire swapchain texture
  const pTex = new BigUint64Array(1)
  const ok = SDL.SDL_WaitAndAcquireGPUSwapchainTexture(
    cmdbuf,
    win,
    ptr(pTex.buffer),
    null,
    null,
  )
  if (!ok || !pTex[0]) {
    SDL.SDL_SubmitGPUCommandBuffer(cmdbuf)
    await Bun.sleep(0)
    continue
  }

  // render pass
  colorTarget.set('texture', pTex[0])
  colorTarget.set('clear_color', CLEAR)
  colorTarget.set('load_op', SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR)
  colorTarget.set('store_op', SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE)
  colorTarget.flush()

  const pass = SDL.SDL_BeginGPURenderPass(cmdbuf, colorTarget.pointer, 1, null)
  SDL.SDL_BindGPUGraphicsPipeline(pass, pipeline)
  SDL.SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0)
  SDL.SDL_EndGPURenderPass(pass)

  SDL.SDL_SubmitGPUCommandBuffer(cmdbuf)
  await Bun.sleep(0)
}

// --- cleanup ---
SDL.SDL_ReleaseGPUGraphicsPipeline(device, pipeline)
SDL.SDL_ReleaseGPUShader(device, vs)
SDL.SDL_ReleaseGPUShader(device, fs)
SDL.SDL_ReleaseWindowFromGPUDevice(device, win)
SDL.SDL_DestroyGPUDevice(device)
SDL.SDL_DestroyWindow(win)
SDL.SDL_Quit()
