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
import { Vk_StructureType } from './enums';

// Common Vulkan structures

/**
 * Structure specifying a two-dimensional extent.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkExtent2D.html
 */
export const VkExtent2D = struct({
  width: u32(),
  height: u32(),
});

/**
 * Structure specifying a three-dimensional extent.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkExtent3D.html
 */
export const VkExtent3D = struct({
  width: u32(),
  height: u32(),
  depth: u32(),
});

/**
 * Structure specifying a two-dimensional offset.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkOffset2D.html
 */
export const VkOffset2D = struct({
  x: i32(),
  y: i32(),
});

/**
 * Structure specifying a three-dimensional offset.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkOffset3D.html
 */
export const VkOffset3D = struct({
  x: i32(),
  y: i32(),
  z: i32(),
});

/**
 * Structure specifying a two-dimensional subregion.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkRect2D.html
 */
export const VkRect2D = struct({
  offset: VkOffset2D,
  extent: VkExtent2D,
});

/**
 * Structure specifying a viewport.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkViewport.html
 */
export const VkViewport = struct({
  x: f32(),
  y: f32(),
  width: f32(),
  height: f32(),
  minDepth: f32(),
  maxDepth: f32(),
});

/**
 * Structure specifying an application info.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkApplicationInfo.html
 */
export const VkApplicationInfo = struct({
  sType: u32(Vk_StructureType.APPLICATION_INFO),
  pNext: ptrAny(),
  pApplicationName: ptrAny(),
  applicationVersion: u32(),
  pEngineName: ptrAny(),
  engineVersion: u32(),
  apiVersion: u32(),
});

/**
 * Structure specifying parameters of a newly created instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkInstanceCreateInfo.html
 */
