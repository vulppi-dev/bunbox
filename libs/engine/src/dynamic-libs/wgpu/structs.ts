import { f32, f64, i32, ptrAny, struct, u32, u64 } from '@bunbox/struct';

// Core WebGPU Structs

export const wgpuStringViewStruct = struct({
  data: ptrAny(),
  length: u64(),
});

export const wgpuColorStruct = struct({
  r: f64(),
  g: f64(),
  b: f64(),
  a: f64(),
});

export const wgpuOrigin3DStruct = struct({
  x: u32(),
  y: u32(),
  z: u32(),
});

export const wgpuExtent3DStruct = struct({
  width: u32(),
  height: u32(),
  depthOrArrayLayers: u32(),
});

export const wgpuLimitsStruct = struct({
  maxTextureDimension1D: u32(),
  maxTextureDimension2D: u32(),
  maxTextureDimension3D: u32(),
  maxTextureArrayLayers: u32(),
  maxBindGroups: u32(),
  maxBindGroupsPlusVertexBuffers: u32(),
  maxBindingsPerBindGroup: u32(),
  maxDynamicUniformBuffersPerPipelineLayout: u32(),
  maxDynamicStorageBuffersPerPipelineLayout: u32(),
  maxSampledTexturesPerShaderStage: u32(),
  maxSamplersPerShaderStage: u32(),
  maxStorageBuffersPerShaderStage: u32(),
  maxStorageTexturesPerShaderStage: u32(),
  maxUniformBuffersPerShaderStage: u32(),
  maxUniformBufferBindingSize: u64(),
  maxStorageBufferBindingSize: u64(),
  minUniformBufferOffsetAlignment: u32(),
  minStorageBufferOffsetAlignment: u32(),
  maxVertexBuffers: u32(),
  maxBufferSize: u64(),
  maxVertexAttributes: u32(),
  maxVertexBufferArrayStride: u32(),
  maxInterStageShaderComponents: u32(),
  maxInterStageShaderVariables: u32(),
  maxColorAttachments: u32(),
  maxColorAttachmentBytesPerSample: u32(),
  maxComputeWorkgroupStorageSize: u32(),
  maxComputeInvocationsPerWorkgroup: u32(),
  maxComputeWorkgroupSizeX: u32(),
  maxComputeWorkgroupSizeY: u32(),
  maxComputeWorkgroupSizeZ: u32(),
  maxComputeWorkgroupsPerDimension: u32(),
});

export const wgpuAdapterInfoStruct = struct({
  nextInChain: ptrAny(),
  vendor: wgpuStringViewStruct,
  architecture: wgpuStringViewStruct,
  device: wgpuStringViewStruct,
  description: wgpuStringViewStruct,
  backendType: u32(),
  adapterType: u32(),
  vendorID: u32(),
  deviceID: u32(),
  compatibilityMode: u32(),
});

export const wgpuRequestAdapterOptionsStruct = struct({
  nextInChain: ptrAny(),
  compatibleSurface: ptrAny(),
  powerPreference: u32(),
  backendType: u32(),
  forceFallbackAdapter: u32(),
  featureLevel: u32(),
});

export const wgpuDeviceDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  requiredFeatureCount: u64(),
  requiredFeatures: ptrAny(),
  requiredLimits: ptrAny(),
  defaultQueue: ptrAny(),
  deviceLostCallback: ptrAny(),
  deviceLostUserdata: ptrAny(),
  uncapturedErrorCallbackInfo: ptrAny(),
});

export const wgpuBufferDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  usage: u32(),
  size: u64(),
  mappedAtCreation: u32(),
});

export const wgpuTextureDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  usage: u32(),
  dimension: u32(),
  size: wgpuExtent3DStruct,
  format: u32(),
  mipLevelCount: u32(),
  sampleCount: u32(),
  viewFormatCount: u64(),
  viewFormats: ptrAny(),
});

export const wgpuTextureViewDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  format: u32(),
  dimension: u32(),
  baseMipLevel: u32(),
  mipLevelCount: u32(),
  baseArrayLayer: u32(),
  arrayLayerCount: u32(),
  aspect: u32(),
  usage: u32(),
});

export const wgpuSamplerDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  addressModeU: u32(),
  addressModeV: u32(),
  addressModeW: u32(),
  magFilter: u32(),
  minFilter: u32(),
  mipmapFilter: u32(),
  lodMinClamp: f32(),
  lodMaxClamp: f32(),
  compare: u32(),
  maxAnisotropy: u32(),
});

export const wgpuBindGroupEntryStruct = struct({
  nextInChain: ptrAny(),
  binding: u32(),
  buffer: ptrAny(),
  offset: u64(),
  size: u64(),
  sampler: ptrAny(),
  textureView: ptrAny(),
});

export const wgpuBindGroupDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  layout: ptrAny(),
  entryCount: u64(),
  entries: ptrAny(),
});

export const wgpuBufferBindingLayoutStruct = struct({
  nextInChain: ptrAny(),
  type: u32(),
  hasDynamicOffset: u32(),
  minBindingSize: u64(),
});

