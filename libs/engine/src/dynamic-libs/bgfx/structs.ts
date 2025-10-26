import {
  array,
  bool,
  f32,
  i32,
  i64,
  pointer,
  ptrAny,
  struct,
  u16,
  u32,
  u64,
  u8,
} from '@bunbox/struct';
import { BGFX_Attributes, BGFX_TextureFormat, BGFX_Topology } from './enums';

// BGFX MARK: General

export const bgfxPlatformDataStruct = struct({
  ndt: ptrAny(),
  nwh: ptrAny(),
  context: ptrAny(),
  backBuffer: ptrAny(),
  backBufferDS: ptrAny(),
  type: u32(),
});

export const bgfxResolutionStruct = struct({
  format: u32(),
  width: u32(),
  height: u32(),
  reset: u32(),
  numBackBuffers: u8(),
  maxFrameLatency: u8(),
  debugTextScale: u8(),
});

export const bgfxInitStruct = struct({
  type: u32(),
  vendorId: u16(),
  deviceId: u16(),
  capabilities: u64(),
  debug: bool(),
  profile: bool(),
  platformData: bgfxPlatformDataStruct,
  resolution: bgfxResolutionStruct,
  limits: struct({
    maxEncoders: u16(),
    minResourceCbSize: u32(),
    transientVbSize: u32(),
    transientIbSize: u32(),
  }),
  callback: ptrAny(),
  allocator: ptrAny(),
});

export const bgfxCallbackInterfaceStruct = struct({
  fatal: ptrAny(),
  traceVargs: ptrAny(),
  profileBegin: ptrAny(),
  profileBeginLiteral: ptrAny(),
  profileEnd: ptrAny(),
  cacheReadSize: ptrAny(),
  cacheRead: ptrAny(),
  cacheWrite: ptrAny(),
  screenShot: ptrAny(),
  captureBegin: ptrAny(),
  captureEnd: ptrAny(),
  captureFrame: ptrAny(),
});

export const bgfxCallbackStruct = struct({
  callback: ptrAny(),
});

export const bgfxCapsStruct = struct({
  rendererType: u32(),
  supported: u64(),
  vendorId: u16(),
  deviceId: u16(),
  homogeneousDepth: bool(),
  originBottomLeft: bool(),
  numGPUs: u16(),
  gpu: array(
    struct({
      vendorId: u16(),
      deviceId: u16(),
    }),
    4,
  ),
  limits: struct({
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
    maxDynamicVertexBuffer: u32(),
    maxUniforms: u32(),
    maxOcclusionQueries: u32(),
    maxEncoders: u32(),
    minResourceCbSize: u32(),
    transientVbSize: u32(),
    transientIbSize: u32(),
  }),
  formats: array(u16(), BGFX_TextureFormat.Count),
});

export const bgfxViewStatsStruct = struct({
  name: array(u8(), 256),
  view: u16(),
  cpuTimeBegin: i64(),
  cpuTimeEnd: i64(),
  gpuTimeBegin: i64(),
  gpuTimeEnd: i64(),
  gpuFrameNum: u32(),
});

export const bgfxEncoderStatsStruct = struct({
  cpuTimeBegin: i64(),
  cpuTimeEnd: i64(),
});

export const bgfxStatsStruct = struct({
  cpuTimeFrame: i64(),
  cpuTimeBegin: i64(),
  cpuTimeEnd: i64(),
  cpuTimeFreq: i64(),
  gpuTimeBegin: i64(),
  gpuTimeEnd: i64(),
  gpuTimeFreq: i64(),
  waitRender: i64(),
  waitSubmit: i64(),

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

  textureMemoryUsed: i64(),
  rtMemoryUsed: i64(),
  transientVbUsed: i32(),
  transientIbUsed: i32(),

  numPrims: array(u32(), BGFX_Topology.Count),

  gpuMemoryMax: i64(),
  gpuMemoryUsed: i64(),

  width: u16(),
  height: u16(),
  textWidth: u16(),
  textHeight: u16(),
  numViews: u16(),

  viewStats: pointer(bgfxViewStatsStruct),
  numEncoders: u8(),
  encoderStats: pointer(bgfxEncoderStatsStruct),
});

export const bgfxInternalDataStruct = struct({
  caps: pointer(bgfxCapsStruct),
  context: ptrAny(),
});

// BGFX MARK: Encoder

export const bgfxTransientIndexBufferStruct = struct({
  data: pointer(u8()),
  size: u32(),
  startIndex: u32(),
  handle: ptrAny(),
  isIndex16: bool(),
});

export const bgfxTransientVertexBufferStruct = struct({
  data: pointer(u8()),
  size: u32(),
  startVertex: u32(),
  stride: u16(),
  handle: ptrAny(),
  layoutHandle: ptrAny(),
});

export const bgfxInstanceDataBufferStruct = struct({
  data: pointer(u8()),
  size: u32(),
  offset: u32(),
  num: u32(),
  stride: u16(),
  handle: ptrAny(),
});

// BGFX MARK: Resources

export const bgfxMemoryStruct = struct({
  data: pointer(u8()),
  size: u32(),
});

export const bgfxUniformInfoStruct = struct({
  name: array(u8(), 256),
  type: u32(),
  num: u16(),
});

export const bgfxVertexLayoutStruct = struct({
  hash: u32(),
  stride: u16(),
  offset: array(u16(), BGFX_Attributes.Count),
  attributes: array(u16(), BGFX_Attributes.Count),
});

export const bgfxTextureInfoStruct = struct({
  format: u32(),
  storageSize: u32(),
  width: u16(),
  height: u16(),
  depth: u16(),
  numLayers: u16(),
  numMips: u8(),
  bitsPerPixel: u8(),
  cubeMap: bool(),
});

export const bgfxAttachmentStruct = struct({
  access: u32(),
  handle: ptrAny(),
  mip: u16(),
  layer: u16(),
  numLayers: u16(),
  resolve: bool(),
});
