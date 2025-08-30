import {
  SDL_EventType,
  SDL_GPUCompareOp,
  SDL_GPULoadOp,
  SDL_GPUPrimitiveType,
  SDL_GPUShaderFormat,
  SDL_GPUShaderStage,
  SDL_GPUStencilOp,
  SDL_GPUStoreOp,
  SDL_InitFlags,
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
} from '$structs'

// --- init ---
if (!SDL.SDL_Init(SDL_InitFlags.SDL_INIT_VIDEO))
  throw new Error('SDL_Init falhou')

const win = SDL.SDL_CreateWindow(
  cstr('Triangle'),
  800,
  600,
  SDL_WindowFlags.SDL_WINDOW_RESIZABLE | SDL_WindowFlags.SDL_WINDOW_VULKAN,
)
if (!win) throw new Error('SDL_CreateWindow falhou')

const device = SDL.SDL_CreateGPUDevice(
  SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV,
  true,
  null,
)
if (!device) throw new Error('SDL_CreateGPUDevice falhou')
if (!SDL.SDL_ClaimWindowForGPUDevice(device, win))
  throw new Error(SDL.SDL_GetError().toString())

const swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(device, win)

// --- shaders ---
const VS_WGSL = `
struct Out { @builtin(position) pos: vec4<f32>, @location(0) color: vec3<f32> };
@vertex fn main(@builtin(vertex_index) i:u32) -> Out {
  var pos = array<vec2<f32>,3>(
    vec2(-0.6,-0.6), vec2(0.6,-0.6), vec2(0.0,0.6)
  );
  var col = array<vec3<f32>,3>(
    vec3(1,0,0), vec3(0,1,0), vec3(0,0.6,1)
  );
  var o:Out; o.pos = vec4(pos[i],0,1); o.color=col[i]; return o;
}`
const FS_WGSL = `
@fragment fn main(@location(0) c:vec3<f32>) -> @location(0) vec4<f32> {
  return vec4(c,1);
}`

function makeShader(code: Uint8Array, stage: SDL_GPUShaderStage) {
  const sci = new SDL_GPUShaderCreateInfo()
  sci.set('code', code)
  sci.set('code_size', BigInt(code.byteLength))
  sci.set('entrypoint', ptr(cstr('main')))
  sci.set('format', SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV)
  sci.set('stage', stage)
  sci.flush()
  return SDL.SDL_CreateGPUShader(device, sci.pointer)!
}

const vs = makeShader(
  wgsl_to_spirv_bin(VS_WGSL, 'vertex', 'main'),
  SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_VERTEX,
)
const fs = makeShader(
  wgsl_to_spirv_bin(FS_WGSL, 'fragment', 'main'),
  SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_FRAGMENT,
)

// --- pipeline ---
const colorDesc = new SDL_GPUColorTargetDescription()
colorDesc.set('format', swapFormat)
colorDesc.flush()

const targetInfo = new SDL_GPUGraphicsPipelineTargetInfo()
targetInfo.set('color_target_descriptions', colorDesc)
targetInfo.set('num_color_targets', 1)
targetInfo.flush()

const depthstencil = new SDL_GPUDepthStencilState()
depthstencil.set('compare_op', SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS)

// Front face
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

// Back face
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

// Masks (qualquer valor válido != lixo)
depthstencil.set('compare_mask', 0xff)
depthstencil.set('write_mask', 0x00) // 0 para não escrever (opcional)
depthstencil.flush()

// (Opcional, mas recomendado p/ evitar asserts de MSAA)
const multisample = new SDL_GPUMultisampleState()
multisample.set('sample_count', 1)
multisample.set('sample_mask', 0)
multisample.set('enable_mask', false)
multisample.set('enable_alpha_to_coverage', false)
multisample.flush()

const gpci = new SDL_GPUGraphicsPipelineCreateInfo()
// --- pipeline ---
gpci.set('vertex_shader', vs)
gpci.set('fragment_shader', fs)
gpci.set(
  'primitive_type',
  SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_TRIANGLELIST,
)
gpci.set('target_info', targetInfo)
gpci.set('depth_stencil_state', depthstencil) // <-- importante
gpci.set('multisample_state', multisample) // <-- opcional, mas seguro
gpci.flush()

const pipeline = SDL.SDL_CreateGPUGraphicsPipeline(device, gpci.buffer)
if (!pipeline) throw new Error('pipeline falhou')

// --- loop ---
const CLEAR = new SDL_FColor()
CLEAR.set('r', 0.06)
CLEAR.set('g', 0.06)
CLEAR.set('b', 0.09)
CLEAR.set('a', 1)
CLEAR.flush()

const colorTarget = new SDL_GPUColorTargetInfo()

let running = true
while (running) {
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

  const pTex = new BigUint64Array(1),
    pW = new Uint32Array(1),
    pH = new Uint32Array(1)
  const ok = SDL.SDL_WaitAndAcquireGPUSwapchainTexture(
    cmdbuf,
    win,
    ptr(pTex.buffer),
    ptr(pW.buffer),
    ptr(pH.buffer),
  )
  if (!ok || !pTex[0]) {
    SDL.SDL_SubmitGPUCommandBuffer(cmdbuf)
    continue
  }

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