export const wgpuSamplerBindingLayoutStruct = struct({
  nextInChain: ptrAny(),
  type: u32(),
});

export const wgpuTextureBindingLayoutStruct = struct({
  nextInChain: ptrAny(),
  sampleType: u32(),
  viewDimension: u32(),
  multisampled: u32(),
});

export const wgpuStorageTextureBindingLayoutStruct = struct({
  nextInChain: ptrAny(),
  access: u32(),
  format: u32(),
  viewDimension: u32(),
});

export const wgpuBindGroupLayoutEntryStruct = struct({
  nextInChain: ptrAny(),
  binding: u32(),
  visibility: u32(),
  buffer: wgpuBufferBindingLayoutStruct,
  sampler: wgpuSamplerBindingLayoutStruct,
  texture: wgpuTextureBindingLayoutStruct,
  storageTexture: wgpuStorageTextureBindingLayoutStruct,
});

export const wgpuBindGroupLayoutDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  entryCount: u64(),
  entries: ptrAny(),
});

export const wgpuPipelineLayoutDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  bindGroupLayoutCount: u64(),
  bindGroupLayouts: ptrAny(),
});

export const wgpuShaderModuleDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
});

export const wgpuShaderSourceWGSLStruct = struct({
  chain: ptrAny(),
  code: wgpuStringViewStruct,
});

export const wgpuBlendComponentStruct = struct({
  operation: u32(),
  srcFactor: u32(),
  dstFactor: u32(),
});

export const wgpuBlendStateStruct = struct({
  color: wgpuBlendComponentStruct,
  alpha: wgpuBlendComponentStruct,
});

export const wgpuColorTargetStateStruct = struct({
  nextInChain: ptrAny(),
  format: u32(),
  blend: ptrAny(),
  writeMask: u32(),
});

export const wgpuStencilFaceStateStruct = struct({
  compare: u32(),
  failOp: u32(),
  depthFailOp: u32(),
  passOp: u32(),
});

export const wgpuDepthStencilStateStruct = struct({
  nextInChain: ptrAny(),
  format: u32(),
  depthWriteEnabled: u32(),
  depthCompare: u32(),
  stencilFront: wgpuStencilFaceStateStruct,
  stencilBack: wgpuStencilFaceStateStruct,
  stencilReadMask: u32(),
  stencilWriteMask: u32(),
  depthBias: i32(),
  depthBiasSlopeScale: f32(),
  depthBiasClamp: f32(),
});

export const wgpuMultisampleStateStruct = struct({
  nextInChain: ptrAny(),
  count: u32(),
  mask: u32(),
  alphaToCoverageEnabled: u32(),
});

export const wgpuPrimitiveStateStruct = struct({
  nextInChain: ptrAny(),
  topology: u32(),
  stripIndexFormat: u32(),
  frontFace: u32(),
  cullMode: u32(),
  unclippedDepth: u32(),
});

export const wgpuVertexAttributeStruct = struct({
  format: u32(),
  offset: u64(),
  shaderLocation: u32(),
});

export const wgpuVertexBufferLayoutStruct = struct({
  arrayStride: u64(),
  stepMode: u32(),
  attributeCount: u64(),
  attributes: ptrAny(),
});

export const wgpuVertexStateStruct = struct({
  nextInChain: ptrAny(),
  module: ptrAny(),
  entryPoint: wgpuStringViewStruct,
  constantCount: u64(),
  constants: ptrAny(),
  bufferCount: u64(),
  buffers: ptrAny(),
});

export const wgpuProgrammableStageDescriptorStruct = struct({
  nextInChain: ptrAny(),
  module: ptrAny(),
  entryPoint: wgpuStringViewStruct,
  constantCount: u64(),
  constants: ptrAny(),
});

export const wgpuFragmentStateStruct = struct({
  nextInChain: ptrAny(),
  module: ptrAny(),
  entryPoint: wgpuStringViewStruct,
  constantCount: u64(),
  constants: ptrAny(),
  targetCount: u64(),
  targets: ptrAny(),
});

export const wgpuRenderPipelineDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  layout: ptrAny(),
  vertex: wgpuVertexStateStruct,
  primitive: wgpuPrimitiveStateStruct,
  depthStencil: ptrAny(),
  multisample: wgpuMultisampleStateStruct,
  fragment: ptrAny(),
});

export const wgpuComputePipelineDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  layout: ptrAny(),
  compute: wgpuProgrammableStageDescriptorStruct,
});

export const wgpuCommandEncoderDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
});

export const wgpuCommandBufferDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
});

export const wgpuRenderPassColorAttachmentStruct = struct({
  nextInChain: ptrAny(),
  view: ptrAny(),
  depthSlice: u32(),
  resolveTarget: ptrAny(),
  loadOp: u32(),
  storeOp: u32(),
  clearValue: wgpuColorStruct,
});

export const wgpuRenderPassDepthStencilAttachmentStruct = struct({
  view: ptrAny(),
  depthLoadOp: u32(),
  depthStoreOp: u32(),
  depthClearValue: f32(),
  depthReadOnly: u32(),
  stencilLoadOp: u32(),
  stencilStoreOp: u32(),
  stencilClearValue: u32(),
  stencilReadOnly: u32(),
});

