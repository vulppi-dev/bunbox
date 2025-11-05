// WebGPU Native Enums

export enum WGPUAdapterType {
  DiscreteGPU = 0x00000001,
  IntegratedGPU = 0x00000002,
  CPU = 0x00000003,
  Unknown = 0x00000004,
}

export enum WGPUAddressMode {
  Undefined = 0x00000000,
  ClampToEdge = 0x00000001,
  Repeat = 0x00000002,
  MirrorRepeat = 0x00000003,
}

export enum WGPUBackendType {
  Undefined = 0x00000000,
  Null = 0x00000001,
  WebGPU = 0x00000002,
  D3D11 = 0x00000003,
  D3D12 = 0x00000004,
  Metal = 0x00000005,
  Vulkan = 0x00000006,
  OpenGL = 0x00000007,
  OpenGLES = 0x00000008,
}

export enum WGPUBlendFactor {
  Undefined = 0x00000000,
  Zero = 0x00000001,
  One = 0x00000002,
  Src = 0x00000003,
  OneMinusSrc = 0x00000004,
  SrcAlpha = 0x00000005,
  OneMinusSrcAlpha = 0x00000006,
  Dst = 0x00000007,
  OneMinusDst = 0x00000008,
  DstAlpha = 0x00000009,
  OneMinusDstAlpha = 0x0000000a,
  SrcAlphaSaturated = 0x0000000b,
  Constant = 0x0000000c,
  OneMinusConstant = 0x0000000d,
  Src1 = 0x0000000e,
  OneMinusSrc1 = 0x0000000f,
  Src1Alpha = 0x00000010,
  OneMinusSrc1Alpha = 0x00000011,
}

export enum WGPUBlendOperation {
  Undefined = 0x00000000,
  Add = 0x00000001,
  Subtract = 0x00000002,
  ReverseSubtract = 0x00000003,
  Min = 0x00000004,
  Max = 0x00000005,
}

export enum WGPUBufferBindingType {
  BindingNotUsed = 0x00000000,
  Undefined = 0x00000001,
  Uniform = 0x00000002,
  Storage = 0x00000003,
  ReadOnlyStorage = 0x00000004,
}

export enum WGPUBufferMapState {
  Unmapped = 0x00000001,
  Pending = 0x00000002,
  Mapped = 0x00000003,
}

export enum WGPUCallbackMode {
  WaitAnyOnly = 0x00000001,
  AllowProcessEvents = 0x00000002,
  AllowSpontaneous = 0x00000003,
}

export enum WGPUCompareFunction {
  Undefined = 0x00000000,
  Never = 0x00000001,
  Less = 0x00000002,
  Equal = 0x00000003,
  LessEqual = 0x00000004,
  Greater = 0x00000005,
  NotEqual = 0x00000006,
  GreaterEqual = 0x00000007,
  Always = 0x00000008,
}

export enum WGPUCompilationInfoRequestStatus {
  Success = 0x00000001,
  InstanceDropped = 0x00000002,
  Error = 0x00000003,
  Unknown = 0x00000004,
}

export enum WGPUCompilationMessageType {
  Error = 0x00000001,
  Warning = 0x00000002,
  Info = 0x00000003,
}

export enum WGPUCompositeAlphaMode {
  Auto = 0x00000000,
  Opaque = 0x00000001,
  Premultiplied = 0x00000002,
  Unpremultiplied = 0x00000003,
  Inherit = 0x00000004,
}

export enum WGPUCreatePipelineAsyncStatus {
  Success = 0x00000001,
  InstanceDropped = 0x00000002,
  ValidationError = 0x00000003,
  InternalError = 0x00000004,
  Unknown = 0x00000005,
}

export enum WGPUCullMode {
  Undefined = 0x00000000,
  None = 0x00000001,
  Front = 0x00000002,
  Back = 0x00000003,
}

export enum WGPUDeviceLostReason {
  Unknown = 0x00000001,
  Destroyed = 0x00000002,
  InstanceDropped = 0x00000003,
  FailedCreation = 0x00000004,
}

export enum WGPUErrorFilter {
  Validation = 0x00000001,
  OutOfMemory = 0x00000002,
  Internal = 0x00000003,
}

export enum WGPUErrorType {
  NoError = 0x00000001,
  Validation = 0x00000002,
  OutOfMemory = 0x00000003,
  Internal = 0x00000004,
  Unknown = 0x00000005,
}

export enum WGPUFeatureLevel {
  Compatibility = 0x00000001,
  Core = 0x00000002,
}

