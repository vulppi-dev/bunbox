import { App, Renderer, Window } from '.';

const app = new App();
app.setLogPriority('verbose');

const win = new Window({
  title: '2D Square',
  features: {
    resizable: true,
    highPixelDensity: true,
  },
});
win.on('quit', (ev) => {
  win.dispose();
  app.dispose();
});

win.width = 200;
win.height = 200;

const render = new Renderer();
render.clearColor.set(1.0, 0.4, 0.0, 1);

app.addChild(win);
win.addChild(render);

// Toggle: only enable if your struct layouts match (Viewport=24 bytes, Rect=16 bytes)
// const USE_VIEWPORT_AND_SCISSOR = true;
// const INVERSE_VIEWPORT = process.platform === 'darwin' ? 1 : -1; // flip Y on Vulkan

// console.log('SDL_GPU Driver:', SDL.SDL_GetGPUDeviceDriver(device)?.toString());
// const swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(device, win);

// // --- shaders (minimal; const color) ---
// const VS_WGSL = `
// @vertex fn main(@builtin(vertex_index) i:u32) -> @builtin(position) vec4<f32> {
//   var p = array<vec2<f32>,3>( vec2(-0.6,-0.6), vec2(0.6,-0.6), vec2(0.0,0.6) );
//   return vec4(p[i], 0.0, 1.0);
// }`;
// const FS_WGSL = `
// @fragment fn main() -> @location(0) vec4<f32> {
//   return vec4(1.0, 0.55, 0.2, 1.0);
// }`;

// function makeShader(spvU32: Uint8Array, stage: SDL_GPUShaderStage) {
//   const sci = new SDL_GPUShaderCreateInfo();
//   sci.properties.code = spvU32;
//   sci.properties.code_size = BigInt(spvU32.byteLength); // BYTES, not words
//   sci.properties.entrypoint = 'main';
//   sci.properties.format = SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV;
//   sci.properties.stage = stage;
//   sci.properties.num_samplers = 0;
//   sci.properties.num_storage_textures = 0;
//   sci.properties.num_storage_buffers = 0;
//   sci.properties.num_uniform_buffers = 0;
//   const sh = SDL.SDL_CreateGPUShader(device, sci.bunPointer);
//   if (!sh) throw new Error('SDL_CreateGPUShader failed');
//   return sh;
// }

// const vs = makeShader(
//   wgsl_to_spirv_bin(VS_WGSL, 'vertex', 'main'),
//   SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_VERTEX,
// );
// const fs = makeShader(
//   wgsl_to_spirv_bin(FS_WGSL, 'fragment', 'main'),
//   SDL_GPUShaderStage.SDL_GPU_SHADERSTAGE_FRAGMENT,
// );

// // --- pipeline/targets ---
// const colorDesc = new SDL_GPUColorTargetDescription();
// colorDesc.properties.format = swapFormat;

// const targetInfo = new SDL_GPUGraphicsPipelineTargetInfo();
// targetInfo.properties.color_target_descriptions = colorDesc;
// targetInfo.properties.num_color_targets = 1;
// targetInfo.properties.depth_stencil_format = 0;
// targetInfo.properties.has_depth_stencil_target = false;

// const depthstencil = new SDL_GPUDepthStencilState();
// depthstencil.properties.compare_op = SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
// depthstencil.properties.front_stencil_state.properties.fail_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.front_stencil_state.properties.pass_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.front_stencil_state.properties.depth_fail_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.front_stencil_state.properties.compare_op =
//   SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
// depthstencil.properties.back_stencil_state.properties.fail_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.back_stencil_state.properties.pass_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.back_stencil_state.properties.depth_fail_op =
//   SDL_GPUStencilOp.SDL_GPU_STENCILOP_KEEP;
// depthstencil.properties.back_stencil_state.properties.compare_op =
//   SDL_GPUCompareOp.SDL_GPU_COMPAREOP_ALWAYS;
// depthstencil.properties.compare_mask = 0xff;
// depthstencil.properties.write_mask = 0x00;
// depthstencil.properties.enable_depth_test = false;
// depthstencil.properties.enable_depth_write = false;
// depthstencil.properties.enable_stencil_test = false;

// const multisample = new SDL_GPUMultisampleState();
// multisample.properties.sample_count = SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
// multisample.properties.sample_mask = 0; // reserved → 0
// multisample.properties.enable_mask = false; // reserved → false
// multisample.properties.enable_alpha_to_coverage = false;

