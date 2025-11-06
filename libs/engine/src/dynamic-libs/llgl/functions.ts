import type { FFIFunction } from 'bun:ffi';

// LLGL MARK: RenderSystem

/**
 * Loads a render system from the specified module.
 *
 * C ref: `LLGLRenderSystem llglLoadRenderSystem(const LLGLRenderSystemDescriptor* renderSystemDesc)`
 */
export const llglLoadRenderSystem = {
  args: ['ptr'] as [renderSystemDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Unloads the specified render system.
 *
 * C ref: `void llglUnloadRenderSystem(LLGLRenderSystem renderSystem)`
 */
export const llglUnloadRenderSystem = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the renderer information.
 *
 * C ref: `void llglGetRendererInfo(LLGLRenderSystem renderSystem, LLGLRendererInfo* outInfo)`
 */
export const llglGetRendererInfo = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', outInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets the renderer ID.
 *
 * C ref: `int llglGetRendererID(LLGLRenderSystem renderSystem)`
 */
export const llglGetRendererID = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets the renderer name.
 *
 * C ref: `const char* llglGetRendererName(LLGLRenderSystem renderSystem)`
 */
export const llglGetRendererName = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Gets the renderer report.
 *
 * C ref: `const char* llglGetRendererReport(LLGLRenderSystem renderSystem)`
 */
export const llglGetRendererReport = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the rendering capabilities.
 *
 * C ref: `void llglGetRenderingCaps(LLGLRenderSystem renderSystem, LLGLRenderingCapabilities* outCaps)`
 */
export const llglGetRenderingCaps = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', outCaps: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates a swap chain.
 *
 * C ref: `LLGLSwapChain llglCreateSwapChain(LLGLRenderSystem renderSystem, const LLGLSwapChainDescriptor* swapChainDesc)`
 */
export const llglCreateSwapChain = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', swapChainDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a swap chain.
 *
 * C ref: `void llglReleaseSwapChain(LLGLRenderSystem renderSystem, LLGLSwapChain swapChain)`
 */
export const llglReleaseSwapChain = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', swapChain: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates a swap chain with extended parameters.
 *
 * C ref: `LLGLSwapChain llglCreateSwapChainExt(LLGLRenderSystem renderSystem, const LLGLSwapChainDescriptor* swapChainDesc, LLGLSurface surface)`
 */
export const llglCreateSwapChainExt = {
  args: ['ptr', 'ptr', 'ptr'] as [
    renderSystem: 'ptr',
    swapChainDesc: 'ptr',
    surface: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets the surface associated with a swap chain.
 *
 * C ref: `LLGLSurface llglGetSurface(LLGLSwapChain swapChain)`
 */
export const llglGetSurface = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets the color format of a swap chain.
 *
 * C ref: `LLGLFormat llglGetColorFormat(LLGLSwapChain swapChain)`
 */
export const llglGetColorFormat = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets the number of swap buffers.
 *
 * C ref: `uint32_t llglGetNumSwapBuffers(LLGLSwapChain swapChain)`
 */
export const llglGetNumSwapBuffers = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Checks if swap chain is presentable.
 *
 * C ref: `bool llglIsPresentable(LLGLSwapChain swapChain)`
 */
export const llglIsPresentable = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets current swap index.
 *
 * C ref: `uint32_t llglGetCurrentSwapIndex(LLGLSwapChain swapChain)`
 */
export const llglGetCurrentSwapIndex = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Resizes swap chain buffers.
 *
 * C ref: `bool llglResizeBuffers(LLGLSwapChain swapChain, const LLGLExtent2D* resolution, long flags)`
 */
export const llglResizeBuffers = {
  args: ['ptr', 'ptr', 'i64'] as [
    swapChain: 'ptr',
    resolution: 'ptr',
    flags: 'i64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the V-Sync interval for swap chain presentation.
 *
 * C ref: `bool llglSetVsyncInterval(LLGLSwapChain swapChain, uint32_t vsyncInterval)`
 */
export const llglSetVsyncInterval = {
  args: ['ptr', 'u32'] as [swapChain: 'ptr', vsyncInterval: 'u32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Switches fullscreen mode.
 *
 * C ref: `bool llglSwitchFullscreen(LLGLSwapChain swapChain, bool enable)`
 */
export const llglSwitchFullscreen = {
  args: ['ptr', 'i32'] as [swapChain: 'ptr', enable: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

// LLGL MARK: SwapChain

/**
 * Presents the current frame.
 *
 * C ref: `void llglPresent(LLGLSwapChain swapChain)`
 */
export const llglPresent = {
  args: ['ptr'] as [swapChain: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: CommandQueue

/**
 * Creates a command buffer.
 *
 * C ref: `LLGLCommandBuffer llglCreateCommandBuffer(LLGLRenderSystem renderSystem, const LLGLCommandBufferDescriptor* commandBufferDesc)`
 */
export const llglCreateCommandBuffer = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', commandBufferDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a command buffer.
 *
 * C ref: `void llglReleaseCommandBuffer(LLGLRenderSystem renderSystem, LLGLCommandBuffer commandBuffer)`
 */
export const llglReleaseCommandBuffer = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: CommandBuffer

/**
 * Begins recording commands.
 *
 * C ref: `void llglBegin(LLGLCommandBuffer commandBuffer)`
 */
export const llglBegin = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends recording commands.
 *
 * C ref: `void llglEnd(LLGLCommandBuffer commandBuffer)`
 */
export const llglEnd = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Executes secondary command buffers.
 *
 * C ref: `void llglExecute(LLGLCommandBuffer commandBuffer, LLGLCommandBuffer secondaryCommandBuffer)`
 */
export const llglExecute = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', secondaryCommandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submits a command buffer.
 *
 * C ref: `void llglSubmitCommandBuffer(LLGLCommandBuffer commandBuffer)`
 */
export const llglSubmitCommandBuffer = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begins a render pass.
 *
 * C ref: `void llglBeginRenderPass(LLGLCommandBuffer commandBuffer, LLGLRenderTarget renderTarget, const LLGLRenderPass renderPass, const LLGLAttachmentClear* clearValues, uint32_t numClearValues)`
 */
export const llglBeginRenderPass = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    renderTarget: 'ptr',
    renderPass: 'ptr',
    clearValues: 'ptr',
    numClearValues: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begins a render pass with clear values.
 *
 * C ref: `void llglBeginRenderPassWithClear(LLGLCommandBuffer commandBuffer, LLGLRenderTarget renderTarget, const LLGLRenderPass renderPass, const LLGLClearValue* clearValue)`
 */
export const llglBeginRenderPassWithClear = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    renderTarget: 'ptr',
    renderPass: 'ptr',
    clearValue: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends a render pass.
 *
 * C ref: `void llglEndRenderPass(LLGLCommandBuffer commandBuffer)`
 */
export const llglEndRenderPass = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clears attachments.
 *
 * C ref: `void llglClear(LLGLCommandBuffer commandBuffer, uint32_t flags, const LLGLClearValue* clearValue)`
 */
export const llglClear = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    flags: 'u32',
    clearValue: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clears specific attachments.
 *
 * C ref: `void llglClearAttachments(LLGLCommandBuffer commandBuffer, const LLGLAttachmentClear* attachments, uint32_t numAttachments)`
 */
export const llglClearAttachments = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    attachments: 'ptr',
    numAttachments: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the viewport.
 *
 * C ref: `void llglSetViewport(LLGLCommandBuffer commandBuffer, const LLGLViewport* viewport)`
 */
export const llglSetViewport = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', viewport: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets multiple viewports.
 *
 * C ref: `void llglSetViewports(LLGLCommandBuffer commandBuffer, const LLGLViewport* viewports, uint32_t numViewports)`
 */
export const llglSetViewports = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    viewports: 'ptr',
    numViewports: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the scissor rectangle.
 *
 * C ref: `void llglSetScissor(LLGLCommandBuffer commandBuffer, const LLGLScissor* scissor)`
 */
export const llglSetScissor = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', scissor: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets multiple scissor rectangles.
 *
 * C ref: `void llglSetScissors(LLGLCommandBuffer commandBuffer, const LLGLScissor* scissors, uint32_t numScissors)`
 */
export const llglSetScissors = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    scissors: 'ptr',
    numScissors: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the blend factor.
 *
 * C ref: `void llglSetBlendFactor(LLGLCommandBuffer commandBuffer, const LLGLColorRGBA* blendFactor)`
 */
export const llglSetBlendFactor = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', blendFactor: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the stencil reference value.
 *
 * C ref: `void llglSetStencilReference(LLGLCommandBuffer commandBuffer, uint32_t reference, uint32_t frontFace)`
 */
export const llglSetStencilReference = {
  args: ['ptr', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    reference: 'u32',
    frontFace: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets uniform values.
 *
 * C ref: `void llglSetUniforms(LLGLCommandBuffer commandBuffer, uint32_t first, const void* data, uint32_t dataSize)`
 */
export const llglSetUniforms = {
  args: ['ptr', 'u32', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    first: 'u32',
    data: 'ptr',
    dataSize: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Binds a graphics pipeline.
 *
 * C ref: `void llglSetPipelineState(LLGLCommandBuffer commandBuffer, LLGLPipelineState pipelineState)`
 */
export const llglSetPipelineState = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', pipelineState: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Binds a resource heap.
 *
 * C ref: `void llglSetResourceHeap(LLGLCommandBuffer commandBuffer, LLGLResourceHeap resourceHeap, uint32_t firstSet)`
 */
export const llglSetResourceHeap = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    resourceHeap: 'ptr',
    firstSet: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Binds a single resource.
 *
 * C ref: `void llglSetResource(LLGLCommandBuffer commandBuffer, LLGLResource resource, uint32_t slot)`
 */
export const llglSetResource = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    resource: 'ptr',
    slot: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resets resource slots.
 *
 * C ref: `void llglResetResourceSlots(LLGLCommandBuffer commandBuffer, uint32_t firstSlot, uint32_t numSlots)`
 */
export const llglResetResourceSlots = {
  args: ['ptr', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    firstSlot: 'u32',
    numSlots: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a vertex buffer.
 *
 * C ref: `void llglSetVertexBuffer(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer)`
 */
export const llglSetVertexBuffer = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a vertex buffer with extended parameters.
 *
 * C ref: `void llglSetVertexBufferExt(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset, uint32_t stride, uint32_t slot)`
 */
export const llglSetVertexBufferExt = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    stride: 'u32',
    slot: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets a vertex buffer array.
 *
 * C ref: `void llglSetVertexBufferArray(LLGLCommandBuffer commandBuffer, LLGLBufferArray bufferArray)`
 */
export const llglSetVertexBufferArray = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', bufferArray: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets an index buffer.
 *
 * C ref: `void llglSetIndexBuffer(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer)`
 */
export const llglSetIndexBuffer = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets an index buffer with extended parameters.
 *
 * C ref: `void llglSetIndexBufferExt(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset, uint32_t format)`
 */
export const llglSetIndexBufferExt = {
  args: ['ptr', 'ptr', 'u64', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    format: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws primitives.
 *
 * C ref: `void llglDraw(LLGLCommandBuffer commandBuffer, uint32_t numVertices, uint32_t firstVertex)`
 */
export const llglDraw = {
  args: ['ptr', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numVertices: 'u32',
    firstVertex: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed primitives.
 *
 * C ref: `void llglDrawIndexed(LLGLCommandBuffer commandBuffer, uint32_t numIndices, uint32_t firstIndex, int32_t vertexOffset)`
 */
export const llglDrawIndexed = {
  args: ['ptr', 'u32', 'u32', 'i32'] as [
    commandBuffer: 'ptr',
    numIndices: 'u32',
    firstIndex: 'u32',
    vertexOffset: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed primitives with extended parameters.
 *
 * C ref: `void llglDrawIndexedExt(LLGLCommandBuffer commandBuffer, uint32_t numIndices, uint32_t firstIndex, int32_t vertexOffset, uint32_t instanceOffset)`
 */
export const llglDrawIndexedExt = {
  args: ['ptr', 'u32', 'u32', 'i32', 'u32'] as [
    commandBuffer: 'ptr',
    numIndices: 'u32',
    firstIndex: 'u32',
    vertexOffset: 'i32',
    instanceOffset: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws instanced primitives.
 *
 * C ref: `void llglDrawInstanced(LLGLCommandBuffer commandBuffer, uint32_t numVertices, uint32_t firstVertex, uint32_t numInstances, uint32_t firstInstance)`
 */
export const llglDrawInstanced = {
  args: ['ptr', 'u32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numVertices: 'u32',
    firstVertex: 'u32',
    numInstances: 'u32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws instanced primitives with extended parameters.
 *
 * C ref: `void llglDrawInstancedExt(LLGLCommandBuffer commandBuffer, uint32_t numVertices, uint32_t firstVertex, uint32_t numInstances, uint32_t firstInstance, uint32_t instanceOffset)`
 */
export const llglDrawInstancedExt = {
  args: ['ptr', 'u32', 'u32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numVertices: 'u32',
    firstVertex: 'u32',
    numInstances: 'u32',
    firstInstance: 'u32',
    instanceOffset: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed and instanced primitives.
 *
 * C ref: `void llglDrawIndexedInstanced(LLGLCommandBuffer commandBuffer, uint32_t numIndices, uint32_t firstIndex, int32_t vertexOffset, uint32_t numInstances, uint32_t firstInstance)`
 */
export const llglDrawIndexedInstanced = {
  args: ['ptr', 'u32', 'u32', 'i32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numIndices: 'u32',
    firstIndex: 'u32',
    vertexOffset: 'i32',
    numInstances: 'u32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed and instanced primitives with extended parameters.
 *
 * C ref: `void llglDrawIndexedInstancedExt(LLGLCommandBuffer commandBuffer, uint32_t numIndices, uint32_t firstIndex, int32_t vertexOffset, uint32_t numInstances, uint32_t firstInstance, uint32_t instanceOffset)`
 */
export const llglDrawIndexedInstancedExt = {
  args: ['ptr', 'u32', 'u32', 'i32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numIndices: 'u32',
    firstIndex: 'u32',
    vertexOffset: 'i32',
    numInstances: 'u32',
    firstInstance: 'u32',
    instanceOffset: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws primitives indirectly.
 *
 * C ref: `void llglDrawIndirect(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset)`
 */
export const llglDrawIndirect = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws primitives indirectly with extended parameters.
 *
 * C ref: `void llglDrawIndirectExt(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset, uint32_t numCommands, uint32_t stride)`
 */
export const llglDrawIndirectExt = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    numCommands: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed primitives indirectly.
 *
 * C ref: `void llglDrawIndexedIndirect(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset)`
 */
export const llglDrawIndexedIndirect = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws indexed primitives indirectly with extended parameters.
 *
 * C ref: `void llglDrawIndexedIndirectExt(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset, uint32_t numCommands, uint32_t stride)`
 */
export const llglDrawIndexedIndirectExt = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    numCommands: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatches compute work.
 *
 * C ref: `void llglDispatch(LLGLCommandBuffer commandBuffer, uint32_t numWorkGroupsX, uint32_t numWorkGroupsY, uint32_t numWorkGroupsZ)`
 */
export const llglDispatch = {
  args: ['ptr', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    numWorkGroupsX: 'u32',
    numWorkGroupsY: 'u32',
    numWorkGroupsZ: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatches compute work indirectly.
 *
 * C ref: `void llglDispatchIndirect(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset)`
 */
export const llglDispatchIndirect = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Debug & Queries

/**
 * Pushes a debug group.
 *
 * C ref: `void llglPushDebugGroup(LLGLCommandBuffer commandBuffer, const char* name)`
 */
export const llglPushDebugGroup = {
  args: ['ptr', 'cstring'] as [commandBuffer: 'ptr', name: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Pops a debug group.
 *
 * C ref: `void llglPopDebugGroup(LLGLCommandBuffer commandBuffer)`
 */
export const llglPopDebugGroup = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begins a query.
 *
 * C ref: `void llglBeginQuery(LLGLCommandBuffer commandBuffer, LLGLQueryHeap queryHeap, uint32_t query)`
 */
export const llglBeginQuery = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    queryHeap: 'ptr',
    query: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends a query.
 *
 * C ref: `void llglEndQuery(LLGLCommandBuffer commandBuffer, LLGLQueryHeap queryHeap, uint32_t query)`
 */
export const llglEndQuery = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    queryHeap: 'ptr',
    query: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begins render condition.
 *
 * C ref: `void llglBeginRenderCondition(LLGLCommandBuffer commandBuffer, LLGLQueryHeap queryHeap, uint32_t query, uint32_t mode)`
 */
export const llglBeginRenderCondition = {
  args: ['ptr', 'ptr', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    queryHeap: 'ptr',
    query: 'u32',
    mode: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends render condition.
 *
 * C ref: `void llglEndRenderCondition(LLGLCommandBuffer commandBuffer)`
 */
export const llglEndRenderCondition = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begins stream output.
 *
 * C ref: `void llglBeginStreamOutput(LLGLCommandBuffer commandBuffer, uint32_t numBuffers, LLGLBuffer* buffers)`
 */
export const llglBeginStreamOutput = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    numBuffers: 'u32',
    buffers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends stream output.
 *
 * C ref: `void llglEndStreamOutput(LLGLCommandBuffer commandBuffer)`
 */
export const llglEndStreamOutput = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draws stream output.
 *
 * C ref: `void llglDrawStreamOutput(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint32_t stream)`
 */
export const llglDrawStreamOutput = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    stream: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets native handle.
 *
 * C ref: `void llglGetNativeHandle(LLGLCommandBuffer commandBuffer, void* nativeHandle, size_t nativeHandleSize)`
 */
export const llglGetNativeHandle = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    nativeHandle: 'ptr',
    nativeHandleSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Executes native command.
 *
 * C ref: `void llglDoNativeCommand(LLGLCommandBuffer commandBuffer, const void* nativeCommand, size_t nativeCommandSize)`
 */
export const llglDoNativeCommand = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    nativeCommand: 'ptr',
    nativeCommandSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Copy & Update Operations

/**
 * Copies buffer data.
 *
 * C ref: `void llglCopyBuffer(LLGLCommandBuffer commandBuffer, LLGLBuffer dstBuffer, uint64_t dstOffset, LLGLBuffer srcBuffer, uint64_t srcOffset, uint64_t size)`
 */
export const llglCopyBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u64'] as [
    commandBuffer: 'ptr',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    srcBuffer: 'ptr',
    srcOffset: 'u64',
    size: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copies buffer from texture.
 *
 * C ref: `void llglCopyBufferFromTexture(LLGLCommandBuffer commandBuffer, LLGLBuffer dstBuffer, uint64_t dstOffset, LLGLTexture srcTexture, const LLGLTextureRegion* srcRegion)`
 */
export const llglCopyBufferFromTexture = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    srcTexture: 'ptr',
    srcRegion: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Fills buffer with value.
 *
 * C ref: `void llglFillBuffer(LLGLCommandBuffer commandBuffer, LLGLBuffer dstBuffer, uint64_t dstOffset, uint32_t value, uint64_t fillSize)`
 */
export const llglFillBuffer = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u64'] as [
    commandBuffer: 'ptr',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    value: 'u32',
    fillSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copies texture data.
 *
 * C ref: `void llglCopyTexture(LLGLCommandBuffer commandBuffer, LLGLTexture dstTexture, const LLGLTextureRegion* dstRegion, LLGLTexture srcTexture, const LLGLTextureRegion* srcRegion)`
 */
export const llglCopyTexture = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    dstTexture: 'ptr',
    dstRegion: 'ptr',
    srcTexture: 'ptr',
    srcRegion: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copies texture from buffer.
 *
 * C ref: `void llglCopyTextureFromBuffer(LLGLCommandBuffer commandBuffer, LLGLTexture dstTexture, const LLGLTextureRegion* dstRegion, LLGLBuffer srcBuffer, uint64_t srcOffset)`
 */
export const llglCopyTextureFromBuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    dstTexture: 'ptr',
    dstRegion: 'ptr',
    srcBuffer: 'ptr',
    srcOffset: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copies texture from framebuffer.
 *
 * C ref: `void llglCopyTextureFromFramebuffer(LLGLCommandBuffer commandBuffer, LLGLTexture dstTexture, const LLGLTextureRegion* dstRegion, const LLGLOffset2D* srcOffset)`
 */
export const llglCopyTextureFromFramebuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    dstTexture: 'ptr',
    dstRegion: 'ptr',
    srcOffset: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Generates mipmaps for texture.
 *
 * C ref: `void llglGenerateMips(LLGLCommandBuffer commandBuffer, LLGLTexture texture)`
 */
export const llglGenerateMips = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', texture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Generates mipmaps for texture range.
 *
 * C ref: `void llglGenerateMipsRange(LLGLCommandBuffer commandBuffer, LLGLTexture texture, uint32_t baseMipLevel, uint32_t numMipLevels, uint32_t baseArrayLayer, uint32_t numArrayLayers)`
 */
export const llglGenerateMipsRange = {
  args: ['ptr', 'ptr', 'u32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    texture: 'ptr',
    baseMipLevel: 'u32',
    numMipLevels: 'u32',
    baseArrayLayer: 'u32',
    numArrayLayers: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Updates buffer data.
 *
 * C ref: `void llglUpdateBuffer(LLGLCommandBuffer commandBuffer, LLGLBuffer buffer, uint64_t offset, const void* data, uint64_t dataSize)`
 */
export const llglUpdateBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets resource barrier.
 *
 * C ref: `void llglResourceBarrier(LLGLCommandBuffer commandBuffer, uint32_t numBarriers, const LLGLResourceBarrier* barriers)`
 */
export const llglResourceBarrier = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    numBarriers: 'u32',
    barriers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Buffer

/**
 * Creates a buffer.
 *
 * C ref: `LLGLBuffer llglCreateBuffer(LLGLRenderSystem renderSystem, const LLGLBufferDescriptor* bufferDesc, const void* initialData)`
 */
export const llglCreateBuffer = {
  args: ['ptr', 'ptr', 'ptr'] as [
    renderSystem: 'ptr',
    bufferDesc: 'ptr',
    initialData: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a buffer array.
 *
 * C ref: `LLGLBufferArray llglCreateBufferArray(LLGLRenderSystem renderSystem, uint32_t numBuffers, LLGLBuffer* buffers)`
 */
export const llglCreateBufferArray = {
  args: ['ptr', 'u32', 'ptr'] as [
    renderSystem: 'ptr',
    numBuffers: 'u32',
    buffers: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a buffer.
 *
 * C ref: `void llglReleaseBuffer(LLGLRenderSystem renderSystem, LLGLBuffer buffer)`
 */
export const llglReleaseBuffer = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Releases a buffer array.
 *
 * C ref: `void llglReleaseBufferArray(LLGLRenderSystem renderSystem, LLGLBufferArray bufferArray)`
 */
export const llglReleaseBufferArray = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', bufferArray: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Writes data to a buffer.
 *
 * C ref: `void llglWriteBuffer(LLGLRenderSystem renderSystem, LLGLBuffer buffer, uint64_t offset, const void* data, uint64_t dataSize)`
 */
export const llglWriteBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64'] as [
    renderSystem: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Maps a buffer for CPU access.
 *
 * C ref: `void* llglMapBuffer(LLGLRenderSystem renderSystem, LLGLBuffer buffer, uint32_t cpuAccess, uint64_t offset, uint64_t length)`
 */
export const llglMapBuffer = {
  args: ['ptr', 'ptr', 'u32', 'u64', 'u64'] as [
    renderSystem: 'ptr',
    buffer: 'ptr',
    cpuAccess: 'u32',
    offset: 'u64',
    length: 'u64',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Maps a buffer range for CPU access.
 *
 * C ref: `void* llglMapBufferRange(LLGLRenderSystem renderSystem, LLGLBuffer buffer, uint32_t cpuAccess, uint64_t offset, uint64_t length)`
 */
export const llglMapBufferRange = {
  args: ['ptr', 'ptr', 'u32', 'u64', 'u64'] as [
    renderSystem: 'ptr',
    buffer: 'ptr',
    cpuAccess: 'u32',
    offset: 'u64',
    length: 'u64',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Reads data from buffer.
 *
 * C ref: `void llglReadBuffer(LLGLRenderSystem renderSystem, LLGLBuffer buffer, uint64_t offset, void* data, uint64_t dataSize)`
 */
export const llglReadBuffer = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64'] as [
    renderSystem: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Unmaps a buffer.
 *
 * C ref: `void llglUnmapBuffer(LLGLRenderSystem renderSystem, LLGLBuffer buffer)`
 */
export const llglUnmapBuffer = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', buffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Texture

/**
 * Creates a texture.
 *
 * C ref: `LLGLTexture llglCreateTexture(LLGLRenderSystem renderSystem, const LLGLTextureDescriptor* textureDesc, const void* initialData)`
 */
export const llglCreateTexture = {
  args: ['ptr', 'ptr', 'ptr'] as [
    renderSystem: 'ptr',
    textureDesc: 'ptr',
    initialData: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a texture.
 *
 * C ref: `void llglReleaseTexture(LLGLRenderSystem renderSystem, LLGLTexture texture)`
 */
export const llglReleaseTexture = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', texture: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Writes data to a texture region.
 *
 * C ref: `void llglWriteTexture(LLGLRenderSystem renderSystem, LLGLTexture texture, const LLGLTextureRegion* textureRegion, const void* data, uint64_t dataSize)`
 */
export const llglWriteTexture = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'u64'] as [
    renderSystem: 'ptr',
    texture: 'ptr',
    textureRegion: 'ptr',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reads data from a texture.
 *
 * C ref: `void llglReadTexture(LLGLRenderSystem renderSystem, LLGLTexture texture, const LLGLTextureRegion* textureRegion, void* data, uint64_t dataSize)`
 */
export const llglReadTexture = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'u64'] as [
    renderSystem: 'ptr',
    texture: 'ptr',
    textureRegion: 'ptr',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Sampler

/**
 * Creates a sampler.
 *
 * C ref: `LLGLSampler llglCreateSampler(LLGLRenderSystem renderSystem, const LLGLSamplerDescriptor* samplerDesc)`
 */
export const llglCreateSampler = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', samplerDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a sampler.
 *
 * C ref: `void llglReleaseSampler(LLGLRenderSystem renderSystem, LLGLSampler sampler)`
 */
export const llglReleaseSampler = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', sampler: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Shader

/**
 * Creates a shader.
 *
 * C ref: `LLGLShader llglCreateShader(LLGLRenderSystem renderSystem, const LLGLShaderDescriptor* shaderDesc)`
 */
export const llglCreateShader = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', shaderDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a shader.
 *
 * C ref: `void llglReleaseShader(LLGLRenderSystem renderSystem, LLGLShader shader)`
 */
export const llglReleaseShader = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', shader: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets shader report.
 *
 * C ref: `const char* llglGetShaderReport(LLGLShader shader)`
 */
export const llglGetShaderReport = {
  args: ['ptr'] as [shader: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Gets shader type.
 *
 * C ref: `int llglGetShaderType(LLGLShader shader)`
 */
export const llglGetShaderType = {
  args: ['ptr'] as [shader: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reflects shader information.
 *
 * C ref: `void llglReflectShader(LLGLShader shader, LLGLShaderReflection* reflection)`
 */
export const llglReflectShader = {
  args: ['ptr', 'ptr'] as [shader: 'ptr', reflection: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: PipelineLayout

/**
 * Creates a pipeline layout.
 *
 * C ref: `LLGLPipelineLayout llglCreatePipelineLayout(LLGLRenderSystem renderSystem, const LLGLPipelineLayoutDescriptor* pipelineLayoutDesc)`
 */
export const llglCreatePipelineLayout = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineLayoutDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a pipeline layout.
 *
 * C ref: `void llglReleasePipelineLayout(LLGLRenderSystem renderSystem, LLGLPipelineLayout pipelineLayout)`
 */
export const llglReleasePipelineLayout = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineLayout: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: PipelineState

/**
 * Creates a graphics pipeline state.
 *
 * C ref: `LLGLPipelineState llglCreateGraphicsPipelineState(LLGLRenderSystem renderSystem, const LLGLGraphicsPipelineDescriptor* pipelineStateDesc)`
 */
export const llglCreateGraphicsPipelineState = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineStateDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a graphics pipeline state with extended parameters.
 *
 * C ref: `LLGLPipelineState llglCreateGraphicsPipelineStateExt(LLGLRenderSystem renderSystem, const LLGLGraphicsPipelineDescriptor* pipelineStateDesc, LLGLPipelineCache pipelineCache)`
 */
export const llglCreateGraphicsPipelineStateExt = {
  args: ['ptr', 'ptr', 'ptr'] as [
    renderSystem: 'ptr',
    pipelineStateDesc: 'ptr',
    pipelineCache: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a compute pipeline state.
 *
 * C ref: `LLGLPipelineState llglCreateComputePipelineState(LLGLRenderSystem renderSystem, const LLGLComputePipelineDescriptor* pipelineStateDesc)`
 */
export const llglCreateComputePipelineState = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineStateDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a compute pipeline state with extended parameters.
 *
 * C ref: `LLGLPipelineState llglCreateComputePipelineStateExt(LLGLRenderSystem renderSystem, const LLGLComputePipelineDescriptor* pipelineStateDesc, LLGLPipelineCache pipelineCache)`
 */
export const llglCreateComputePipelineStateExt = {
  args: ['ptr', 'ptr', 'ptr'] as [
    renderSystem: 'ptr',
    pipelineStateDesc: 'ptr',
    pipelineCache: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a pipeline state.
 *
 * C ref: `void llglReleasePipelineState(LLGLRenderSystem renderSystem, LLGLPipelineState pipelineState)`
 */
export const llglReleasePipelineState = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineState: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets pipeline state report.
 *
 * C ref: `const char* llglGetPipelineStateReport(LLGLPipelineState pipelineState)`
 */
export const llglGetPipelineStateReport = {
  args: ['ptr'] as [pipelineState: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

// LLGL MARK: PipelineCache

/**
 * Creates a pipeline cache.
 *
 * C ref: `LLGLPipelineCache llglCreatePipelineCache(LLGLRenderSystem renderSystem, const void* initialBlob, size_t initialBlobSize)`
 */
export const llglCreatePipelineCache = {
  args: ['ptr', 'ptr', 'u64'] as [
    renderSystem: 'ptr',
    initialBlob: 'ptr',
    initialBlobSize: 'u64',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a pipeline cache.
 *
 * C ref: `void llglReleasePipelineCache(LLGLRenderSystem renderSystem, LLGLPipelineCache pipelineCache)`
 */
export const llglReleasePipelineCache = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', pipelineCache: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets pipeline cache blob.
 *
 * C ref: `size_t llglGetPipelineCacheBlob(LLGLPipelineCache pipelineCache, void* blob, size_t blobSize)`
 */
export const llglGetPipelineCacheBlob = {
  args: ['ptr', 'ptr', 'u64'] as [
    pipelineCache: 'ptr',
    blob: 'ptr',
    blobSize: 'u64',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

// LLGL MARK: QueryHeap

/**
 * Creates a query heap.
 *
 * C ref: `LLGLQueryHeap llglCreateQueryHeap(LLGLRenderSystem renderSystem, const LLGLQueryHeapDescriptor* queryHeapDesc)`
 */
export const llglCreateQueryHeap = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', queryHeapDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a query heap.
 *
 * C ref: `void llglReleaseQueryHeap(LLGLRenderSystem renderSystem, LLGLQueryHeap queryHeap)`
 */
export const llglReleaseQueryHeap = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', queryHeap: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets query heap type.
 *
 * C ref: `int llglGetQueryHeapType(LLGLQueryHeap queryHeap)`
 */
export const llglGetQueryHeapType = {
  args: ['ptr'] as [queryHeap: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets query result.
 *
 * C ref: `int llglQueryResult(LLGLQueryHeap queryHeap, uint32_t firstQuery, uint32_t numQueries, void* data, size_t dataSize)`
 */
export const llglQueryResult = {
  args: ['ptr', 'u32', 'u32', 'ptr', 'u64'] as [
    queryHeap: 'ptr',
    firstQuery: 'u32',
    numQueries: 'u32',
    data: 'ptr',
    dataSize: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// LLGL MARK: Fence

/**
 * Creates a fence.
 *
 * C ref: `LLGLFence llglCreateFence(LLGLRenderSystem renderSystem)`
 */
export const llglCreateFence = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a fence.
 *
 * C ref: `void llglReleaseFence(LLGLRenderSystem renderSystem, LLGLFence fence)`
 */
export const llglReleaseFence = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', fence: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submits a fence.
 *
 * C ref: `void llglSubmitFence(LLGLFence fence)`
 */
export const llglSubmitFence = {
  args: ['ptr'] as [fence: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Waits for a fence.
 *
 * C ref: `int llglWaitFence(LLGLFence fence, uint64_t timeout)`
 */
export const llglWaitFence = {
  args: ['ptr', 'u64'] as [fence: 'ptr', timeout: 'u64'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Waits for GPU idle.
 *
 * C ref: `void llglWaitIdle(LLGLRenderSystem renderSystem)`
 */
export const llglWaitIdle = {
  args: ['ptr'] as [renderSystem: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: ResourceHeap

/**
 * Creates a resource heap.
 *
 * C ref: `LLGLResourceHeap llglCreateResourceHeap(LLGLRenderSystem renderSystem, const LLGLResourceHeapDescriptor* resourceHeapDesc)`
 */
export const llglCreateResourceHeap = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', resourceHeapDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a resource heap with extended parameters.
 *
 * C ref: `LLGLResourceHeap llglCreateResourceHeapExt(LLGLRenderSystem renderSystem, const LLGLResourceHeapDescriptor* resourceHeapDesc, uint32_t numInitialResourceViews)`
 */
export const llglCreateResourceHeapExt = {
  args: ['ptr', 'ptr', 'u32'] as [
    renderSystem: 'ptr',
    resourceHeapDesc: 'ptr',
    numInitialResourceViews: 'u32',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a resource heap.
 *
 * C ref: `void llglReleaseResourceHeap(LLGLRenderSystem renderSystem, LLGLResourceHeap resourceHeap)`
 */
export const llglReleaseResourceHeap = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', resourceHeap: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Writes to resource heap.
 *
 * C ref: `void llglWriteResourceHeap(LLGLResourceHeap resourceHeap, uint32_t firstDescriptor, uint32_t numDescriptors, const LLGLResourceViewDescriptor* descriptors)`
 */
export const llglWriteResourceHeap = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    resourceHeap: 'ptr',
    firstDescriptor: 'u32',
    numDescriptors: 'u32',
    descriptors: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: RenderPass

/**
 * Creates a render pass.
 *
 * C ref: `LLGLRenderPass llglCreateRenderPass(LLGLRenderSystem renderSystem, const LLGLRenderPassDescriptor* renderPassDesc)`
 */
export const llglCreateRenderPass = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', renderPassDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a render pass.
 *
 * C ref: `void llglReleaseRenderPass(LLGLRenderSystem renderSystem, LLGLRenderPass renderPass)`
 */
export const llglReleaseRenderPass = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', renderPass: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: RenderTarget

/**
 * Creates a render target.
 *
 * C ref: `LLGLRenderTarget llglCreateRenderTarget(LLGLRenderSystem renderSystem, const LLGLRenderTargetDescriptor* renderTargetDesc)`
 */
export const llglCreateRenderTarget = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', renderTargetDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a render target.
 *
 * C ref: `void llglReleaseRenderTarget(LLGLRenderSystem renderSystem, LLGLRenderTarget renderTarget)`
 */
export const llglReleaseRenderTarget = {
  args: ['ptr', 'ptr'] as [renderSystem: 'ptr', renderTarget: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets the resolution of a render target.
 *
 * C ref: `void llglGetRenderTargetResolution(LLGLRenderTarget renderTarget, LLGLExtent2D* outResolution)`
 */
export const llglGetRenderTargetResolution = {
  args: ['ptr', 'ptr'] as [renderTarget: 'ptr', outResolution: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets the number of samples for a render target.
 *
 * C ref: `uint32_t llglGetRenderTargetSamples(LLGLRenderTarget renderTarget)`
 */
export const llglGetRenderTargetSamples = {
  args: ['ptr'] as [renderTarget: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Gets the number of color attachments in a render target.
 *
 * C ref: `uint32_t llglGetRenderTargetNumColorAttachments(LLGLRenderTarget renderTarget)`
 */
export const llglGetRenderTargetNumColorAttachments = {
  args: ['ptr'] as [renderTarget: 'ptr'],
  returns: 'u32',
} as const satisfies FFIFunction;

/**
 * Checks if a render target has a depth attachment.
 *
 * C ref: `int llglHasRenderTargetDepthAttachment(LLGLRenderTarget renderTarget)`
 */
export const llglHasRenderTargetDepthAttachment = {
  args: ['ptr'] as [renderTarget: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Checks if a render target has a stencil attachment.
 *
 * C ref: `int llglHasRenderTargetStencilAttachment(LLGLRenderTarget renderTarget)`
 */
export const llglHasRenderTargetStencilAttachment = {
  args: ['ptr'] as [renderTarget: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

// LLGL MARK: Surface

/**
 * Gets the native handle of a surface.
 *
 * C ref: `bool llglGetSurfaceNativeHandle(LLGLSurface surface, void* nativeHandle, size_t nativeHandleSize)`
 */
export const llglGetSurfaceNativeHandle = {
  args: ['ptr', 'ptr', 'u64'] as [
    surface: 'ptr',
    nativeHandle: 'ptr',
    nativeHandleSize: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets the content size of a surface.
 *
 * C ref: `void llglGetSurfaceContentSize(LLGLSurface surface, LLGLExtent2D* outSize)`
 */
export const llglGetSurfaceContentSize = {
  args: ['ptr', 'ptr'] as [surface: 'ptr', outSize: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Adapts the surface for video mode.
 *
 * C ref: `bool llglAdaptSurfaceForVideoMode(LLGLSurface surface, LLGLExtent2D* outResolution, bool* outFullscreen)`
 */
export const llglAdaptSurfaceForVideoMode = {
  args: ['ptr', 'ptr', 'ptr'] as [
    surface: 'ptr',
    outResolution: 'ptr',
    outFullscreen: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Processes surface events globally.
 *
 * C ref: `bool llglProcessSurfaceEvents()`
 */
export const llglProcessSurfaceEvents = {
  args: [] as [],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Finds the display where a surface resides.
 *
 * C ref: `LLGLDisplay llglFindSurfaceResidentDisplay(LLGLSurface surface)`
 */
export const llglFindSurfaceResidentDisplay = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Resets pixel format for a surface (deprecated since 0.04b).
 *
 * C ref: `void llglResetSurfacePixelFormat(LLGLSurface surface)`
 */
export const llglResetSurfacePixelFormat = {
  args: ['ptr'] as [surface: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Display

/**
 * Gets the number of available displays.
 *
 * C ref: `size_t llglDisplayCount()`
 */
export const llglDisplayCount = {
  args: [] as [],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Gets the list of all displays.
 *
 * C ref: `LLGLDisplay const * llglGetDisplayList()`
 */
export const llglGetDisplayList = {
  args: [] as [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets a display by index.
 *
 * C ref: `LLGLDisplay llglGetDisplay(size_t index)`
 */
export const llglGetDisplay = {
  args: ['u64'] as [index: 'u64'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Gets the primary display.
 *
 * C ref: `LLGLDisplay llglGetPrimaryDisplay()`
 */
export const llglGetPrimaryDisplay = {
  args: [] as [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Shows or hides the cursor globally.
 *
 * C ref: `bool llglShowCursor(bool show)`
 */
export const llglShowCursor = {
  args: ['i32'] as [show: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Checks if cursor is shown.
 *
 * C ref: `bool llglIsCursorShown()`
 */
export const llglIsCursorShown = {
  args: [] as [],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the cursor position.
 *
 * C ref: `bool llglSetCursorPosition(const LLGLOffset2D* position)`
 */
export const llglSetCursorPosition = {
  args: ['ptr'] as [position: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets the cursor position.
 *
 * C ref: `void llglGetCursorPosition(LLGLOffset2D* outPosition)`
 */
export const llglGetCursorPosition = {
  args: ['ptr'] as [outPosition: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets display offset.
 *
 * C ref: `void llglGetDisplayOffset(LLGLDisplay display, LLGLOffset2D* outOffset)`
 */
export const llglGetDisplayOffset = {
  args: ['ptr', 'ptr'] as [display: 'ptr', outOffset: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resets display mode.
 *
 * C ref: `bool llglResetDisplayMode(LLGLDisplay display)`
 */
export const llglResetDisplayMode = {
  args: ['ptr'] as [display: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets display mode.
 *
 * C ref: `bool llglSetDisplayMode(LLGLDisplay display, const LLGLDisplayMode* displayMode)`
 */
export const llglSetDisplayMode = {
  args: ['ptr', 'ptr'] as [display: 'ptr', displayMode: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Gets current display mode.
 *
 * C ref: `void llglGetDisplayMode(LLGLDisplay display, LLGLDisplayMode* outDisplayMode)`
 */
export const llglGetDisplayMode = {
  args: ['ptr', 'ptr'] as [display: 'ptr', outDisplayMode: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets list of supported display modes.
 *
 * C ref: `size_t llglGetSupportedDisplayModes(LLGLDisplay display, size_t maxNumDisplayModes, LLGLDisplayMode* outDisplayModes)`
 */
export const llglGetSupportedDisplayModes = {
  args: ['ptr', 'u64', 'ptr'] as [
    display: 'ptr',
    maxNumDisplayModes: 'u64',
    outDisplayModes: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

// LLGL MARK: Utility Functions

/**
 * Converts a format enum to string.
 *
 * C ref: `const char* llglFormatToString(int format)`
 */
export const llglFormatToString = {
  args: ['i32'] as [format: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Converts shader type enum to string.
 *
 * C ref: `const char* llglShaderTypeToString(int shaderType)`
 */
export const llglShaderTypeToString = {
  args: ['i32'] as [shaderType: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Logs a formatted message.
 *
 * C ref: `void llglLogPrintf(const char* format, ...)`
 */
export const llglLogPrintf = {
  args: ['cstring'] as [format: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Logs an error message.
 *
 * C ref: `void llglLogErrorf(const char* format, ...)`
 */
export const llglLogErrorf = {
  args: ['cstring'] as [format: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Registers log callback.
 *
 * C ref: `LLGLLogHandle llglRegisterLogCallback(LLGL_PFN_ReportCallback callback, void* userData)`
 */
export const llglRegisterLogCallback = {
  args: ['ptr', 'ptr'] as [callback: 'ptr', userData: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Registers log callback for a report.
 *
 * C ref: `LLGLLogHandle llglRegisterLogCallbackReport(LLGLReport report)`
 */
export const llglRegisterLogCallbackReport = {
  args: ['ptr'] as [report: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Registers log callback for standard streams.
 *
 * C ref: `LLGLLogHandle llglRegisterLogCallbackStd(long stdOutFlags)`
 */
export const llglRegisterLogCallbackStd = {
  args: ['i64'] as [stdOutFlags: 'i64'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Unregisters log callback.
 *
 * C ref: `void llglUnregisterLogCallback(LLGLLogHandle handle)`
 */
export const llglUnregisterLogCallback = {
  args: ['ptr'] as [handle: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// LLGL MARK: Window

/**
 * Creates a window.
 *
 * C ref: `LLGLWindow llglCreateWindow(const LLGLWindowDescriptor* windowDesc)`
 */
export const llglCreateWindow = {
  args: ['ptr'] as [windowDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a window.
 *
 * C ref: `void llglReleaseWindow(LLGLWindow window)`
 */
export const llglReleaseWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets window position.
 *
 * C ref: `void llglSetWindowPosition(LLGLWindow window, const LLGLOffset2D* position)`
 */
export const llglSetWindowPosition = {
  args: ['ptr', 'ptr'] as [window: 'ptr', position: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets window position.
 *
 * C ref: `void llglGetWindowPosition(LLGLWindow window, LLGLOffset2D* outPosition)`
 */
export const llglGetWindowPosition = {
  args: ['ptr', 'ptr'] as [window: 'ptr', outPosition: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets window size.
 *
 * C ref: `void llglSetWindowSize(LLGLWindow window, const LLGLExtent2D* size, bool useClientArea)`
 */
export const llglSetWindowSize = {
  args: ['ptr', 'ptr', 'i32'] as [
    window: 'ptr',
    size: 'ptr',
    useClientArea: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets window size.
 *
 * C ref: `void llglGetWindowSize(LLGLWindow window, LLGLExtent2D* outSize, bool useClientArea)`
 */
export const llglGetWindowSize = {
  args: ['ptr', 'ptr', 'i32'] as [
    window: 'ptr',
    outSize: 'ptr',
    useClientArea: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets window title (UTF-16).
 *
 * C ref: `void llglSetWindowTitle(LLGLWindow window, const wchar_t* title)`
 */
export const llglSetWindowTitle = {
  args: ['ptr', 'ptr'] as [window: 'ptr', title: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets window title (UTF-8).
 *
 * C ref: `void llglSetWindowTitleUTF8(LLGLWindow window, const char* title)`
 */
export const llglSetWindowTitleUTF8 = {
  args: ['ptr', 'cstring'] as [window: 'ptr', title: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets window title (UTF-16).
 *
 * C ref: `size_t llglGetWindowTitle(LLGLWindow window, size_t outTitleLength, wchar_t* outTitle)`
 */
export const llglGetWindowTitle = {
  args: ['ptr', 'u64', 'ptr'] as [
    window: 'ptr',
    outTitleLength: 'u64',
    outTitle: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Gets window title (UTF-8).
 *
 * C ref: `size_t llglGetWindowTitleUTF8(LLGLWindow window, size_t outTitleLength, char* outTitle)`
 */
export const llglGetWindowTitleUTF8 = {
  args: ['ptr', 'u64', 'ptr'] as [
    window: 'ptr',
    outTitleLength: 'u64',
    outTitle: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Shows or hides a window.
 *
 * C ref: `void llglShowWindow(LLGLWindow window, bool show)`
 */
export const llglShowWindow = {
  args: ['ptr', 'i32'] as [window: 'ptr', show: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Checks if window is shown.
 *
 * C ref: `bool llglIsWindowShown(LLGLWindow window)`
 */
export const llglIsWindowShown = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets window descriptor.
 *
 * C ref: `void llglSetWindowDesc(LLGLWindow window, const LLGLWindowDescriptor* windowDesc)`
 */
export const llglSetWindowDesc = {
  args: ['ptr', 'ptr'] as [window: 'ptr', windowDesc: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets window descriptor.
 *
 * C ref: `void llglGetWindowDesc(LLGLWindow window, LLGLWindowDescriptor* outWindowDesc)`
 */
export const llglGetWindowDesc = {
  args: ['ptr', 'ptr'] as [window: 'ptr', outWindowDesc: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Checks if window has focus.
 *
 * C ref: `bool llglHasWindowFocus(LLGLWindow window)`
 */
export const llglHasWindowFocus = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Checks if window quit was requested.
 *
 * C ref: `bool llglHasWindowQuit(LLGLWindow window)`
 */
export const llglHasWindowQuit = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets window user data.
 *
 * C ref: `void llglSetWindowUserData(LLGLWindow window, void* userData)`
 */
export const llglSetWindowUserData = {
  args: ['ptr', 'ptr'] as [window: 'ptr', userData: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets window user data.
 *
 * C ref: `void* llglGetWindowUserData(LLGLWindow window)`
 */
export const llglGetWindowUserData = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// LLGL MARK: Canvas

/**
 * Creates a canvas.
 *
 * C ref: `LLGLCanvas llglCreateCanvas(const LLGLCanvasDescriptor* canvasDesc)`
 */
export const llglCreateCanvas = {
  args: ['ptr'] as [canvasDesc: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Releases a canvas.
 *
 * C ref: `void llglReleaseCanvas(LLGLCanvas canvas)`
 */
export const llglReleaseCanvas = {
  args: ['ptr'] as [canvas: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets canvas title (UTF-16).
 *
 * C ref: `void llglSetCanvasTitle(LLGLCanvas canvas, const wchar_t* title)`
 */
export const llglSetCanvasTitle = {
  args: ['ptr', 'ptr'] as [canvas: 'ptr', title: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets canvas title (UTF-8).
 *
 * C ref: `void llglSetCanvasTitleUTF8(LLGLCanvas canvas, const char* title)`
 */
export const llglSetCanvasTitleUTF8 = {
  args: ['ptr', 'cstring'] as [canvas: 'ptr', title: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets canvas title (UTF-16).
 *
 * C ref: `size_t llglGetCanvasTitle(LLGLCanvas canvas, size_t outTitleLength, wchar_t* outTitle)`
 */
export const llglGetCanvasTitle = {
  args: ['ptr', 'u64', 'ptr'] as [
    canvas: 'ptr',
    outTitleLength: 'u64',
    outTitle: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Gets canvas title (UTF-8).
 *
 * C ref: `size_t llglGetCanvasTitleUTF8(LLGLCanvas canvas, size_t outTitleLength, char* outTitle)`
 */
export const llglGetCanvasTitleUTF8 = {
  args: ['ptr', 'u64', 'ptr'] as [
    canvas: 'ptr',
    outTitleLength: 'u64',
    outTitle: 'ptr',
  ],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Checks if canvas quit was requested (deprecated since 0.04b).
 *
 * C ref: `bool llglHasCanvasQuit(LLGLCanvas canvas)`
 */
export const llglHasCanvasQuit = {
  args: ['ptr'] as [canvas: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets canvas user data.
 *
 * C ref: `void llglSetCanvasUserData(LLGLCanvas canvas, void* userData)`
 */
export const llglSetCanvasUserData = {
  args: ['ptr', 'ptr'] as [canvas: 'ptr', userData: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Gets canvas user data.
 *
 * C ref: `void* llglGetCanvasUserData(LLGLCanvas canvas)`
 */
export const llglGetCanvasUserData = {
  args: ['ptr'] as [canvas: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;
