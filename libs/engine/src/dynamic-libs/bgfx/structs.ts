import {
  array,
  f32,
  i32,
  ptrAny,
  struct,
  u16,
  u32,
  u64,
  u8,
} from '@bunbox/struct';

// BGFX MARK: Memory

/** Memory must be obtained by calling bgfx_alloc, bgfx_copy, or bgfx_make_ref. */
export const memory = struct({
  data: ptrAny(),
  size: u32(),
});

// BGFX MARK: Transform

export const transform = struct({
  data: ptrAny(),
  num: u16(),
});

// BGFX MARK: Transient Index Buffer

export const transientIndexBuffer = struct({
  data: ptrAny(),
  size: u32(),
  startIndex: u32(),
  handle: u16(),
  isIndex16: u8(),
});

// BGFX MARK: Transient Vertex Buffer

export const transientVertexBuffer = struct({
  data: ptrAny(),
  size: u32(),
  startVertex: u32(),
  stride: u16(),
  handle: u16(),
  layoutHandle: u16(),
});

// BGFX MARK: Instance Data Buffer

export const instanceDataBuffer = struct({
  data: ptrAny(),
  size: u32(),
  offset: u32(),
  num: u32(),
  stride: u16(),
  handle: u16(),
});

// BGFX MARK: Texture Info

export const textureInfo = struct({
  format: u32(),
  storageSize: u32(),
  width: u16(),
  height: u16(),
  depth: u16(),
  numLayers: u16(),
  numMips: u8(),
  bitsPerPixel: u8(),
  cubeMap: u8(),
});

// BGFX MARK: Uniform Info

export const uniformInfo = struct({
  name: array(u8(), 256),
  type: u32(),
  num: u16(),
});

// BGFX MARK: Attachment

export const attachment = struct({
  access: u32(),
  handle: u16(),
  mip: u16(),
  layer: u16(),
  numLayers: u16(),
  resolve: u8(),
});

// BGFX MARK: Caps GPU

export const capsGPU = struct({
  vendorId: u16(),
  deviceId: u16(),
});

// BGFX MARK: Caps Limits

export const capsLimits = struct({
  maxDrawCalls: u32(),
  maxBlits: u32(),
  maxTextureSize: u32(),
  maxTextureLayers: u32(),
  maxViews: u32(),
  maxFrameBuffers: u32(),
  maxFBAttachments: u32(),
  maxPrograms: u32(),
  maxShaders: u32(),
  maxTextures: u32(),
  maxTextureSamplers: u32(),
  maxComputeBindings: u32(),
  maxVertexLayouts: u32(),
  maxVertexStreams: u32(),
  maxIndexBuffers: u32(),
  maxVertexBuffers: u32(),
  maxDynamicIndexBuffers: u32(),
  maxDynamicVertexBuffers: u32(),
  maxUniforms: u32(),
  maxOcclusionQueries: u32(),
  maxEncoders: u32(),
  minResourceCbSize: u32(),
  transientVbSize: u32(),
  transientIbSize: u32(),
});

// BGFX MARK: Caps

export const caps = struct({
  rendererType: u32(),
  supported: u64(),
  vendorId: u16(),
  deviceId: u16(),
  homogeneousDepth: u8(),
  originBottomLeft: u8(),
  numGPUs: u8(),
  gpu: array(capsGPU, 4),
  limits: capsLimits,
  formats: array(u16(), 96),
});

// BGFX MARK: Internal Data

export const internalData = struct({
  caps: ptrAny(),
  context: ptrAny(),
});

// BGFX MARK: Platform Data

export const platformData = struct({
  ndt: ptrAny(),
  nwh: ptrAny(),
  context: ptrAny(),
  backBuffer: ptrAny(),
  backBufferDS: ptrAny(),
  type: u32(),
});

// BGFX MARK: Resolution

export const resolution = struct({
  format: u32(),
  width: u32(),
  height: u32(),
  reset: u32(),
  numBackBuffers: u8(),
  maxFrameLatency: u8(),
  debugTextScale: u8(),
});

// BGFX MARK: Init Limits

export const initLimits = struct({
  maxEncoders: u16(),
  minResourceCbSize: u32(),
  transientVbSize: u32(),
  transientIbSize: u32(),
});

// BGFX MARK: Init

export const init = struct({
  type: u32(),
  vendorId: u16(),
  deviceId: u16(),
  capabilities: u64(),
  debug: u8(),
  profile: u8(),
  platformData: platformData,
  resolution: resolution,
  limits: initLimits,
  callback: ptrAny(),
  allocator: ptrAny(),
});

// BGFX MARK: Stats

export const stats = struct({
  cpuTimeFrame: i32(),
  cpuTimeBegin: i32(),
  cpuTimeEnd: i32(),
  cpuTimerFreq: i32(),
  gpuTimeBegin: i32(),
  gpuTimeEnd: i32(),
  gpuTimerFreq: i32(),
  waitRender: i32(),
  waitSubmit: i32(),
  numDraw: u32(),
  numCompute: u32(),
  numBlit: u32(),
  maxGpuLatency: u32(),
  gpuFrameNum: u32(),
  numDynamicIndexBuffers: u16(),
  numDynamicVertexBuffers: u16(),
  numFrameBuffers: u16(),
  numIndexBuffers: u16(),
  numOcclusionQueries: u16(),
  numPrograms: u16(),
  numShaders: u16(),
  numTextures: u16(),
  numUniforms: u16(),
  numVertexBuffers: u16(),
  numVertexLayouts: u16(),
  textureMemoryUsed: i32(),
  rtMemoryUsed: i32(),
  transientVbUsed: i32(),
  transientIbUsed: i32(),
  numPrims: array(u32(), 5),
  gpuMemoryMax: i32(),
  gpuMemoryUsed: i32(),
  width: u16(),
  height: u16(),
  textWidth: u16(),
  textHeight: u16(),
  numViews: u16(),
  viewStats: ptrAny(),
  numEncoders: u8(),
  encoderStats: ptrAny(),
});

// BGFX MARK: Vertex Layout

export const vertexLayout = struct({
  hash: u32(),
  stride: u16(),
  offset: array(u16(), 18),
  attributes: array(u16(), 18),
});

// BGFX MARK: Encoder

export const encoder = struct({
  // Opaque pointer
  _opaque: ptrAny(),
});