export const wgpuRenderPassDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
  colorAttachmentCount: u64(),
  colorAttachments: ptrAny(),
  depthStencilAttachment: ptrAny(),
  occlusionQuerySet: ptrAny(),
  timestampWrites: ptrAny(),
});

export const wgpuSurfaceDescriptorStruct = struct({
  nextInChain: ptrAny(),
  label: wgpuStringViewStruct,
});

export const wgpuSurfaceConfigurationStruct = struct({
  nextInChain: ptrAny(),
  device: ptrAny(),
  format: u32(),
  usage: u32(),
  viewFormatCount: u64(),
  viewFormats: ptrAny(),
  alphaMode: u32(),
  width: u32(),
  height: u32(),
  presentMode: u32(),
});

export const wgpuSurfaceTextureStruct = struct({
  texture: ptrAny(),
  suboptimal: u32(),
  status: u32(),
});

// WGPU Native Extensions

export const wgpuInstanceExtrasStruct = struct({
  chain: ptrAny(),
  backends: u32(),
  flags: u32(),
  dx12ShaderCompiler: u32(),
  gles3MinorVersion: u32(),
  glFenceBehaviour: u32(),
  dxcPath: wgpuStringViewStruct,
  dxcMaxShaderModel: u32(),
  budgetForDeviceCreation: ptrAny(),
  budgetForDeviceLoss: ptrAny(),
});

export const wgpuDeviceExtrasStruct = struct({
  chain: ptrAny(),
  tracePath: wgpuStringViewStruct,
});

export const wgpuNativeLimitsStruct = struct({
  chain: ptrAny(),
  maxPushConstantSize: u32(),
  maxNonSamplerBindings: u32(),
});

export const wgpuPushConstantRangeStruct = struct({
  stages: u32(),
  start: u32(),
  end: u32(),
});

export const wgpuPipelineLayoutExtrasStruct = struct({
  chain: ptrAny(),
  pushConstantRangeCount: u64(),
  pushConstantRanges: ptrAny(),
});

export const wgpuShaderDefineStruct = struct({
  name: wgpuStringViewStruct,
  value: wgpuStringViewStruct,
});

export const wgpuShaderSourceGLSLStruct = struct({
  chain: ptrAny(),
  stage: u32(),
  code: wgpuStringViewStruct,
  defineCount: u32(),
  defines: ptrAny(),
});

export const wgpuShaderModuleDescriptorSpirVStruct = struct({
  label: wgpuStringViewStruct,
  sourceSize: u32(),
  source: ptrAny(),
});

export const wgpuRegistryReportStruct = struct({
  numAllocated: u64(),
  numKeptFromUser: u64(),
  numReleasedFromUser: u64(),
  elementSize: u64(),
});

export const wgpuHubReportStruct = struct({
  adapters: wgpuRegistryReportStruct,
  devices: wgpuRegistryReportStruct,
  queues: wgpuRegistryReportStruct,
  pipelineLayouts: wgpuRegistryReportStruct,
  shaderModules: wgpuRegistryReportStruct,
  bindGroupLayouts: wgpuRegistryReportStruct,
  bindGroups: wgpuRegistryReportStruct,
  commandBuffers: wgpuRegistryReportStruct,
  renderBundles: wgpuRegistryReportStruct,
  renderPipelines: wgpuRegistryReportStruct,
  computePipelines: wgpuRegistryReportStruct,
  pipelineCaches: wgpuRegistryReportStruct,
  querySets: wgpuRegistryReportStruct,
  buffers: wgpuRegistryReportStruct,
  textures: wgpuRegistryReportStruct,
  textureViews: wgpuRegistryReportStruct,
  samplers: wgpuRegistryReportStruct,
});

export const wgpuGlobalReportStruct = struct({
  surfaces: wgpuRegistryReportStruct,
  hub: wgpuHubReportStruct,
});

export const wgpuInstanceEnumerateAdapterOptionsStruct = struct({
  nextInChain: ptrAny(),
  backends: u32(),
});

export const wgpuBindGroupEntryExtrasStruct = struct({
  chain: ptrAny(),
  buffers: ptrAny(),
  bufferCount: u64(),
  samplers: ptrAny(),
  samplerCount: u64(),
  textureViews: ptrAny(),
  textureViewCount: u64(),
});

export const wgpuBindGroupLayoutEntryExtrasStruct = struct({
  chain: ptrAny(),
  count: u32(),
});

export const wgpuQuerySetDescriptorExtrasStruct = struct({
  chain: ptrAny(),
  pipelineStatistics: ptrAny(),
  pipelineStatisticCount: u64(),
});

export const wgpuSurfaceConfigurationExtrasStruct = struct({
  chain: ptrAny(),
  desiredMaximumFrameLatency: u32(),
});

export const wgpuSurfaceSourceSwapChainPanelStruct = struct({
  chain: ptrAny(),
  panelNative: ptrAny(),
});

export const wgpuPrimitiveStateExtrasStruct = struct({
  chain: ptrAny(),
  polygonMode: u32(),
  conservative: u32(),
});
