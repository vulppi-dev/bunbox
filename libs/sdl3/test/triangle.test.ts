// sdl3_gpu_vulkan_triangle_stable.ts
// SDL3 GPU (Vulkan backend) — triangle with u32 SPIR-V and safe state
// EN comments; PT-BR explanations in chat.

import {
  SDL_EventType,
  SDL_GPUCompareOp,
  SDL_GPULoadOp,
  SDL_GPUPrimitiveType,
  SDL_GPUSampleCount,
  SDL_GPUShaderFormat,
  SDL_GPUShaderStage,
  SDL_GPUStencilOp,
  SDL_GPUStoreOp,
  SDL_InitFlags,
  SDL_LogPriority,
  SDL_Scancode,
  SDL_WindowFlags,
} from '$enum'
import { SDL, cstr, ptr, wgsl_to_spirv_bin } from '$libs'
import {
  SDL_Event,
  SDL_FColor,
  SDL_GPUColorTargetDescription,
  SDL_GPUColorTargetInfo,
  SDL_GPUDepthStencilState,
  SDL_GPUGraphicsPipelineCreateInfo,
  SDL_GPUGraphicsPipelineTargetInfo,
  SDL_GPUMultisampleState,
  SDL_GPUShaderCreateInfo,
  SDL_GPUViewport,
  SDL_Rect,
} from '$structs'

// Toggle: only enable if your struct layouts match (Viewport=24 bytes, Rect=16 bytes)
const USE_VIEWPORT_AND_SCISSOR = true
const INVERSE_VIEWPORT = process.platform === 'darwin' ? 1 : -1 // flip Y on Vulkan

// ---------- stable C-strings ----------
const STR = {
  title: cstr('SDL3 GPU Vulkan — Stable Triangle'),
  backend: cstr('vulkan'),
  logKey: cstr('SDL_LOGGING'),
  logVal: cstr('gpu=debug,assert=debug,*=info'),
  main: cstr('main'),
}

// --- init ---
if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO))
  throw new Error('SDL_Init failed')
SDL.SDL_SetLogPriorities(SDL_LogPriority.SDL_LOG_PRIORITY_DEBUG)
SDL.SDL_SetHint(STR.logKey, STR.logVal)

const win = SDL.SDL_CreateWindow(
  STR.title,
  800,
  600,
  SDL_WindowFlags.SDL_WINDOW_RESIZABLE | SDL_WindowFlags.SDL_WINDOW_VULKAN,
)
if (!win) throw new Error('SDL_CreateWindow failed')

const device = SDL.SDL_CreateGPUDevice(
  SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV,
  true,
  STR.backend, // force Vulkan (temporarily remove to sanity-check with D3D12)
)
if (!device) throw new Error('SDL_CreateGPUDevice failed')
if (!SDL.SDL_ClaimWindowForGPUDevice(device, win))
  throw new Error(SDL.SDL_GetError().toString())

console.log('SDL_GPU Driver:', SDL.SDL_GetGPUDeviceDriver(device)?.toString())
const swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(device, win)

// --- shaders (minimal; const color) ---
const VS_WGSL = `
@vertex fn main(@builtin(vertex_index) i:u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>,3>( vec2(-0.6,-0.6), vec2(0.6,-0.6), vec2(0.0,0.6) );
  return vec4(p[i], 0.0, 1.0);
}`
const FS_WGSL = `
@fragment fn main() -> @location(0) vec4<f32> {
  return vec4(1.0, 0.55, 0.2, 1.0);
}`

function makeShader(spvU32: Uint8Array, stage: SDL_GPUShaderStage) {
  const sci = new SDL_GPUShaderCreateInfo()
  sci.set('code', spvU32) // u32 aligned
  sci.set('code_size', BigInt(spvU32.byteLength)) // BYTES, not words
  sci.set('entrypoint', ptr(STR.main)) // stable "main"
  sci.set('format', SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV)
  sci.set('stage', stage)
  sci.set('num_samplers', 0)
  sci.set('num_storage_textures', 0)
  sci.set('num_storage_buffers', 0)
  sci.set('num_uniform_buffers', 0)
  sci.flush()
  const sh = SDL.SDL_CreateGPUShader(device, sci.pointer)
  if (!sh) throw new Error('SDL_CreateGPUShader failed')
  return sh
}

const vs = makeShader(
  wgsl_to_spirv_bin(VS_WGSL, 'vertex', 'main'),
  SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_VERTEX,
)
const fs = makeShader(
  wgsl_to_spirv_bin(FS_WGSL, 'fragment', 'main'),
  SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_FRAGMENT,
)

