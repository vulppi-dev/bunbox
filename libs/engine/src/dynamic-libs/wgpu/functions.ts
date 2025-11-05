import type { FFIFunction } from 'bun:ffi';

// WGPU Instance Functions

/**
 * Creates a new WebGPU instance.
 *
 * C ref: `WGPUInstance wgpuCreateInstance(WGPUInstanceDescriptor const * descriptor)`
 */
export const wgpuCreateInstance = {
  args: ['ptr'] as [descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Requests an adapter from the instance.
 *
 * C ref: `WGPUFuture wgpuInstanceRequestAdapter(WGPUInstance instance, WGPURequestAdapterOptions const * options, WGPURequestAdapterCallbackInfo callbackInfo)`
 */
export const wgpuInstanceRequestAdapter = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    options: 'ptr',
    callbackInfo: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Processes events for the instance.
 *
 * C ref: `WGPUWaitStatus wgpuInstanceProcessEvents(WGPUInstance instance)`
 */
export const wgpuInstanceProcessEvents = {
  args: ['ptr'] as [instance: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Creates a surface from a window.
 *
 * C ref: `WGPUSurface wgpuInstanceCreateSurface(WGPUInstance instance, WGPUSurfaceDescriptor const * descriptor)`
 */
export const wgpuInstanceCreateSurface = {
  args: ['ptr', 'ptr'] as [instance: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the instance.
 *
 * C ref: `void wgpuInstanceAddRef(WGPUInstance instance)`
 */
export const wgpuInstanceAddRef = {
  args: ['ptr'] as [instance: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the instance.
 *
 * C ref: `void wgpuInstanceRelease(WGPUInstance instance)`
 */
export const wgpuInstanceRelease = {
  args: ['ptr'] as [instance: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Adapter Functions

/**
 * Gets adapter information.
 *
 * C ref: `WGPUStatus wgpuAdapterGetInfo(WGPUAdapter adapter, WGPUAdapterInfo * info)`
 */
export const wgpuAdapterGetInfo = {
  args: ['ptr', 'ptr'] as [adapter: 'ptr', info: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Requests a device from the adapter.
 *
 * C ref: `WGPUFuture wgpuAdapterRequestDevice(WGPUAdapter adapter, WGPUDeviceDescriptor const * descriptor, WGPURequestDeviceCallbackInfo callbackInfo)`
 */
export const wgpuAdapterRequestDevice = {
  args: ['ptr', 'ptr', 'ptr'] as [
    adapter: 'ptr',
    descriptor: 'ptr',
    callbackInfo: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets adapter features.
 *
 * C ref: `WGPUStatus wgpuAdapterGetFeatures(WGPUAdapter adapter, WGPUSupportedFeatures * features)`
 */
export const wgpuAdapterGetFeatures = {
  args: ['ptr', 'ptr'] as [adapter: 'ptr', features: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets adapter limits.
 *
 * C ref: `WGPUStatus wgpuAdapterGetLimits(WGPUAdapter adapter, WGPULimits * limits)`
 */
export const wgpuAdapterGetLimits = {
  args: ['ptr', 'ptr'] as [adapter: 'ptr', limits: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Checks if adapter has a feature.
 *
 * C ref: `WGPUBool wgpuAdapterHasFeature(WGPUAdapter adapter, WGPUFeatureName feature)`
 */
export const wgpuAdapterHasFeature = {
  args: ['ptr', 'u32'] as [adapter: 'ptr', feature: 'u32'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the adapter.
 *
 * C ref: `void wgpuAdapterAddRef(WGPUAdapter adapter)`
 */
export const wgpuAdapterAddRef = {
  args: ['ptr'] as [adapter: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the adapter.
 *
 * C ref: `void wgpuAdapterRelease(WGPUAdapter adapter)`
 */
export const wgpuAdapterRelease = {
  args: ['ptr'] as [adapter: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Device Functions

/**
 * Creates a buffer.
 *
 * C ref: `WGPUBuffer wgpuDeviceCreateBuffer(WGPUDevice device, WGPUBufferDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateBuffer = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a texture.
 *
 * C ref: `WGPUTexture wgpuDeviceCreateTexture(WGPUDevice device, WGPUTextureDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateTexture = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a sampler.
 *
 * C ref: `WGPUSampler wgpuDeviceCreateSampler(WGPUDevice device, WGPUSamplerDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateSampler = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a bind group layout.
 *
 * C ref: `WGPUBindGroupLayout wgpuDeviceCreateBindGroupLayout(WGPUDevice device, WGPUBindGroupLayoutDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateBindGroupLayout = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a bind group.
 *
 * C ref: `WGPUBindGroup wgpuDeviceCreateBindGroup(WGPUDevice device, WGPUBindGroupDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateBindGroup = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a pipeline layout.
 *
 * C ref: `WGPUPipelineLayout wgpuDeviceCreatePipelineLayout(WGPUDevice device, WGPUPipelineLayoutDescriptor const * descriptor)`
 */
export const wgpuDeviceCreatePipelineLayout = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a shader module.
 *
 * C ref: `WGPUShaderModule wgpuDeviceCreateShaderModule(WGPUDevice device, WGPUShaderModuleDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateShaderModule = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a render pipeline.
 *
 * C ref: `WGPURenderPipeline wgpuDeviceCreateRenderPipeline(WGPUDevice device, WGPURenderPipelineDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateRenderPipeline = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a compute pipeline.
 *
 * C ref: `WGPUComputePipeline wgpuDeviceCreateComputePipeline(WGPUDevice device, WGPUComputePipelineDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateComputePipeline = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a command encoder.
 *
 * C ref: `WGPUCommandEncoder wgpuDeviceCreateCommandEncoder(WGPUDevice device, WGPUCommandEncoderDescriptor const * descriptor)`
 */
export const wgpuDeviceCreateCommandEncoder = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets the device queue.
 *
 * C ref: `WGPUQueue wgpuDeviceGetQueue(WGPUDevice device)`
 */
export const wgpuDeviceGetQueue = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Pushes an error scope.
 *
 * C ref: `void wgpuDevicePushErrorScope(WGPUDevice device, WGPUErrorFilter filter)`
 */
export const wgpuDevicePushErrorScope = {
  args: ['ptr', 'u32'] as [device: 'ptr', filter: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Pops an error scope.
 *
 * C ref: `WGPUFuture wgpuDevicePopErrorScope(WGPUDevice device, WGPUPopErrorScopeCallbackInfo callbackInfo)`
 */
export const wgpuDevicePopErrorScope = {
  args: ['ptr', 'ptr'] as [device: 'ptr', callbackInfo: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Destroys the device.
 *
 * C ref: `void wgpuDeviceDestroy(WGPUDevice device)`
 */
export const wgpuDeviceDestroy = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the device.
 *
 * C ref: `void wgpuDeviceAddRef(WGPUDevice device)`
 */
export const wgpuDeviceAddRef = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the device.
 *
 * C ref: `void wgpuDeviceRelease(WGPUDevice device)`
 */
export const wgpuDeviceRelease = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Queue Functions

/**
 * Submits command buffers to the queue.
 *
 * C ref: `void wgpuQueueSubmit(WGPUQueue queue, size_t commandCount, WGPUCommandBuffer const * commands)`
 */
export const wgpuQueueSubmit = {
  args: ['ptr', 'u64', 'ptr'] as [
    queue: 'ptr',
    commandCount: 'u64',
    commands: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Writes data to a buffer.
 *
 * C ref: `void wgpuQueueWriteBuffer(WGPUQueue queue, WGPUBuffer buffer, uint64_t bufferOffset, void const * data, size_t size)`
 */
export const wgpuQueueWriteBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64'] as [
    queue: 'ptr',
    buffer: 'ptr',
    bufferOffset: 'u64',
    data: 'ptr',
    size: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Writes data to a texture.
 *
 * C ref: `void wgpuQueueWriteTexture(WGPUQueue queue, WGPUTexelCopyTextureInfo const * destination, void const * data, size_t dataSize, WGPUTexelCopyBufferLayout const * dataLayout, WGPUExtent3D const * writeSize)`
 */
export const wgpuQueueWriteTexture = {
  args: ['ptr', 'ptr', 'ptr', 'u64', 'ptr', 'ptr'] as [
    queue: 'ptr',
    destination: 'ptr',
    data: 'ptr',
    dataSize: 'u64',
    dataLayout: 'ptr',
    writeSize: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Waits for queue work to be done.
 *
 * C ref: `WGPUFuture wgpuQueueOnSubmittedWorkDone(WGPUQueue queue, WGPUQueueWorkDoneCallbackInfo callbackInfo)`
 */
export const wgpuQueueOnSubmittedWorkDone = {
  args: ['ptr', 'ptr'] as [queue: 'ptr', callbackInfo: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the queue.
 *
 * C ref: `void wgpuQueueAddRef(WGPUQueue queue)`
 */
export const wgpuQueueAddRef = {
  args: ['ptr'] as [queue: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the queue.
 *
 * C ref: `void wgpuQueueRelease(WGPUQueue queue)`
 */
export const wgpuQueueRelease = {
  args: ['ptr'] as [queue: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Buffer Functions

/**
 * Maps a buffer asynchronously.
 *
 * C ref: `WGPUFuture wgpuBufferMapAsync(WGPUBuffer buffer, WGPUMapMode mode, size_t offset, size_t size, WGPUBufferMapCallbackInfo callbackInfo)`
 */
export const wgpuBufferMapAsync = {
  args: ['ptr', 'u32', 'u64', 'u64', 'ptr'] as [
    buffer: 'ptr',
    mode: 'u32',
    offset: 'u64',
    size: 'u64',
    callbackInfo: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets the mapped range of a buffer.
 *
 * C ref: `void * wgpuBufferGetMappedRange(WGPUBuffer buffer, size_t offset, size_t size)`
 */
export const wgpuBufferGetMappedRange = {
  args: ['ptr', 'u64', 'u64'] as [buffer: 'ptr', offset: 'u64', size: 'u64'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Unmaps a buffer.
 *
 * C ref: `void wgpuBufferUnmap(WGPUBuffer buffer)`
 */
export const wgpuBufferUnmap = {
  args: ['ptr'] as [buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Destroys a buffer.
 *
 * C ref: `void wgpuBufferDestroy(WGPUBuffer buffer)`
 */
export const wgpuBufferDestroy = {
  args: ['ptr'] as [buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the buffer.
 *
 * C ref: `void wgpuBufferAddRef(WGPUBuffer buffer)`
 */
export const wgpuBufferAddRef = {
  args: ['ptr'] as [buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the buffer.
 *
 * C ref: `void wgpuBufferRelease(WGPUBuffer buffer)`
 */
export const wgpuBufferRelease = {
  args: ['ptr'] as [buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Texture Functions

/**
 * Creates a texture view.
 *
 * C ref: `WGPUTextureView wgpuTextureCreateView(WGPUTexture texture, WGPUTextureViewDescriptor const * descriptor)`
 */
export const wgpuTextureCreateView = {
  args: ['ptr', 'ptr'] as [texture: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Destroys a texture.
 *
 * C ref: `void wgpuTextureDestroy(WGPUTexture texture)`
 */
export const wgpuTextureDestroy = {
  args: ['ptr'] as [texture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the texture.
 *
 * C ref: `void wgpuTextureAddRef(WGPUTexture texture)`
 */
export const wgpuTextureAddRef = {
  args: ['ptr'] as [texture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the texture.
 *
 * C ref: `void wgpuTextureRelease(WGPUTexture texture)`
 */
export const wgpuTextureRelease = {
  args: ['ptr'] as [texture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Command Encoder Functions

/**
 * Begins a render pass.
 *
 * C ref: `WGPURenderPassEncoder wgpuCommandEncoderBeginRenderPass(WGPUCommandEncoder commandEncoder, WGPURenderPassDescriptor const * descriptor)`
 */
export const wgpuCommandEncoderBeginRenderPass = {
  args: ['ptr', 'ptr'] as [commandEncoder: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Begins a compute pass.
 *
 * C ref: `WGPUComputePassEncoder wgpuCommandEncoderBeginComputePass(WGPUCommandEncoder commandEncoder, WGPUComputePassDescriptor const * descriptor)`
 */
export const wgpuCommandEncoderBeginComputePass = {
  args: ['ptr', 'ptr'] as [commandEncoder: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Copies buffer to buffer.
 *
 * C ref: `void wgpuCommandEncoderCopyBufferToBuffer(WGPUCommandEncoder commandEncoder, WGPUBuffer source, uint64_t sourceOffset, WGPUBuffer destination, uint64_t destinationOffset, uint64_t size)`
 */
export const wgpuCommandEncoderCopyBufferToBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u64'] as [
    commandEncoder: 'ptr',
    source: 'ptr',
    sourceOffset: 'u64',
    destination: 'ptr',
    destinationOffset: 'u64',
    size: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Finishes command encoding.
 *
 * C ref: `WGPUCommandBuffer wgpuCommandEncoderFinish(WGPUCommandEncoder commandEncoder, WGPUCommandBufferDescriptor const * descriptor)`
 */
export const wgpuCommandEncoderFinish = {
  args: ['ptr', 'ptr'] as [commandEncoder: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the command encoder.
 *
 * C ref: `void wgpuCommandEncoderAddRef(WGPUCommandEncoder commandEncoder)`
 */
export const wgpuCommandEncoderAddRef = {
  args: ['ptr'] as [commandEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the command encoder.
 *
 * C ref: `void wgpuCommandEncoderRelease(WGPUCommandEncoder commandEncoder)`
 */
export const wgpuCommandEncoderRelease = {
  args: ['ptr'] as [commandEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Render Pass Encoder Functions

/**
 * Sets the pipeline for a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderSetPipeline(WGPURenderPassEncoder renderPassEncoder, WGPURenderPipeline pipeline)`
 */
export const wgpuRenderPassEncoderSetPipeline = {
  args: ['ptr', 'ptr'] as [renderPassEncoder: 'ptr', pipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a bind group for a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderSetBindGroup(WGPURenderPassEncoder renderPassEncoder, uint32_t groupIndex, WGPUBindGroup group, size_t dynamicOffsetCount, uint32_t const * dynamicOffsets)`
 */
export const wgpuRenderPassEncoderSetBindGroup = {
  args: ['ptr', 'u32', 'ptr', 'u64', 'ptr'] as [
    renderPassEncoder: 'ptr',
    groupIndex: 'u32',
    group: 'ptr',
    dynamicOffsetCount: 'u64',
    dynamicOffsets: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a vertex buffer for a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderSetVertexBuffer(WGPURenderPassEncoder renderPassEncoder, uint32_t slot, WGPUBuffer buffer, uint64_t offset, uint64_t size)`
 */
export const wgpuRenderPassEncoderSetVertexBuffer = {
  args: ['ptr', 'u32', 'ptr', 'u64', 'u64'] as [
    renderPassEncoder: 'ptr',
    slot: 'u32',
    buffer: 'ptr',
    offset: 'u64',
    size: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets an index buffer for a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderSetIndexBuffer(WGPURenderPassEncoder renderPassEncoder, WGPUBuffer buffer, WGPUIndexFormat format, uint64_t offset, uint64_t size)`
 */
export const wgpuRenderPassEncoderSetIndexBuffer = {
  args: ['ptr', 'ptr', 'u32', 'u64', 'u64'] as [
    renderPassEncoder: 'ptr',
    buffer: 'ptr',
    format: 'u32',
    offset: 'u64',
    size: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws primitives.
 *
 * C ref: `void wgpuRenderPassEncoderDraw(WGPURenderPassEncoder renderPassEncoder, uint32_t vertexCount, uint32_t instanceCount, uint32_t firstVertex, uint32_t firstInstance)`
 */
export const wgpuRenderPassEncoderDraw = {
  args: ['ptr', 'u32', 'u32', 'u32', 'u32'] as [
    renderPassEncoder: 'ptr',
    vertexCount: 'u32',
    instanceCount: 'u32',
    firstVertex: 'u32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed primitives.
 *
 * C ref: `void wgpuRenderPassEncoderDrawIndexed(WGPURenderPassEncoder renderPassEncoder, uint32_t indexCount, uint32_t instanceCount, uint32_t firstIndex, int32_t baseVertex, uint32_t firstInstance)`
 */
export const wgpuRenderPassEncoderDrawIndexed = {
  args: ['ptr', 'u32', 'u32', 'u32', 'i32', 'u32'] as [
    renderPassEncoder: 'ptr',
    indexCount: 'u32',
    instanceCount: 'u32',
    firstIndex: 'u32',
    baseVertex: 'i32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderEnd(WGPURenderPassEncoder renderPassEncoder)`
 */
export const wgpuRenderPassEncoderEnd = {
  args: ['ptr'] as [renderPassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the render pass encoder.
 *
 * C ref: `void wgpuRenderPassEncoderAddRef(WGPURenderPassEncoder renderPassEncoder)`
 */
export const wgpuRenderPassEncoderAddRef = {
  args: ['ptr'] as [renderPassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the render pass encoder.
 *
 * C ref: `void wgpuRenderPassEncoderRelease(WGPURenderPassEncoder renderPassEncoder)`
 */
export const wgpuRenderPassEncoderRelease = {
  args: ['ptr'] as [renderPassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Compute Pass Encoder Functions

/**
 * Sets the pipeline for a compute pass.
 *
 * C ref: `void wgpuComputePassEncoderSetPipeline(WGPUComputePassEncoder computePassEncoder, WGPUComputePipeline pipeline)`
 */
export const wgpuComputePassEncoderSetPipeline = {
  args: ['ptr', 'ptr'] as [computePassEncoder: 'ptr', pipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a bind group for a compute pass.
 *
 * C ref: `void wgpuComputePassEncoderSetBindGroup(WGPUComputePassEncoder computePassEncoder, uint32_t groupIndex, WGPUBindGroup group, size_t dynamicOffsetCount, uint32_t const * dynamicOffsets)`
 */
export const wgpuComputePassEncoderSetBindGroup = {
  args: ['ptr', 'u32', 'ptr', 'u64', 'ptr'] as [
    computePassEncoder: 'ptr',
    groupIndex: 'u32',
    group: 'ptr',
    dynamicOffsetCount: 'u64',
    dynamicOffsets: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatches compute workgroups.
 *
 * C ref: `void wgpuComputePassEncoderDispatchWorkgroups(WGPUComputePassEncoder computePassEncoder, uint32_t workgroupCountX, uint32_t workgroupCountY, uint32_t workgroupCountZ)`
 */
export const wgpuComputePassEncoderDispatchWorkgroups = {
  args: ['ptr', 'u32', 'u32', 'u32'] as [
    computePassEncoder: 'ptr',
    workgroupCountX: 'u32',
    workgroupCountY: 'u32',
    workgroupCountZ: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends a compute pass.
 *
 * C ref: `void wgpuComputePassEncoderEnd(WGPUComputePassEncoder computePassEncoder)`
 */
export const wgpuComputePassEncoderEnd = {
  args: ['ptr'] as [computePassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the compute pass encoder.
 *
 * C ref: `void wgpuComputePassEncoderAddRef(WGPUComputePassEncoder computePassEncoder)`
 */
export const wgpuComputePassEncoderAddRef = {
  args: ['ptr'] as [computePassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the compute pass encoder.
 *
 * C ref: `void wgpuComputePassEncoderRelease(WGPUComputePassEncoder computePassEncoder)`
 */
export const wgpuComputePassEncoderRelease = {
  args: ['ptr'] as [computePassEncoder: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Surface Functions

/**
 * Gets surface capabilities.
 *
 * C ref: `WGPUStatus wgpuSurfaceGetCapabilities(WGPUSurface surface, WGPUAdapter adapter, WGPUSurfaceCapabilities * capabilities)`
 */
export const wgpuSurfaceGetCapabilities = {
  args: ['ptr', 'ptr', 'ptr'] as [
    surface: 'ptr',
    adapter: 'ptr',
    capabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Configures the surface.
 *
 * C ref: `void wgpuSurfaceConfigure(WGPUSurface surface, WGPUSurfaceConfiguration const * config)`
 */
export const wgpuSurfaceConfigure = {
  args: ['ptr', 'ptr'] as [surface: 'ptr', config: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets the current surface texture.
 *
 * C ref: `void wgpuSurfaceGetCurrentTexture(WGPUSurface surface, WGPUSurfaceTexture * surfaceTexture)`
 */
export const wgpuSurfaceGetCurrentTexture = {
  args: ['ptr', 'ptr'] as [surface: 'ptr', surfaceTexture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Presents the surface.
 *
 * C ref: `void wgpuSurfacePresent(WGPUSurface surface)`
 */
export const wgpuSurfacePresent = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Unconfigures the surface.
 *
 * C ref: `void wgpuSurfaceUnconfigure(WGPUSurface surface)`
 */
export const wgpuSurfaceUnconfigure = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adds a reference to the surface.
 *
 * C ref: `void wgpuSurfaceAddRef(WGPUSurface surface)`
 */
export const wgpuSurfaceAddRef = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a reference to the surface.
 *
 * C ref: `void wgpuSurfaceRelease(WGPUSurface surface)`
 */
export const wgpuSurfaceRelease = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// WGPU Native Extensions

/**
 * Generates a global report.
 *
 * C ref: `void wgpuGenerateReport(WGPUInstance instance, WGPUGlobalReport * report)`
 */
export const wgpuGenerateReport = {
  args: ['ptr', 'ptr'] as [instance: 'ptr', report: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Enumerates adapters.
 *
 * C ref: `size_t wgpuInstanceEnumerateAdapters(WGPUInstance instance, WGPUInstanceEnumerateAdapterOptions const * options, WGPUAdapter * adapters)`
 */
export const wgpuInstanceEnumerateAdapters = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    options: 'ptr',
    adapters: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Submits command buffers and returns the submission index.
 *
 * C ref: `WGPUSubmissionIndex wgpuQueueSubmitForIndex(WGPUQueue queue, size_t commandCount, WGPUCommandBuffer const * commands)`
 */
export const wgpuQueueSubmitForIndex = {
  args: ['ptr', 'u64', 'ptr'] as [
    queue: 'ptr',
    commandCount: 'u64',
    commands: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Polls the device.
 *
 * C ref: `WGPUBool wgpuDevicePoll(WGPUDevice device, WGPUBool wait, WGPUSubmissionIndex const * submissionIndex)`
 */
export const wgpuDevicePoll = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    wait: 'u32',
    submissionIndex: 'ptr',
  ],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Creates a shader module from SPIR-V.
 *
 * C ref: `WGPUShaderModule wgpuDeviceCreateShaderModuleSpirV(WGPUDevice device, WGPUShaderModuleDescriptorSpirV const * descriptor)`
 */
export const wgpuDeviceCreateShaderModuleSpirV = {
  args: ['ptr', 'ptr'] as [device: 'ptr', descriptor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the log callback.
 *
 * C ref: `void wgpuSetLogCallback(WGPULogCallback callback, void * userdata)`
 */
export const wgpuSetLogCallback = {
  args: ['callback', 'ptr'] as [callback: 'callback', userdata: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the log level.
 *
 * C ref: `void wgpuSetLogLevel(WGPULogLevel level)`
 */
export const wgpuSetLogLevel = {
  args: ['u32'] as [level: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets the WGPU version.
 *
 * C ref: `uint32_t wgpuGetVersion(void)`
 */
export const wgpuGetVersion = {
  args: [],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Sets push constants for a render pass.
 *
 * C ref: `void wgpuRenderPassEncoderSetPushConstants(WGPURenderPassEncoder encoder, WGPUShaderStage stages, uint32_t offset, uint32_t sizeBytes, void const * data)`
 */
export const wgpuRenderPassEncoderSetPushConstants = {
  args: ['ptr', 'u32', 'u32', 'u32', 'ptr'] as [
    encoder: 'ptr',
    stages: 'u32',
    offset: 'u32',
    sizeBytes: 'u32',
    data: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets push constants for a compute pass.
 *
 * C ref: `void wgpuComputePassEncoderSetPushConstants(WGPUComputePassEncoder encoder, uint32_t offset, uint32_t sizeBytes, void const * data)`
 */
export const wgpuComputePassEncoderSetPushConstants = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    encoder: 'ptr',
    offset: 'u32',
    sizeBytes: 'u32',
    data: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws multiple indirect commands.
 *
 * C ref: `void wgpuRenderPassEncoderMultiDrawIndirect(WGPURenderPassEncoder encoder, WGPUBuffer buffer, uint64_t offset, uint32_t count)`
 */
export const wgpuRenderPassEncoderMultiDrawIndirect = {
  args: ['ptr', 'ptr', 'u64', 'u32'] as [
    encoder: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    count: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws multiple indexed indirect commands.
 *
 * C ref: `void wgpuRenderPassEncoderMultiDrawIndexedIndirect(WGPURenderPassEncoder encoder, WGPUBuffer buffer, uint64_t offset, uint32_t count)`
 */
export const wgpuRenderPassEncoderMultiDrawIndexedIndirect = {
  args: ['ptr', 'ptr', 'u64', 'u32'] as [
    encoder: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    count: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws multiple indirect commands with count.
 *
 * C ref: `void wgpuRenderPassEncoderMultiDrawIndirectCount(WGPURenderPassEncoder encoder, WGPUBuffer buffer, uint64_t offset, WGPUBuffer count_buffer, uint64_t count_buffer_offset, uint32_t max_count)`
 */
export const wgpuRenderPassEncoderMultiDrawIndirectCount = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u32'] as [
    encoder: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    countBuffer: 'ptr',
    countBufferOffset: 'u64',
    maxCount: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws multiple indexed indirect commands with count.
 *
 * C ref: `void wgpuRenderPassEncoderMultiDrawIndexedIndirectCount(WGPURenderPassEncoder encoder, WGPUBuffer buffer, uint64_t offset, WGPUBuffer count_buffer, uint64_t count_buffer_offset, uint32_t max_count)`
 */
export const wgpuRenderPassEncoderMultiDrawIndexedIndirectCount = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u32'] as [
    encoder: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    countBuffer: 'ptr',
    countBufferOffset: 'u64',
    maxCount: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Additional reference management functions

export const wgpuBindGroupAddRef = {
  args: ['ptr'] as [bindGroup: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuBindGroupRelease = {
  args: ['ptr'] as [bindGroup: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuBindGroupLayoutAddRef = {
  args: ['ptr'] as [bindGroupLayout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuBindGroupLayoutRelease = {
  args: ['ptr'] as [bindGroupLayout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuCommandBufferAddRef = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuCommandBufferRelease = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuComputePipelineAddRef = {
  args: ['ptr'] as [computePipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuComputePipelineRelease = {
  args: ['ptr'] as [computePipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuPipelineLayoutAddRef = {
  args: ['ptr'] as [pipelineLayout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuPipelineLayoutRelease = {
  args: ['ptr'] as [pipelineLayout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuRenderPipelineAddRef = {
  args: ['ptr'] as [renderPipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuRenderPipelineRelease = {
  args: ['ptr'] as [renderPipeline: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuSamplerAddRef = {
  args: ['ptr'] as [sampler: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuSamplerRelease = {
  args: ['ptr'] as [sampler: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuShaderModuleAddRef = {
  args: ['ptr'] as [shaderModule: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuShaderModuleRelease = {
  args: ['ptr'] as [shaderModule: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuTextureViewAddRef = {
  args: ['ptr'] as [textureView: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

export const wgpuTextureViewRelease = {
  args: ['ptr'] as [textureView: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;