// const gpci = new SDL_GPUGraphicsPipelineCreateInfo();
// gpci.properties.vertex_shader = BigInt(vs);
// gpci.properties.fragment_shader = BigInt(fs);
// gpci.properties.primitive_type =
//   SDL_GPUPrimitiveType.SDL_GPU_PRIMITIVETYPE_TRIANGLELIST;
// gpci.properties.target_info = targetInfo;
// gpci.properties.depth_stencil_state = depthstencil;
// gpci.properties.multisample_state = multisample;
// // rasterizer explicit
// gpci.properties.rasterizer_state.properties.fill_mode =
//   SDL_GPUFillMode.SDL_GPU_FILLMODE_FILL;
// gpci.properties.rasterizer_state.properties.cull_mode =
//   SDL_GPUCullMode.SDL_GPU_CULLMODE_NONE;
// gpci.properties.rasterizer_state.properties.front_face =
//   SDL_GPUFrontFace.SDL_GPU_FRONTFACE_CLOCKWISE;
// gpci.properties.rasterizer_state.properties.depth_bias_constant_factor = 0;
// gpci.properties.rasterizer_state.properties.depth_bias_clamp = 0;
// gpci.properties.rasterizer_state.properties.depth_bias_slope_factor = 0;
// gpci.properties.rasterizer_state.properties.enable_depth_bias = false;
// gpci.properties.rasterizer_state.properties.enable_depth_clip = false;

// const pipeline = SDL.SDL_CreateGPUGraphicsPipeline(device, ptr(gpci.buffer));
// if (!pipeline) throw new Error('SDL_CreateGPUGraphicsPipeline failed');

// // --- frame loop ---
// const CLEAR = new SDL_FColor();
// CLEAR.properties.r = 0.06;
// CLEAR.properties.g = 0.06;
// CLEAR.properties.b = 0.09;
// CLEAR.properties.a = 1;

// const colorTarget = new SDL_GPUColorTargetInfo();
// let running = true;

// while (running) {
//   // Events
//   const e = new SDL_Event();
//   while (SDL.SDL_PollEvent(e.bunPointer)) {
//     if (e.properties.type === SDL_EventType.SDL_EVENT_QUIT) running = false;
//     if (e.properties.type === SDL_EventType.SDL_EVENT_KEY_DOWN) {
//       if (
//         e.properties.key.properties.scancode ===
//         SDL_Scancode.SDL_SCANCODE_ESCAPE
//       )
//         running = false;
//     }
//   }

//   const cmdbuf = SDL.SDL_AcquireGPUCommandBuffer(device);
//   if (!cmdbuf) continue;

//   const pTex = new BigUint64Array(1);
//   const pW = new Uint32Array(1);
//   const pH = new Uint32Array(1);

//   // Non-blocking; skip frame if none or zero-sized
//   const got = SDL.SDL_AcquireGPUSwapchainTexture(
//     cmdbuf,
//     win,
//     ptr(pTex.buffer),
//     ptr(pW.buffer),
//     ptr(pH.buffer),
//   );
//   if (!got || !pTex[0] || pW[0] === 0 || pH[0] === 0) {
//     SDL.SDL_SubmitGPUCommandBuffer(cmdbuf);
//     await sleep(8);
//     continue;
//   }

//   colorTarget.properties.texture = pTex[0];
//   colorTarget.properties.clear_color = CLEAR;
//   colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR;
//   colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

//   const pass = SDL.SDL_BeginGPURenderPass(
//     cmdbuf,
//     colorTarget.bunPointer,
//     1,
//     null,
//   );
//   SDL.SDL_BindGPUGraphicsPipeline(pass, pipeline);

//   if (USE_VIEWPORT_AND_SCISSOR) {
//     // Ensure your struct layouts are correct before enabling:
//     const H = Number(pH[0]);
//     const W = Number(pW[0]);

//     const vp = new SDL_GPUViewport();
//     vp.properties.x = 0;
//     vp.properties.y = INVERSE_VIEWPORT < 0 ? H : 0;
//     vp.properties.w = W;
//     vp.properties.h = H * INVERSE_VIEWPORT;
//     vp.properties.min_depth = 0.0;
//     vp.properties.max_depth = 1.0;
//     SDL.SDL_SetGPUViewport(pass, vp.bunPointer);

//     const sc = new SDL_Rect();
//     sc.properties.x = 0;
//     sc.properties.y = 0;
//     sc.properties.w = pW[0]!;
//     sc.properties.h = pH[0]!;
//     SDL.SDL_SetGPUScissor(pass, sc.bunPointer);
//   }

//   SDL.SDL_DrawGPUPrimitives(pass, 3, 1, 0, 0);
//   SDL.SDL_EndGPURenderPass(pass);

//   SDL.SDL_SubmitGPUCommandBuffer(cmdbuf);

//   const err = SDL.SDL_GetError().toString();
//   if (err) console.log('[SDL ERROR]', err);

//   await sleep(0);
// }