export enum WGPUFeatureName {
  Undefined = 0x00000000,
  DepthClipControl = 0x00000001,
  Depth32FloatStencil8 = 0x00000002,
  TimestampQuery = 0x00000003,
  TextureCompressionBC = 0x00000004,
  TextureCompressionBCSliced3D = 0x00000005,
  TextureCompressionETC2 = 0x00000006,
  TextureCompressionASTC = 0x00000007,
  TextureCompressionASTCSliced3D = 0x00000008,
  IndirectFirstInstance = 0x00000009,
  ShaderF16 = 0x0000000a,
  RG11B10UfloatRenderable = 0x0000000b,
  BGRA8UnormStorage = 0x0000000c,
  Float32Filterable = 0x0000000d,
  Float32Blendable = 0x0000000e,
  ClipDistances = 0x0000000f,
  DualSourceBlending = 0x00000010,
}

export enum WGPUFilterMode {
  Undefined = 0x00000000,
  Nearest = 0x00000001,
  Linear = 0x00000002,
}

export enum WGPUFrontFace {
  Undefined = 0x00000000,
  CCW = 0x00000001,
  CW = 0x00000002,
}

export enum WGPUIndexFormat {
  Undefined = 0x00000000,
  Uint16 = 0x00000001,
  Uint32 = 0x00000002,
}

export enum WGPULoadOp {
  Undefined = 0x00000000,
  Load = 0x00000001,
  Clear = 0x00000002,
}

export enum WGPUMapAsyncStatus {
  Success = 0x00000001,
  InstanceDropped = 0x00000002,
  Error = 0x00000003,
  Aborted = 0x00000004,
  Unknown = 0x00000005,
}

export enum WGPUMipmapFilterMode {
  Undefined = 0x00000000,
  Nearest = 0x00000001,
  Linear = 0x00000002,
}

export enum WGPUOptionalBool {
  False = 0x00000000,
  True = 0x00000001,
  Undefined = 0x00000002,
}

export enum WGPUPopErrorScopeStatus {
  Success = 0x00000001,
  InstanceDropped = 0x00000002,
  EmptyStack = 0x00000003,
}

export enum WGPUPowerPreference {
  Undefined = 0x00000000,
  LowPower = 0x00000001,
  HighPerformance = 0x00000002,
}

export enum WGPUPresentMode {
  Undefined = 0x00000000,
  Fifo = 0x00000001,
  FifoRelaxed = 0x00000002,
  Immediate = 0x00000003,
  Mailbox = 0x00000004,
}

export enum WGPUPrimitiveTopology {
  Undefined = 0x00000000,
  PointList = 0x00000001,
  LineList = 0x00000002,
  LineStrip = 0x00000003,
  TriangleList = 0x00000004,
  TriangleStrip = 0x00000005,
}

export enum WGPUQueryType {
  Occlusion = 0x00000001,
  Timestamp = 0x00000002,
}

export enum WGPUQueueWorkDoneStatus {
  Success = 0x00000001,
  InstanceDropped = 0x00000002,
  Error = 0x00000003,
  Unknown = 0x00000004,
}

// WGPU Native Extensions

export enum WGPUNativeSType {
  DeviceExtras = 0x00030001,
  NativeLimits = 0x00030002,
  PipelineLayoutExtras = 0x00030003,
  ShaderSourceGLSL = 0x00030004,
  InstanceExtras = 0x00030006,
  BindGroupEntryExtras = 0x00030007,
  BindGroupLayoutEntryExtras = 0x00030008,
  QuerySetDescriptorExtras = 0x00030009,
  SurfaceConfigurationExtras = 0x0003000a,
  SurfaceSourceSwapChainPanel = 0x0003000b,
  PrimitiveStateExtras = 0x0003000c,
}

