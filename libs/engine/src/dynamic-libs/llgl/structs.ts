import {
  i32,
  struct,
  u32,
  f32,
  u8,
  u64,
  pointer,
  ptrAny,
  string,
} from '@bunbox/struct';

// LLGL MARK: Basic Types

export const llglExtent2DStruct = struct({
  width: u32(),
  height: u32(),
});

export const llglExtent3DStruct = struct({
  width: u32(),
  height: u32(),
  depth: u32(),
});

export const llglOffset2DStruct = struct({
  x: i32(),
  y: i32(),
});

export const llglOffset3DStruct = struct({
  x: i32(),
  y: i32(),
  z: i32(),
});

export const llglViewportStruct = struct({
  x: f32(),
  y: f32(),
  width: f32(),
  height: f32(),
  minDepth: f32(),
  maxDepth: f32(),
});

export const llglScissorStruct = struct({
  x: i32(),
  y: i32(),
  width: i32(),
  height: i32(),
});

export const llglColorRGBAStruct = struct({
  r: f32(),
  g: f32(),
  b: f32(),
  a: f32(),
});

export const llglClearValueStruct = struct({
  color: llglColorRGBAStruct,
  depth: f32(),
  stencil: u32(),
});

// LLGL MARK: Render System

export const llglRenderSystemDescriptorStruct = struct({
  moduleName: pointer(string()),
  flags: i32(),
  profiler: ptrAny(),
  debugger: ptrAny(),
});

export const llglRendererInfoStruct = struct({
  rendererName: pointer(string()),
  deviceName: pointer(string()),
  vendorName: pointer(string()),
  shadingLanguageName: pointer(string()),
});

export const llglRenderingCapabilitiesStruct = struct({
  screenOrigin: i32(),
  clippingRange: i32(),
  shadingLanguages: ptrAny(),
  textureFormats: ptrAny(),
  features: ptrAny(),
  limits: ptrAny(),
});

// LLGL MARK: Buffer

export const llglBufferDescriptorStruct = struct({
  size: u64(),
  stride: u32(),
  format: i32(),
  bindFlags: u32(),
  cpuAccessFlags: u32(),
  miscFlags: u32(),
  vertexAttribs: ptrAny(),
  numVertexAttribs: u32(),
});

export const llglBufferViewDescriptorStruct = struct({
  format: i32(),
  offset: u64(),
  size: u64(),
});

// LLGL MARK: Texture

export const llglTextureDescriptorStruct = struct({
  type: i32(),
  bindFlags: u32(),
  cpuAccessFlags: u32(),
  miscFlags: u32(),
  format: i32(),
  extent: llglExtent3DStruct,
  arrayLayers: u32(),
  mipLevels: u32(),
  samples: u32(),
  clearValue: llglClearValueStruct,
});

export const llglTextureRegionStruct = struct({
  subresource: struct({
    baseMipLevel: u32(),
    numMipLevels: u32(),
    baseArrayLayer: u32(),
    numArrayLayers: u32(),
  }),
  offset: llglOffset3DStruct,
  extent: llglExtent3DStruct,
});

// LLGL MARK: Sampler

export const llglSamplerDescriptorStruct = struct({
  addressModeU: i32(),
  addressModeV: i32(),
  addressModeW: i32(),
  minFilter: i32(),
  magFilter: i32(),
  mipMapFilter: i32(),
  mipMapEnabled: u8(),
  mipMapLODBias: f32(),
  minLOD: f32(),
  maxLOD: f32(),
  maxAnisotropy: u32(),
  compareEnabled: u8(),
  compareOp: i32(),
  borderColor: llglColorRGBAStruct,
});

// LLGL MARK: Shader

export const llglShaderDescriptorStruct = struct({
  type: i32(),
  source: pointer(string()),
  sourceSize: u64(),
  sourceType: i32(),
  entryPoint: pointer(string()),
  profile: pointer(string()),
  defines: ptrAny(),
  flags: u32(),
  name: pointer(string()),
});

