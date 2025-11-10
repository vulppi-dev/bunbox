import type { FFIFunction } from 'bun:ffi';

// MARK: Buffer Functions

/**
 * Create a new buffer object
 *
 * C ref: `VkResult vkCreateBuffer(
 *   VkDevice device,
 *   const VkBufferCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkBuffer* pBuffer)`
 */
export const vkCreateBuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pBuffer: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a buffer object
 *
 * C ref: `void vkDestroyBuffer(
 *   VkDevice device,
 *   VkBuffer buffer,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyBuffer = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    buffer: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind device memory to a buffer object
 *
 * C ref: `VkResult vkBindBufferMemory(
 *   VkDevice device,
 *   VkBuffer buffer,
 *   VkDeviceMemory memory,
 *   VkDeviceSize memoryOffset)`
 */
export const vkBindBufferMemory = {
  args: ['ptr', 'ptr', 'ptr', 'u64'] as [
    device: 'ptr',
    buffer: 'ptr',
    memory: 'ptr',
    memoryOffset: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for specified Vulkan object
 *
 * C ref: `void vkGetBufferMemoryRequirements(
 *   VkDevice device,
 *   VkBuffer buffer,
 *   VkMemoryRequirements* pMemoryRequirements)`
 */
export const vkGetBufferMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    buffer: 'ptr',
    pMemoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Image Functions

/**
 * Create a new image object
 *
 * C ref: `VkResult vkCreateImage(
 *   VkDevice device,
 *   const VkImageCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkImage* pImage)`
 */
export const vkCreateImage = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pImage: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an image object
 *
 * C ref: `void vkDestroyImage(
 *   VkDevice device,
 *   VkImage image,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyImage = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind device memory to an image object
 *
 * C ref: `VkResult vkBindImageMemory(
 *   VkDevice device,
 *   VkImage image,
 *   VkDeviceMemory memory,
 *   VkDeviceSize memoryOffset)`
 */
export const vkBindImageMemory = {
  args: ['ptr', 'ptr', 'ptr', 'u64'] as [
    device: 'ptr',
    image: 'ptr',
    memory: 'ptr',
    memoryOffset: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for specified Vulkan object
 *
 * C ref: `void vkGetImageMemoryRequirements(
 *   VkDevice device,
 *   VkImage image,
 *   VkMemoryRequirements* pMemoryRequirements)`
 */
export const vkGetImageMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    pMemoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create an image view from an existing image
 *
 * C ref: `VkResult vkCreateImageView(
 *   VkDevice device,
 *   const VkImageViewCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkImageView* pView)`
 */
export const vkCreateImageView = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pView: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an image view object
 *
 * C ref: `void vkDestroyImageView(
 *   VkDevice device,
 *   VkImageView imageView,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyImageView = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    imageView: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Shader Module

/**
 * Create a new shader module object
 *
 * C ref: `VkResult vkCreateShaderModule(
 *   VkDevice device,
 *   const VkShaderModuleCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkShaderModule* pShaderModule)`
 */
export const vkCreateShaderModule = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pShaderModule: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a shader module object
 *
 * C ref: `void vkDestroyShaderModule(
 *   VkDevice device,
 *   VkShaderModule shaderModule,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyShaderModule = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    shaderModule: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Descriptor Set Layout Functions

/**
 * Create a new descriptor set layout object
 *
 * C ref: `VkResult vkCreateDescriptorSetLayout(
 *   VkDevice device,
 *   const VkDescriptorSetLayoutCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkDescriptorSetLayout* pSetLayout)`
 */
export const vkCreateDescriptorSetLayout = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pSetLayout: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a descriptor set layout object
 *
 * C ref: `void vkDestroyDescriptorSetLayout(
 *   VkDevice device,
 *   VkDescriptorSetLayout descriptorSetLayout,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyDescriptorSetLayout = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    descriptorSetLayout: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Pipeline Layout Functions

/**
 * Create a new pipeline layout object
 *
 * C ref: `VkResult vkCreatePipelineLayout(
 *   VkDevice device,
 *   const VkPipelineLayoutCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkPipelineLayout* pPipelineLayout)`
 */
export const vkCreatePipelineLayout = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pPipelineLayout: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a pipeline layout object
 *
 * C ref: `void vkDestroyPipelineLayout(
 *   VkDevice device,
 *   VkPipelineLayout pipelineLayout,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyPipelineLayout = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineLayout: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Render Pass Functions

/**
 * Create a new render pass object
 *
 * C ref: `VkResult vkCreateRenderPass(
 *   VkDevice device,
 *   const VkRenderPassCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkRenderPass* pRenderPass)`
 */
export const vkCreateRenderPass = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pRenderPass: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a render pass object
 *
 * C ref: `void vkDestroyRenderPass(
 *   VkDevice device,
 *   VkRenderPass renderPass,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyRenderPass = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    renderPass: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Framebuffer Functions

/**
 * Create a new framebuffer object
 *
 * C ref: `VkResult vkCreateFramebuffer(
 *   VkDevice device,
 *   const VkFramebufferCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkFramebuffer* pFramebuffer)`
 */
export const vkCreateFramebuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pFramebuffer: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a framebuffer object
 *
 * C ref: `void vkDestroyFramebuffer(
 *   VkDevice device,
 *   VkFramebuffer framebuffer,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyFramebuffer = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    framebuffer: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Pipeline Functions

/**
 * Create graphics pipelines
 *
 * C ref: `VkResult vkCreateGraphicsPipelines(
 *   VkDevice device,
 *   VkPipelineCache pipelineCache,
 *   uint32_t createInfoCount,
 *   const VkGraphicsPipelineCreateInfo* pCreateInfos,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkPipeline* pPipelines)`
 */
export const vkCreateGraphicsPipelines = {
  args: ['ptr', 'ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    createInfoCount: 'u32',
    pCreateInfos: 'ptr',
    pAllocator: 'ptr',
    pPipelines: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create compute pipelines
 *
 * C ref: `VkResult vkCreateComputePipelines(
 *   VkDevice device,
 *   VkPipelineCache pipelineCache,
 *   uint32_t createInfoCount,
 *   const VkComputePipelineCreateInfo* pCreateInfos,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkPipeline* pPipelines)`
 */
export const vkCreateComputePipelines = {
  args: ['ptr', 'ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    createInfoCount: 'u32',
    pCreateInfos: 'ptr',
    pAllocator: 'ptr',
    pPipelines: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a pipeline object
 *
 * C ref: `void vkDestroyPipeline(
 *   VkDevice device,
 *   VkPipeline pipeline,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyPipeline = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipeline: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Command Pool and Buffer

/**
 * Create a new command pool object
 *
 * C ref: `VkResult vkCreateCommandPool(
 *   VkDevice device,
 *   const VkCommandPoolCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkCommandPool* pCommandPool)`
 */
export const vkCreateCommandPool = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pCommandPool: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a command pool object
 *
 * C ref: `void vkDestroyCommandPool(
 *   VkDevice device,
 *   VkCommandPool commandPool,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyCommandPool = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    commandPool: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset a command pool
 *
 * C ref: `VkResult vkResetCommandPool(
 *   VkDevice device,
 *   VkCommandPool commandPool,
 *   VkCommandPoolResetFlags flags)`
 */
export const vkResetCommandPool = {
  args: ['ptr', 'ptr', 'u32'] as [
    device: 'ptr',
    commandPool: 'ptr',
    flags: 'u32',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Allocate command buffers from an existing command pool
 *
 * C ref: `VkResult vkAllocateCommandBuffers(
 *   VkDevice device,
 *   const VkCommandBufferAllocateInfo* pAllocateInfo,
 *   VkCommandBuffer* pCommandBuffers)`
 */
export const vkAllocateCommandBuffers = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pAllocateInfo: 'ptr',
    pCommandBuffers: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Free command buffers
 *
 * C ref: `void vkFreeCommandBuffers(
 *   VkDevice device,
 *   VkCommandPool commandPool,
 *   uint32_t commandBufferCount,
 *   const VkCommandBuffer* pCommandBuffers)`
 */
export const vkFreeCommandBuffers = {
  args: ['ptr', 'ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    commandPool: 'ptr',
    commandBufferCount: 'u32',
    pCommandBuffers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Start recording a command buffer
 *
 * C ref: `VkResult vkBeginCommandBuffer(
 *   VkCommandBuffer commandBuffer,
 *   const VkCommandBufferBeginInfo* pBeginInfo)`
 */
export const vkBeginCommandBuffer = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', pBeginInfo: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Finish recording a command buffer
 *
 * C ref: `VkResult vkEndCommandBuffer(
 *   VkCommandBuffer commandBuffer)`
 */
export const vkEndCommandBuffer = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reset a command buffer to the initial state
 *
 * C ref: `VkResult vkResetCommandBuffer(
 *   VkCommandBuffer commandBuffer,
 *   VkCommandBufferResetFlags flags)`
 */
export const vkResetCommandBuffer = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', flags: 'u32'],
  returns: 'i32',
} as const satisfies FFIFunction;

// MARK: Command Buffer Recording

/**
 * Bind a pipeline object to a command buffer
 *
 * C ref: `void vkCmdBindPipeline(
 *   VkCommandBuffer commandBuffer,
 *   VkPipelineBindPoint pipelineBindPoint,
 *   VkPipeline pipeline)`
 */
export const vkCmdBindPipeline = {
  args: ['ptr', 'i32', 'ptr'] as [
    commandBuffer: 'ptr',
    pipelineBindPoint: 'i32',
    pipeline: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set the viewport on a command buffer
 *
 * C ref: `void vkCmdSetViewport(
 *   VkCommandBuffer commandBuffer,
 *   uint32_t firstViewport,
 *   uint32_t viewportCount,
 *   const VkViewport* pViewports)`
 */
export const vkCmdSetViewport = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    firstViewport: 'u32',
    viewportCount: 'u32',
    pViewports: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set scissor rectangles on a command buffer
 *
 * C ref: `void vkCmdSetScissor(
 *   VkCommandBuffer commandBuffer,
 *   uint32_t firstScissor,
 *   uint32_t scissorCount,
 *   const VkRect2D* pScissors)`
 */
export const vkCmdSetScissor = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    firstScissor: 'u32',
    scissorCount: 'u32',
    pScissors: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind vertex buffers to a command buffer
 *
 * C ref: `void vkCmdBindVertexBuffers(
 *   VkCommandBuffer commandBuffer,
 *   uint32_t firstBinding,
 *   uint32_t bindingCount,
 *   const VkBuffer* pBuffers,
 *   const VkDeviceSize* pOffsets)`
 */
export const vkCmdBindVertexBuffers = {
  args: ['ptr', 'u32', 'u32', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    firstBinding: 'u32',
    bindingCount: 'u32',
    pBuffers: 'ptr',
    pOffsets: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind an index buffer to a command buffer
 *
 * C ref: `void vkCmdBindIndexBuffer(
 *   VkCommandBuffer commandBuffer,
 *   VkBuffer buffer,
 *   VkDeviceSize offset,
 *   VkIndexType indexType)`
 */
export const vkCmdBindIndexBuffer = {
  args: ['ptr', 'ptr', 'u64', 'i32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    indexType: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw primitives
 *
 * C ref: `void vkCmdDraw(
 *   VkCommandBuffer commandBuffer,
 *   uint32_t vertexCount,
 *   uint32_t instanceCount,
 *   uint32_t firstVertex,
 *   uint32_t firstInstance)`
 */
export const vkCmdDraw = {
  args: ['ptr', 'u32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    vertexCount: 'u32',
    instanceCount: 'u32',
    firstVertex: 'u32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Issue an indexed draw into a command buffer
 *
 * C ref: `void vkCmdDrawIndexed(
 *   VkCommandBuffer commandBuffer,
 *   uint32_t indexCount,
 *   uint32_t instanceCount,
 *   uint32_t firstIndex,
 *   int32_t vertexOffset,
 *   uint32_t firstInstance)`
 */
export const vkCmdDrawIndexed = {
  args: ['ptr', 'u32', 'u32', 'u32', 'i32', 'u32'] as [
    commandBuffer: 'ptr',
    indexCount: 'u32',
    instanceCount: 'u32',
    firstIndex: 'u32',
    vertexOffset: 'i32',
    firstInstance: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data between buffer regions
 *
 * C ref: `void vkCmdCopyBuffer(
 *   VkCommandBuffer commandBuffer,
 *   VkBuffer srcBuffer,
 *   VkBuffer dstBuffer,
 *   uint32_t regionCount,
 *   const VkBufferCopy* pRegions)`
 */
export const vkCmdCopyBuffer = {
  args: ['ptr', 'ptr', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcBuffer: 'ptr',
    dstBuffer: 'ptr',
    regionCount: 'u32',
    pRegions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data between images
 *
 * C ref: `void vkCmdCopyImage(
 *   VkCommandBuffer commandBuffer,
 *   VkImage srcImage,
 *   VkImageLayout srcImageLayout,
 *   VkImage dstImage,
 *   VkImageLayout dstImageLayout,
 *   uint32_t regionCount,
 *   const VkImageCopy* pRegions)`
 */
export const vkCmdCopyImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'i32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcImage: 'ptr',
    srcImageLayout: 'i32',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    pRegions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data from a buffer into an image
 *
 * C ref: `void vkCmdCopyBufferToImage(
 *   VkCommandBuffer commandBuffer,
 *   VkBuffer srcBuffer,
 *   VkImage dstImage,
 *   VkImageLayout dstImageLayout,
 *   uint32_t regionCount,
 *   const VkBufferImageCopy* pRegions)`
 */
export const vkCmdCopyBufferToImage = {
  args: ['ptr', 'ptr', 'ptr', 'i32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcBuffer: 'ptr',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    pRegions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begin a render pass
 *
 * C ref: `void vkCmdBeginRenderPass(
 *   VkCommandBuffer commandBuffer,
 *   const VkRenderPassBeginInfo* pRenderPassBegin,
 *   VkSubpassContents contents)`
 */
export const vkCmdBeginRenderPass = {
  args: ['ptr', 'ptr', 'i32'] as [
    commandBuffer: 'ptr',
    pRenderPassBegin: 'ptr',
    contents: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * End the current render pass
 *
 * C ref: `void vkCmdEndRenderPass(
 *   VkCommandBuffer commandBuffer)`
 */
export const vkCmdEndRenderPass = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Insert a memory barrier
 *
 * C ref: `void vkCmdPipelineBarrier(
 *   VkCommandBuffer commandBuffer,
 *   VkPipelineStageFlags srcStageMask,
 *   VkPipelineStageFlags dstStageMask,
 *   VkDependencyFlags dependencyFlags,
 *   uint32_t memoryBarrierCount,
 *   const VkMemoryBarrier* pMemoryBarriers,
 *   uint32_t bufferMemoryBarrierCount,
 *   const VkBufferMemoryBarrier* pBufferMemoryBarriers,
 *   uint32_t imageMemoryBarrierCount,
 *   const VkImageMemoryBarrier* pImageMemoryBarriers)`
 */
export const vkCmdPipelineBarrier = {
  args: [
    'ptr',
    'u32',
    'u32',
    'u32',
    'u32',
    'ptr',
    'u32',
    'ptr',
    'u32',
    'ptr',
  ] as [
    commandBuffer: 'ptr',
    srcStageMask: 'u32',
    dstStageMask: 'u32',
    dependencyFlags: 'u32',
    memoryBarrierCount: 'u32',
    pMemoryBarriers: 'ptr',
    bufferMemoryBarrierCount: 'u32',
    pBufferMemoryBarriers: 'ptr',
    imageMemoryBarrierCount: 'u32',
    pImageMemoryBarriers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;