export enum WGPUNativeFeature {
  PushConstants = 0x00030001,
  TextureAdapterSpecificFormatFeatures = 0x00030002,
  MultiDrawIndirectCount = 0x00030004,
  VertexWritableStorage = 0x00030005,
  TextureBindingArray = 0x00030006,
  SampledTextureAndStorageBufferArrayNonUniformIndexing = 0x00030007,
  PipelineStatisticsQuery = 0x00030008,
  StorageResourceBindingArray = 0x00030009,
  PartiallyBoundBindingArray = 0x0003000a,
  TextureFormat16bitNorm = 0x0003000b,
  TextureCompressionAstcHdr = 0x0003000c,
  MappablePrimaryBuffers = 0x0003000e,
  BufferBindingArray = 0x0003000f,
  UniformBufferAndStorageTextureArrayNonUniformIndexing = 0x00030010,
  PolygonModeLine = 0x00030013,
  PolygonModePoint = 0x00030014,
  ConservativeRasterization = 0x00030015,
  SpirvShaderPassthrough = 0x00030017,
  VertexAttribute64bit = 0x00030019,
  TextureFormatNv12 = 0x0003001a,
  RayQuery = 0x0003001c,
  ShaderF64 = 0x0003001d,
  ShaderI16 = 0x0003001e,
  ShaderPrimitiveIndex = 0x0003001f,
  ShaderEarlyDepthTest = 0x00030020,
  Subgroup = 0x00030021,
  SubgroupVertex = 0x00030022,
  SubgroupBarrier = 0x00030023,
  TimestampQueryInsideEncoders = 0x00030024,
  TimestampQueryInsidePasses = 0x00030025,
  ShaderInt64 = 0x00030026,
}

export enum WGPULogLevel {
  Off = 0x00000000,
  Error = 0x00000001,
  Warn = 0x00000002,
  Info = 0x00000003,
  Debug = 0x00000004,
  Trace = 0x00000005,
}

export enum WGPUInstanceBackend {
  All = 0x00000000,
  Vulkan = 1 << 0,
  GL = 1 << 1,
  Metal = 1 << 2,
  DX12 = 1 << 3,
  DX11 = 1 << 4,
  BrowserWebGPU = 1 << 5,
  Primary = (1 << 0) | (1 << 2) | (1 << 3) | (1 << 5),
  Secondary = (1 << 1) | (1 << 4),
}

export enum WGPUInstanceFlag {
  Default = 0x00000000,
  Debug = 1 << 0,
  Validation = 1 << 1,
  DiscardHalLabels = 1 << 2,
}

export enum WGPUDx12Compiler {
  Undefined = 0x00000000,
  Fxc = 0x00000001,
  Dxc = 0x00000002,
}

export enum WGPUGles3MinorVersion {
  Automatic = 0x00000000,
  Version0 = 0x00000001,
  Version1 = 0x00000002,
  Version2 = 0x00000003,
}

export enum WGPUPipelineStatisticName {
  VertexShaderInvocations = 0x00000000,
  ClipperInvocations = 0x00000001,
  ClipperPrimitivesOut = 0x00000002,
  FragmentShaderInvocations = 0x00000003,
  ComputeShaderInvocations = 0x00000004,
}

export enum WGPUNativeQueryType {
  PipelineStatistics = 0x00030000,
}

export enum WGPUDxcMaxShaderModel {
  V6_0 = 0x00000000,
  V6_1 = 0x00000001,
  V6_2 = 0x00000002,
  V6_3 = 0x00000003,
  V6_4 = 0x00000004,
  V6_5 = 0x00000005,
  V6_6 = 0x00000006,
  V6_7 = 0x00000007,
}

export enum WGPUGLFenceBehaviour {
  Normal = 0x00000000,
  AutoFinish = 0x00000001,
}

export enum WGPUPolygonMode {
  Fill = 0,
  Line = 1,
  Point = 2,
}

export enum WGPUNativeTextureFormat {
  R16Unorm = 0x00030001,
  R16Snorm = 0x00030002,
  Rg16Unorm = 0x00030003,
  Rg16Snorm = 0x00030004,
  Rgba16Unorm = 0x00030005,
  Rgba16Snorm = 0x00030006,
  NV12 = 0x00030007,
  P010 = 0x00030008,
}

// Constants
export const WGPU_ARRAY_LAYER_COUNT_UNDEFINED = 0xffffffff;
export const WGPU_COPY_STRIDE_UNDEFINED = 0xffffffff;
export const WGPU_DEPTH_SLICE_UNDEFINED = 0xffffffff;
export const WGPU_LIMIT_U32_UNDEFINED = 0xffffffff;
export const WGPU_LIMIT_U64_UNDEFINED = 0xffffffffffffffffn;
export const WGPU_MIP_LEVEL_COUNT_UNDEFINED = 0xffffffff;
export const WGPU_QUERY_SET_INDEX_UNDEFINED = 0xffffffff;
export const WGPU_WHOLE_MAP_SIZE = Number.MAX_SAFE_INTEGER;
export const WGPU_WHOLE_SIZE = 0xffffffffffffffffn;
export const WGPU_STRLEN = Number.MAX_SAFE_INTEGER;