export const VkInstanceCreateInfo = struct({
  sType: u32(Vk_StructureType.INSTANCE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  pApplicationInfo: pointer(VkApplicationInfo),
  enabledLayerCount: u32(),
  ppEnabledLayerNames: ptrAny(),
  enabledExtensionCount: u32(),
  ppEnabledExtensionNames: ptrAny(),
});

/**
 * Structure describing a queue family.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkQueueFamilyProperties.html
 */
export const VkQueueFamilyProperties = struct({
  queueFlags: u32(),
  queueCount: u32(),
  timestampValidBits: u32(),
  minImageTransferGranularity: VkExtent3D,
});

/**
 * Structure specifying parameters of a newly created device queue.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDeviceQueueCreateInfo.html
 */
export const VkDeviceQueueCreateInfo = struct({
  sType: u32(Vk_StructureType.DEVICE_QUEUE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  queueFamilyIndex: u32(),
  queueCount: u32(),
  pQueuePriorities: pointer(f32()),
});

/**
 * Structure describing the fine-grained features that can be supported by an implementation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDeviceFeatures.html
 */
export const VkPhysicalDeviceFeatures = struct({
  robustBufferAccess: bool(),
  fullDrawIndexUint32: bool(),
  imageCubeArray: bool(),
  independentBlend: bool(),
  geometryShader: bool(),
  tessellationShader: bool(),
  sampleRateShading: bool(),
  dualSrcBlend: bool(),
  logicOp: bool(),
  multiDrawIndirect: bool(),
  drawIndirectFirstInstance: bool(),
  depthClamp: bool(),
  depthBiasClamp: bool(),
  fillModeNonSolid: bool(),
  depthBounds: bool(),
  wideLines: bool(),
  largePoints: bool(),
  alphaToOne: bool(),
  multiViewport: bool(),
  samplerAnisotropy: bool(),
  textureCompressionETC2: bool(),
  textureCompressionASTC_LDR: bool(),
  textureCompressionBC: bool(),
  occlusionQueryPrecise: bool(),
  pipelineStatisticsQuery: bool(),
  vertexPipelineStoresAndAtomics: bool(),
  fragmentStoresAndAtomics: bool(),
  shaderTessellationAndGeometryPointSize: bool(),
  shaderImageGatherExtended: bool(),
  shaderStorageImageExtendedFormats: bool(),
  shaderStorageImageMultisample: bool(),
  shaderStorageImageReadWithoutFormat: bool(),
  shaderStorageImageWriteWithoutFormat: bool(),
  shaderUniformBufferArrayDynamicIndexing: bool(),
  shaderSampledImageArrayDynamicIndexing: bool(),
  shaderStorageBufferArrayDynamicIndexing: bool(),
  shaderStorageImageArrayDynamicIndexing: bool(),
  shaderClipDistance: bool(),
  shaderCullDistance: bool(),
  shaderFloat64: bool(),
  shaderInt64: bool(),
  shaderInt16: bool(),
  shaderResourceResidency: bool(),
  shaderResourceMinLod: bool(),
  sparseBinding: bool(),
  sparseResidencyBuffer: bool(),
  sparseResidencyImage2D: bool(),
  sparseResidencyImage3D: bool(),
  sparseResidency2Samples: bool(),
  sparseResidency4Samples: bool(),
  sparseResidency8Samples: bool(),
  sparseResidency16Samples: bool(),
  sparseResidencyAliased: bool(),
  variableMultisampleRate: bool(),
  inheritedQueries: bool(),
});

/**
 * Structure specifying parameters of a newly created device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDeviceCreateInfo.html
 */
export const VkDeviceCreateInfo = struct({
  sType: u32(Vk_StructureType.DEVICE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  queueCreateInfoCount: u32(),
  pQueueCreateInfos: pointer(VkDeviceQueueCreateInfo),
  enabledLayerCount: u32(),
  ppEnabledLayerNames: ptrAny(),
  enabledExtensionCount: u32(),
  ppEnabledExtensionNames: ptrAny(),
  pEnabledFeatures: pointer(VkPhysicalDeviceFeatures),
});

/**
 * Structure specifying memory allocation parameters.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryAllocateInfo.html
 */
export const VkMemoryAllocateInfo = struct({
  sType: u32(Vk_StructureType.MEMORY_ALLOCATE_INFO),
  pNext: ptrAny(),
  allocationSize: u64(),
  memoryTypeIndex: u32(),
});

/**
 * Structure specifying a buffer creation parameters.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferCreateInfo.html
 */
export const VkBufferCreateInfo = struct({
  sType: u32(Vk_StructureType.BUFFER_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  size: u64(),
  usage: u32(),
  sharingMode: u32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: pointer(u32()),
});

/**
 * Structure specifying an image creation parameters.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageCreateInfo.html
 */
export const VkImageCreateInfo = struct({
  sType: u32(Vk_StructureType.IMAGE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  imageType: u32(),
  format: u32(),
  extent: VkExtent3D,
  mipLevels: u32(),
  arrayLayers: u32(),
  samples: u32(),
  tiling: u32(),
  usage: u32(),
  sharingMode: u32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: pointer(u32()),
  initialLayout: u32(),
});

/**
 * Structure specifying a image subresource range.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageSubresourceRange.html
 */
export const VkImageSubresourceRange = struct({
  aspectMask: u32(),
  baseMipLevel: u32(),
  levelCount: u32(),
  baseArrayLayer: u32(),
  layerCount: u32(),
});

/**
 * Structure specifying parameters of a newly created image view.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageViewCreateInfo.html
 */
export const VkImageViewCreateInfo = struct({
  sType: u32(Vk_StructureType.IMAGE_VIEW_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  image: u64(),
  viewType: u32(),
  format: u32(),
  components: struct({
    r: u32(),
    g: u32(),
    b: u32(),
    a: u32(),
  }),
  subresourceRange: VkImageSubresourceRange,
});

/**
 * Structure specifying parameters of a newly created fence.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFenceCreateInfo.html
 */
export const VkFenceCreateInfo = struct({
  sType: u32(Vk_StructureType.FENCE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
});

/**
 * Structure specifying parameters of a newly created semaphore.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSemaphoreCreateInfo.html
 */
export const VkSemaphoreCreateInfo = struct({
  sType: u32(Vk_StructureType.SEMAPHORE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
});

/**
 * Structure specifying parameters of a newly created command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandPoolCreateInfo.html
 */
export const VkCommandPoolCreateInfo = struct({
  sType: u32(Vk_StructureType.COMMAND_POOL_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  queueFamilyIndex: u32(),
});

/**
 * Structure specifying the allocation parameters for command buffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandBufferAllocateInfo.html
 */
export const VkCommandBufferAllocateInfo = struct({
  sType: u32(Vk_StructureType.COMMAND_BUFFER_ALLOCATE_INFO),
  pNext: ptrAny(),
  commandPool: u64(),
  level: u32(),
  commandBufferCount: u32(),
});

/**
 * Structure specifying a command buffer begin operation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandBufferBeginInfo.html
 */
export const VkCommandBufferBeginInfo = struct({
  sType: u32(Vk_StructureType.COMMAND_BUFFER_BEGIN_INFO),
  pNext: ptrAny(),
  flags: u32(),
  pInheritanceInfo: ptrAny(),
});

/**
 * Structure specifying parameters of a queue submit operation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubmitInfo.html
 */
export const VkSubmitInfo = struct({
  sType: u32(Vk_StructureType.SUBMIT_INFO),
  pNext: ptrAny(),
  waitSemaphoreCount: u32(),
  pWaitSemaphores: ptrAny(),
  pWaitDstStageMask: pointer(u32()),
  commandBufferCount: u32(),
  pCommandBuffers: ptrAny(),
  signalSemaphoreCount: u32(),
  pSignalSemaphores: ptrAny(),
});

/**
 * Structure specifying a clear color value.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkClearColorValue.html
 */
export const VkClearColorValue = struct({
  float32: array(f32(), 4),
});

/**
 * Structure specifying a clear depth/stencil value.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkClearDepthStencilValue.html
 */
export const VkClearDepthStencilValue = struct({
  depth: f32(),
  stencil: u32(),
});

// KHR Surface structures

/**
 * Structure describing capabilities of a surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSurfaceCapabilitiesKHR.html
 */
export const VkSurfaceCapabilitiesKHR = struct({
  minImageCount: u32(),
  maxImageCount: u32(),
  currentExtent: VkExtent2D,
  minImageExtent: VkExtent2D,
  maxImageExtent: VkExtent2D,
  maxImageArrayLayers: u32(),
  supportedTransforms: u32(),
  currentTransform: u32(),
  supportedCompositeAlpha: u32(),
  supportedUsageFlags: u32(),
});

/**
 * Structure describing a supported swapchain format-color space pair.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSurfaceFormatKHR.html
 */
export const VkSurfaceFormatKHR = struct({
  format: u32(),
  colorSpace: u32(),
});

/**
 * Structure specifying parameters of a newly created swapchain object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSwapchainCreateInfoKHR.html
 */
export const VkSwapchainCreateInfoKHR = struct({
  sType: u32(Vk_StructureType.SWAPCHAIN_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  surface: u64(),
  minImageCount: u32(),
  imageFormat: u32(),
  imageColorSpace: u32(),
  imageExtent: VkExtent2D,
  imageArrayLayers: u32(),
  imageUsage: u32(),
  imageSharingMode: u32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: pointer(u32()),
  preTransform: u32(),
  compositeAlpha: u32(),
  presentMode: u32(),
  clipped: bool(),
  oldSwapchain: u64(),
});

/**
 * Structure describing parameters of a queue presentation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPresentInfoKHR.html
 */
export const VkPresentInfoKHR = struct({
  sType: u32(Vk_StructureType.PRESENT_INFO_KHR),
  pNext: ptrAny(),
  waitSemaphoreCount: u32(),
  pWaitSemaphores: ptrAny(),
  swapchainCount: u32(),
  pSwapchains: ptrAny(),
  pImageIndices: pointer(u32()),
  pResults: pointer(i32()),
});

/**
 * Structure specifying properties of a physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDeviceProperties.html
 */
export const VkPhysicalDeviceProperties = struct({
  apiVersion: u32(),
  driverVersion: u32(),
  vendorID: u32(),
  deviceID: u32(),
  deviceType: u32(),
  deviceName: array(u8(), 256),
  pipelineCacheUUID: array(u8(), 16),
  limits: ptrAny(), // VkPhysicalDeviceLimits
  sparseProperties: ptrAny(), // VkPhysicalDeviceSparseProperties
});

/**
 * Structure specifying memory requirements.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryRequirements.html
 */
export const VkMemoryRequirements = struct({
  size: u64(),
  alignment: u64(),
  memoryTypeBits: u32(),
});

/**
 * Structure specifying a descriptor set layout binding.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorSetLayoutBinding.html
 */
export const VkDescriptorSetLayoutBinding = struct({
  binding: u32(),
  descriptorType: u32(),
  descriptorCount: u32(),
  stageFlags: u32(),
  pImmutableSamplers: ptrAny(),
});

/**
 * Structure specifying parameters of a newly created descriptor set layout.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorSetLayoutCreateInfo.html
 */
export const VkDescriptorSetLayoutCreateInfo = struct({
  sType: u32(Vk_StructureType.DESCRIPTOR_SET_LAYOUT_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  bindingCount: u32(),
  pBindings: pointer(VkDescriptorSetLayoutBinding),
});

/**
 * Structure specifying a descriptor pool size.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorPoolSize.html
 */
export const VkDescriptorPoolSize = struct({
  type: u32(),
  descriptorCount: u32(),
});

/**
 * Structure specifying parameters of a newly created descriptor pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorPoolCreateInfo.html
 */
export const VkDescriptorPoolCreateInfo = struct({
  sType: u32(Vk_StructureType.DESCRIPTOR_POOL_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  maxSets: u32(),
  poolSizeCount: u32(),
  pPoolSizes: pointer(VkDescriptorPoolSize),
});

/**
 * Structure specifying the allocation parameters for descriptor sets.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorSetAllocateInfo.html
 */
export const VkDescriptorSetAllocateInfo = struct({
  sType: u32(Vk_StructureType.DESCRIPTOR_SET_ALLOCATE_INFO),
  pNext: ptrAny(),
  descriptorPool: u64(),
  descriptorSetCount: u32(),
  pSetLayouts: ptrAny(),
});

/**
 * Structure specifying a push constant range.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPushConstantRange.html
 */
export const VkPushConstantRange = struct({
  stageFlags: u32(),
  offset: u32(),
  size: u32(),
});

/**
 * Structure specifying the parameters of a newly created pipeline layout.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineLayoutCreateInfo.html
 */
export const VkPipelineLayoutCreateInfo = struct({
  sType: u32(Vk_StructureType.PIPELINE_LAYOUT_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  setLayoutCount: u32(),
  pSetLayouts: ptrAny(),
  pushConstantRangeCount: u32(),
  pPushConstantRanges: pointer(VkPushConstantRange),
});

/**
 * Structure specifying parameters of a newly created shader module.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkShaderModuleCreateInfo.html
 */
export const VkShaderModuleCreateInfo = struct({
  sType: u32(Vk_StructureType.SHADER_MODULE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  codeSize: u64(),
  pCode: pointer(u32()),
});

/**
 * Structure specifying an attachment description.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentDescription.html
 */
export const VkAttachmentDescription = struct({
  flags: u32(),
  format: u32(),
  samples: u32(),
  loadOp: u32(),
  storeOp: u32(),
  stencilLoadOp: u32(),
  stencilStoreOp: u32(),
  initialLayout: u32(),
  finalLayout: u32(),
});

/**
 * Structure specifying an attachment reference.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentReference.html
 */
export const VkAttachmentReference = struct({
  attachment: u32(),
  layout: u32(),
});

/**
 * Structure specifying a subpass description.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassDescription.html
 */
export const VkSubpassDescription = struct({
  flags: u32(),
  pipelineBindPoint: u32(),
  inputAttachmentCount: u32(),
  pInputAttachments: ptrAny(),
  colorAttachmentCount: u32(),
  pColorAttachments: ptrAny(),
  pResolveAttachments: ptrAny(),
  pDepthStencilAttachment: ptrAny(),
  preserveAttachmentCount: u32(),
  pPreserveAttachments: ptrAny(),
});

/**
 * Structure specifying a subpass dependency.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassDependency.html
 */
export const VkSubpassDependency = struct({
  srcSubpass: u32(),
  dstSubpass: u32(),
  srcStageMask: u32(),
  dstStageMask: u32(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
  dependencyFlags: u32(),
});

/**
 * Structure specifying parameters of a newly created render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkRenderPassCreateInfo.html
 */
export const VkRenderPassCreateInfo = struct({
  sType: u32(Vk_StructureType.RENDER_PASS_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  attachmentCount: u32(),
  pAttachments: ptrAny(),
  subpassCount: u32(),
  pSubpasses: ptrAny(),
  dependencyCount: u32(),
  pDependencies: ptrAny(),
});

/**
 * Structure specifying parameters of a newly created framebuffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFramebufferCreateInfo.html
 */
export const VkFramebufferCreateInfo = struct({
  sType: u32(Vk_StructureType.FRAMEBUFFER_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  renderPass: u64(),
  attachmentCount: u32(),
  pAttachments: ptrAny(),
  width: u32(),
  height: u32(),
  layers: u32(),
});

/**
 * Structure specifying render pass begin information.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkRenderPassBeginInfo.html
 */
export const VkRenderPassBeginInfo = struct({
  sType: u32(Vk_StructureType.RENDER_PASS_BEGIN_INFO),
  pNext: ptrAny(),
  renderPass: u64(),
  framebuffer: u64(),
  renderArea: VkRect2D,
  clearValueCount: u32(),
  pClearValues: ptrAny(),
});

/**
 * Structure specifying a vertex input binding description.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkVertexInputBindingDescription.html
 */
export const VkVertexInputBindingDescription = struct({
  binding: u32(),
  stride: u32(),
  inputRate: u32(),
});

/**
 * Structure specifying a vertex input attribute description.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkVertexInputAttributeDescription.html
 */
export const VkVertexInputAttributeDescription = struct({
  location: u32(),
  binding: u32(),
  format: u32(),
  offset: u32(),
});

/**
 * Structure specifying parameters of a newly created pipeline shader stage.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineShaderStageCreateInfo.html
 */
export const VkPipelineShaderStageCreateInfo = struct({
  sType: u32(Vk_StructureType.PIPELINE_SHADER_STAGE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  stage: u32(),
  module: u64(),
  pName: ptrAny(),
  pSpecializationInfo: ptrAny(),
});

/**
 * Structure specifying a image subresource.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageSubresource.html
 */
export const VkImageSubresource = struct({
  aspectMask: u32(),
  mipLevel: u32(),
  arrayLayer: u32(),
});

/**
 * Structure specifying a image subresource layers.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageSubresourceLayers.html
 */
export const VkImageSubresourceLayers = struct({
  aspectMask: u32(),
  mipLevel: u32(),
  baseArrayLayer: u32(),
  layerCount: u32(),
});

/**
 * Structure specifying a image memory barrier.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageMemoryBarrier.html
 */
export const VkImageMemoryBarrier = struct({
  sType: u32(Vk_StructureType.IMAGE_MEMORY_BARRIER),
  pNext: ptrAny(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
  oldLayout: u32(),
  newLayout: u32(),
  srcQueueFamilyIndex: u32(),
  dstQueueFamilyIndex: u32(),
  image: u64(),
  subresourceRange: VkImageSubresourceRange,
});

/**
 * Structure specifying a buffer memory barrier.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferMemoryBarrier.html
 */
export const VkBufferMemoryBarrier = struct({
  sType: u32(Vk_StructureType.BUFFER_MEMORY_BARRIER),
  pNext: ptrAny(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
  srcQueueFamilyIndex: u32(),
  dstQueueFamilyIndex: u32(),
  buffer: u64(),
  offset: u64(),
  size: u64(),
});

/**
 * Structure specifying a memory barrier.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryBarrier.html
 */
export const VkMemoryBarrier = struct({
  sType: u32(Vk_StructureType.MEMORY_BARRIER),
  pNext: ptrAny(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
});

/**
 * Structure specifying parameters of a newly created Win32 surface object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkWin32SurfaceCreateInfoKHR.html
 */
export const VkWin32SurfaceCreateInfoKHR = struct({
  sType: u32(Vk_StructureType.WIN32_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  hinstance: ptrAny(),
  hwnd: ptrAny(),
});

/**
 * Structure specifying parameters of a newly created Xlib surface object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkXlibSurfaceCreateInfoKHR.html
 */
export const VkXlibSurfaceCreateInfoKHR = struct({
  sType: u32(Vk_StructureType.XLIB_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  dpy: ptrAny(),
  window: u64(),
});

/**
 * Structure specifying parameters of a newly created Metal surface object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMetalSurfaceCreateInfoEXT.html
 */
export const VkMetalSurfaceCreateInfoEXT = struct({
  sType: u32(Vk_StructureType.METAL_SURFACE_CREATE_INFO_EXT),
  pNext: ptrAny(),
  flags: u32(),
  pLayer: ptrAny(),
});

// Vulkan MARK: 1.1

/**
 * Structure describing a queue family.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkQueueFamilyProperties2.html
 */
export const VkQueueFamilyProperties2 = struct({
  sType: u32(Vk_StructureType.QUEUE_FAMILY_PROPERTIES_2),
  pNext: ptrAny(),
  queueFamilyProperties: VkQueueFamilyProperties,
});