// --- pipeline/targets ---
const colorDesc = new SDL_GPUColorTargetDescription()
colorDesc.set('format', swapFormat)
colorDesc.flush()

const targetInfo = new SDL_GPUGraphicsPipelineTargetInfo()
targetInfo.set('color_target_descriptions', colorDesc)
targetInfo.set('num_color_targets', 1)
targetInfo.set('depth_stencil_format', 0)
targetInfo.set('has_depth_stencil_target', false)
targetInfo.flush()

const depthstencil = new SDL_GPUDepthStencilState()
depthstencil.set('compare_op', SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS)
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
multisample.set('sample_count', SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1)
multisample.set('sample_mask', 0) // reserved → 0
multisample.set('enable_mask', false) // reserved → false
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
// rasterizer explicit
gpci.get('rasterizer_state').set('fill_mode', 1) // FILL
gpci.get('rasterizer_state').set('cull_mode', 0) // NONE
gpci.get('rasterizer_state').set('front_face', 1) // CCW
gpci.get('rasterizer_state').set('depth_bias_constant_factor', 0)
gpci.get('rasterizer_state').set('depth_bias_clamp', 0)
gpci.get('rasterizer_state').set('depth_bias_slope_factor', 0)
gpci.get('rasterizer_state').set('enable_depth_bias', false)
gpci.get('rasterizer_state').set('enable_depth_clip', false)
gpci.flush()

const pipeline = SDL.SDL_CreateGPUGraphicsPipeline(device, ptr(gpci.buffer))
if (!pipeline) throw new Error('SDL_CreateGPUGraphicsPipeline failed')

// --- frame loop ---
const CLEAR = new SDL_FColor()
CLEAR.set('r', 0.06)
CLEAR.set('g', 0.06)
CLEAR.set('b', 0.09)
CLEAR.set('a', 1)
CLEAR.flush()

const colorTarget = new SDL_GPUColorTargetInfo()
let running = true

while (running) {
  // Events
  const e = new SDL_Event()
  while (SDL.SDL_PollEvent(e.pointer)) {
    e.read()
    if (e.get('type') === SDL_EventType.SDL_EVENT_QUIT) running = false
    if (e.get('type') === SDL_EventType.SDL_EVENT_KEY_DOWN) {
      if (e.get('key').get('scancode') === SDL_Scancode.SDL_SCANCODE_ESCAPE)
        running = false
    }
  }

  const cmdbuf = SDL.SDL_AcquireGPUCommandBuffer(device)
  if (!cmdbuf) continue

  const pTex = new BigUint64Array(1)
  const pW = new Uint32Array(1)
  const pH = new Uint32Array(1)

  // Non-blocking; skip frame if none or zero-sized
  const got = SDL.SDL_AcquireGPUSwapchainTexture(
    cmdbuf,
    win,
    ptr(pTex.buffer),
    ptr(pW.buffer),
    ptr(pH.buffer),
  )
  if (!got || !pTex[0] || pW[0] === 0 || pH[0] === 0) {
    SDL.SDL_SubmitGPUCommandBuffer(cmdbuf)
    await Bun.sleep(8)
    continue
  }

  colorTarget.set('texture', pTex[0])
  colorTarget.set('clear_color', CLEAR)
  colorTarget.set('load_op', SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR)
  colorTarget.set('store_op', SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE)
  colorTarget.flush()

  const pass = SDL.SDL_BeginGPURenderPass(cmdbuf, colorTarget.pointer, 1, null)
  SDL.SDL_BindGPUGraphicsPipeline(pass, pipeline)

  if (USE_VIEWPORT_AND_SCISSOR) {
    // Ensure your struct layouts are correct before enabling:
    const H = Number(pH[0])
    const W = Number(pW[0])

    const vp = new SDL_GPUViewport()
    vp.set('x', 0)
    vp.set('y', INVERSE_VIEWPORT < 0 ? H : 0)
    vp.set('w', W)
    vp.set('h', H * INVERSE_VIEWPORT)
    vp.set('min_depth', 0.0)
    vp.set('max_depth', 1.0)
    vp.flush()
    SDL.SDL_SetGPUViewport(pass, vp.pointer)

    const sc = new SDL_Rect()
    sc.set('x', 0)
    sc.set('y', 0)
    sc.set('w', pW[0]!)
    sc.set('h', pH[0]!)
    sc.flush()
    SDL.SDL_SetGPUScissor(pass, sc.pointer)
  }

  SDL.SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0)
  SDL.SDL_EndGPURenderPass(pass)

  SDL.SDL_SubmitGPUCommandBuffer(cmdbuf)

  const err = SDL.SDL_GetError().toString()
  if (err) console.log('[SDL ERROR]', err)

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