export const llglVertexAttributeStruct = struct({
  name: pointer(string()),
  format: i32(),
  location: u32(),
  offset: u32(),
  stride: u32(),
  instanceDivisor: u32(),
  slot: u32(),
  semanticIndex: u32(),
  systemValue: i32(),
});

// LLGL MARK: Pipeline

export const llglGraphicsPipelineDescriptorStruct = struct({
  pipelineLayout: ptrAny(),
  renderPass: ptrAny(),
  vertexShader: ptrAny(),
  tessControlShader: ptrAny(),
  tessEvaluationShader: ptrAny(),
  geometryShader: ptrAny(),
  fragmentShader: ptrAny(),
  indexFormat: i32(),
  primitiveTopology: i32(),
  viewports: ptrAny(),
  numViewports: u32(),
  scissors: ptrAny(),
  numScissors: u32(),
  depth: ptrAny(),
  stencil: ptrAny(),
  rasterizer: ptrAny(),
  blend: ptrAny(),
});

export const llglComputePipelineDescriptorStruct = struct({
  pipelineLayout: ptrAny(),
  computeShader: ptrAny(),
});

export const llglDepthDescriptorStruct = struct({
  testEnabled: u8(),
  writeEnabled: u8(),
  compareOp: i32(),
});

export const llglStencilFaceDescriptorStruct = struct({
  stencilFailOp: i32(),
  depthFailOp: i32(),
  depthPassOp: i32(),
  compareOp: i32(),
  readMask: u32(),
  writeMask: u32(),
  reference: u32(),
});

export const llglStencilDescriptorStruct = struct({
  testEnabled: u8(),
  referenceDynamic: u8(),
  front: llglStencilFaceDescriptorStruct,
  back: llglStencilFaceDescriptorStruct,
});

export const llglRasterizerDescriptorStruct = struct({
  polygonMode: i32(),
  cullMode: i32(),
  depthBias: struct({
    constantFactor: f32(),
    slopeFactor: f32(),
    clamp: f32(),
  }),
  frontCCW: u8(),
  discardEnabled: u8(),
  depthClampEnabled: u8(),
  scissorTestEnabled: u8(),
  multiSampleEnabled: u8(),
  antiAliasedLineEnabled: u8(),
  conservativeRasterization: u8(),
  lineWidth: f32(),
});

export const llglBlendTargetDescriptorStruct = struct({
  blendEnabled: u8(),
  srcColor: i32(),
  dstColor: i32(),
  colorArithmetic: i32(),
  srcAlpha: i32(),
  dstAlpha: i32(),
  alphaArithmetic: i32(),
  colorMask: u8(),
});

export const llglBlendDescriptorStruct = struct({
  alphaToCoverageEnabled: u8(),
  independentBlendEnabled: u8(),
  sampleMask: u32(),
  logicOp: i32(),
  blendFactor: llglColorRGBAStruct,
  blendFactorDynamic: u8(),
  targets: ptrAny(),
  numTargets: u32(),
});

// LLGL MARK: RenderPass

export const llglAttachmentDescriptorStruct = struct({
  format: i32(),
  loadOp: i32(),
  storeOp: i32(),
  initialLayout: i32(),
  finalLayout: i32(),
});

export const llglRenderPassDescriptorStruct = struct({
  colorAttachments: ptrAny(),
  numColorAttachments: u32(),
  resolveAttachments: ptrAny(),
  numResolveAttachments: u32(),
  depthStencilAttachment: ptrAny(),
});

// LLGL MARK: RenderTarget

export const llglRenderTargetDescriptorStruct = struct({
  renderPass: ptrAny(),
  resolution: llglExtent2DStruct,
  samples: u32(),
  colorAttachments: ptrAny(),
  numColorAttachments: u32(),
  resolveAttachments: ptrAny(),
  numResolveAttachments: u32(),
  depthStencilAttachment: ptrAny(),
});

export const llglAttachmentClearStruct = struct({
  flags: u32(),
  colorAttachment: u32(),
  clearValue: llglClearValueStruct,
});
