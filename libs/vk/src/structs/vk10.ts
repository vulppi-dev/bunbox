import {
  array,
  f32,
  i8,
  i32,
  ptrAny,
  string,
  struct,
  u8,
  u32,
  u64,
} from '@bunbox/struct';

// MARK: Base Structures

export const vkApplicationInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  pApplicationName: string(),
  applicationVersion: u32(),
  pEngineName: string(),
  engineVersion: u32(),
  apiVersion: u32(),
});

export const vkInstanceCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  pApplicationInfo: ptrAny(),
  enabledLayerCount: u32(),
  ppEnabledLayerNames: ptrAny(),
  enabledExtensionCount: u32(),
  ppEnabledExtensionNames: ptrAny(),
});

export const vkLayerProperties = struct({
  layerName: array(i8(), 256),
  specVersion: u32(),
  implementationVersion: u32(),
  description: array(i8(), 256),
});

export const vkAllocationCallbacks = struct({
  pUserData: ptrAny(),
  pfnAllocation: ptrAny(),
  pfnReallocation: ptrAny(),
  pfnFree: ptrAny(),
  pfnInternalAllocation: ptrAny(),
  pfnInternalFree: ptrAny(),
});

// MARK: Physical Device Structures

export const vkPhysicalDeviceProperties = struct({
  apiVersion: u32(),
  driverVersion: u32(),
  vendorID: u32(),
  deviceID: u32(),
  deviceType: i32(),
  deviceName: array(i8(), 256),
  pipelineCacheUUID: array(u8(), 16),
  limits: ptrAny(),
  sparseProperties: ptrAny(),
});

export const vkPhysicalDeviceFeatures = struct({
  robustBufferAccess: u32(),
  fullDrawIndexUint32: u32(),
  imageCubeArray: u32(),
  independentBlend: u32(),
  geometryShader: u32(),
  tessellationShader: u32(),
  sampleRateShading: u32(),
  dualSrcBlend: u32(),
  logicOp: u32(),
  multiDrawIndirect: u32(),
  drawIndirectFirstInstance: u32(),
  depthClamp: u32(),
  depthBiasClamp: u32(),
  fillModeNonSolid: u32(),
  depthBounds: u32(),
  wideLines: u32(),
  largePoints: u32(),
  alphaToOne: u32(),
  multiViewport: u32(),
  samplerAnisotropy: u32(),
  textureCompressionETC2: u32(),
  textureCompressionASTC_LDR: u32(),
  textureCompressionBC: u32(),
  occlusionQueryPrecise: u32(),
  pipelineStatisticsQuery: u32(),
  vertexPipelineStoresAndAtomics: u32(),
  fragmentStoresAndAtomics: u32(),
  shaderTessellationAndGeometryPointSize: u32(),
  shaderImageGatherExtended: u32(),
  shaderStorageImageExtendedFormats: u32(),
  shaderStorageImageMultisample: u32(),
  shaderStorageImageReadWithoutFormat: u32(),
  shaderStorageImageWriteWithoutFormat: u32(),
  shaderUniformBufferArrayDynamicIndexing: u32(),
  shaderSampledImageArrayDynamicIndexing: u32(),
  shaderStorageBufferArrayDynamicIndexing: u32(),
  shaderStorageImageArrayDynamicIndexing: u32(),
  shaderClipDistance: u32(),
  shaderCullDistance: u32(),
  shaderFloat64: u32(),
  shaderInt64: u32(),
  shaderInt16: u32(),
  shaderResourceResidency: u32(),
  shaderResourceMinLod: u32(),
  sparseBinding: u32(),
  sparseResidencyBuffer: u32(),
  sparseResidencyImage2D: u32(),
  sparseResidencyImage3D: u32(),
  sparseResidency2Samples: u32(),
  sparseResidency4Samples: u32(),
  sparseResidency8Samples: u32(),
  sparseResidency16Samples: u32(),
  sparseResidencyAliased: u32(),
  variableMultisampleRate: u32(),
  inheritedQueries: u32(),
});

export const vkPhysicalDeviceMemoryProperties = struct({
  memoryTypeCount: u32(),
  memoryTypes: array(
    struct({
      propertyFlags: u32(),
      heapIndex: u32(),
    }),
    32,
  ),
  memoryHeapCount: u32(),
  memoryHeaps: array(
    struct({
      size: u64(),
      flags: u32(),
    }),
    16,
  ),
});

export const vkQueueFamilyProperties = struct({
  queueFlags: u32(),
  queueCount: u32(),
  timestampValidBits: u32(),
  minImageTransferGranularity: struct({
    width: u32(),
    height: u32(),
    depth: u32(),
  }),
});

// MARK: Device Structures

export const vkDeviceQueueCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  queueFamilyIndex: u32(),
  queueCount: u32(),
  pQueuePriorities: ptrAny(),
});

export const vkDeviceCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  queueCreateInfoCount: u32(),
  pQueueCreateInfos: ptrAny(),
  enabledLayerCount: u32(),
  ppEnabledLayerNames: ptrAny(),
  enabledExtensionCount: u32(),
  ppEnabledExtensionNames: ptrAny(),
  pEnabledFeatures: ptrAny(),
});

// MARK: Memory Structures

export const vkMemoryAllocateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  allocationSize: u64(),
  memoryTypeIndex: u32(),
});

export const vkMappedMemoryRange = struct({
  sType: i32(),
  pNext: ptrAny(),
  memory: ptrAny(),
  offset: u64(),
  size: u64(),
});

// MARK: Synchronization Structures

export const vkFenceCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
});

export const vkSemaphoreCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
});

export const vkEventCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
});

// MARK: Buffer Structures

export const vkBufferCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  size: u64(),
  usage: u32(),
  sharingMode: i32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: ptrAny(),
});

export const vkBufferViewCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  buffer: ptrAny(),
  format: i32(),
  offset: u64(),
  range: u64(),
});

// MARK: Image Structures

export const vkImageCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  imageType: i32(),
  format: i32(),
  extent: struct({
    width: u32(),
    height: u32(),
    depth: u32(),
  }),
  mipLevels: u32(),
  arrayLayers: u32(),
  samples: i32(),
  tiling: i32(),
  usage: u32(),
  sharingMode: i32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: ptrAny(),
  initialLayout: i32(),
});

export const vkImageViewCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  image: ptrAny(),
  viewType: i32(),
  format: i32(),
  components: struct({
    r: i32(),
    g: i32(),
    b: i32(),
    a: i32(),
  }),
  subresourceRange: struct({
    aspectMask: u32(),
    baseMipLevel: u32(),
    levelCount: u32(),
    baseArrayLayer: u32(),
    layerCount: u32(),
  }),
});

export const vkImageSubresourceLayers = struct({
  aspectMask: u32(),
  mipLevel: u32(),
  baseArrayLayer: u32(),
  layerCount: u32(),
});

export const vkImageSubresourceRange = struct({
  aspectMask: u32(),
  baseMipLevel: u32(),
  levelCount: u32(),
  baseArrayLayer: u32(),
  layerCount: u32(),
});

export const vkImageMemoryBarrier = struct({
  sType: i32(),
  pNext: ptrAny(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
  oldLayout: i32(),
  newLayout: i32(),
  srcQueueFamilyIndex: u32(),
  dstQueueFamilyIndex: u32(),
  image: ptrAny(),
  subresourceRange: vkImageSubresourceRange,
});

// MARK: Pipeline Structures

export const vkPipelineShaderStageCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  stage: u32(),
  module: ptrAny(),
  pName: string(),
  pSpecializationInfo: ptrAny(),
});

export const vkPipelineVertexInputStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  vertexBindingDescriptionCount: u32(),
  pVertexBindingDescriptions: ptrAny(),
  vertexAttributeDescriptionCount: u32(),
  pVertexAttributeDescriptions: ptrAny(),
});

export const vkPipelineInputAssemblyStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  topology: i32(),
  primitiveRestartEnable: u32(),
});

export const vkViewport = struct({
  x: f32(),
  y: f32(),
  width: f32(),
  height: f32(),
  minDepth: f32(),
  maxDepth: f32(),
});

export const vkRect2D = struct({
  offset: struct({
    x: i32(),
    y: i32(),
  }),
  extent: struct({
    width: u32(),
    height: u32(),
  }),
});

export const vkPipelineViewportStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  viewportCount: u32(),
  pViewports: ptrAny(),
  scissorCount: u32(),
  pScissors: ptrAny(),
});

export const vkPipelineRasterizationStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  depthClampEnable: u32(),
  rasterizerDiscardEnable: u32(),
  polygonMode: i32(),
  cullMode: u32(),
  frontFace: i32(),
  depthBiasEnable: u32(),
  depthBiasConstantFactor: f32(),
  depthBiasClamp: f32(),
  depthBiasSlopeFactor: f32(),
  lineWidth: f32(),
});

export const vkPipelineMultisampleStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  rasterizationSamples: i32(),
  sampleShadingEnable: u32(),
  minSampleShading: f32(),
  pSampleMask: ptrAny(),
  alphaToCoverageEnable: u32(),
  alphaToOneEnable: u32(),
});

export const vkPipelineDepthStencilStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  depthTestEnable: u32(),
  depthWriteEnable: u32(),
  depthCompareOp: i32(),
  depthBoundsTestEnable: u32(),
  stencilTestEnable: u32(),
  front: struct({
    failOp: i32(),
    passOp: i32(),
    depthFailOp: i32(),
    compareOp: i32(),
    compareMask: u32(),
    writeMask: u32(),
    reference: u32(),
  }),
  back: struct({
    failOp: i32(),
    passOp: i32(),
    depthFailOp: i32(),
    compareOp: i32(),
    compareMask: u32(),
    writeMask: u32(),
    reference: u32(),
  }),
  minDepthBounds: f32(),
  maxDepthBounds: f32(),
});

export const vkPipelineColorBlendAttachmentState = struct({
  blendEnable: u32(),
  srcColorBlendFactor: i32(),
  dstColorBlendFactor: i32(),
  colorBlendOp: i32(),
  srcAlphaBlendFactor: i32(),
  dstAlphaBlendFactor: i32(),
  alphaBlendOp: i32(),
  colorWriteMask: u32(),
});

export const vkPipelineColorBlendStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  logicOpEnable: u32(),
  logicOp: i32(),
  attachmentCount: u32(),
  pAttachments: ptrAny(),
  blendConstants: array(f32(), 4),
});

export const vkPipelineDynamicStateCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  dynamicStateCount: u32(),
  pDynamicStates: ptrAny(),
});

export const vkGraphicsPipelineCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  stageCount: u32(),
  pStages: ptrAny(),
  pVertexInputState: ptrAny(),
  pInputAssemblyState: ptrAny(),
  pTessellationState: ptrAny(),
  pViewportState: ptrAny(),
  pRasterizationState: ptrAny(),
  pMultisampleState: ptrAny(),
  pDepthStencilState: ptrAny(),
  pColorBlendState: ptrAny(),
  pDynamicState: ptrAny(),
  layout: ptrAny(),
  renderPass: ptrAny(),
  subpass: u32(),
  basePipelineHandle: ptrAny(),
  basePipelineIndex: i32(),
});

export const vkComputePipelineCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  stage: vkPipelineShaderStageCreateInfo,
  layout: ptrAny(),
  basePipelineHandle: ptrAny(),
  basePipelineIndex: i32(),
});

// MARK: Render Pass Structures

export const vkAttachmentDescription = struct({
  flags: u32(),
  format: i32(),
  samples: i32(),
  loadOp: i32(),
  storeOp: i32(),
  stencilLoadOp: i32(),
  stencilStoreOp: i32(),
  initialLayout: i32(),
  finalLayout: i32(),
});

export const vkAttachmentReference = struct({
  attachment: u32(),
  layout: i32(),
});

export const vkSubpassDescription = struct({
  flags: u32(),
  pipelineBindPoint: i32(),
  inputAttachmentCount: u32(),
  pInputAttachments: ptrAny(),
  colorAttachmentCount: u32(),
  pColorAttachments: ptrAny(),
  pResolveAttachments: ptrAny(),
  pDepthStencilAttachment: ptrAny(),
  preserveAttachmentCount: u32(),
  pPreserveAttachments: ptrAny(),
});

export const vkSubpassDependency = struct({
  srcSubpass: u32(),
  dstSubpass: u32(),
  srcStageMask: u32(),
  dstStageMask: u32(),
  srcAccessMask: u32(),
  dstAccessMask: u32(),
  dependencyFlags: u32(),
});

export const vkRenderPassCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  attachmentCount: u32(),
  pAttachments: ptrAny(),
  subpassCount: u32(),
  pSubpasses: ptrAny(),
  dependencyCount: u32(),
  pDependencies: ptrAny(),
});

export const vkFramebufferCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  renderPass: ptrAny(),
  attachmentCount: u32(),
  pAttachments: ptrAny(),
  width: u32(),
  height: u32(),
  layers: u32(),
});

export const vkRenderPassBeginInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  renderPass: ptrAny(),
  framebuffer: ptrAny(),
  renderArea: vkRect2D,
  clearValueCount: u32(),
  pClearValues: ptrAny(),
});

// MARK: Command Buffer Structures

export const vkCommandPoolCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  queueFamilyIndex: u32(),
});

export const vkCommandBufferAllocateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  commandPool: ptrAny(),
  level: i32(),
  commandBufferCount: u32(),
});

export const vkCommandBufferBeginInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  pInheritanceInfo: ptrAny(),
});

export const vkSubmitInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  waitSemaphoreCount: u32(),
  pWaitSemaphores: ptrAny(),
  pWaitDstStageMask: ptrAny(),
  commandBufferCount: u32(),
  pCommandBuffers: ptrAny(),
  signalSemaphoreCount: u32(),
  pSignalSemaphores: ptrAny(),
});

// MARK: Descriptor Structures

export const vkDescriptorSetLayoutBinding = struct({
  binding: u32(),
  descriptorType: i32(),
  descriptorCount: u32(),
  stageFlags: u32(),
  pImmutableSamplers: ptrAny(),
});

export const vkDescriptorSetLayoutCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  bindingCount: u32(),
  pBindings: ptrAny(),
});

export const vkDescriptorPoolSize = struct({
  type: i32(),
  descriptorCount: u32(),
});

export const vkDescriptorPoolCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  maxSets: u32(),
  poolSizeCount: u32(),
  pPoolSizes: ptrAny(),
});

export const vkDescriptorSetAllocateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  descriptorPool: ptrAny(),
  descriptorSetCount: u32(),
  pSetLayouts: ptrAny(),
});

export const vkDescriptorImageInfo = struct({
  sampler: ptrAny(),
  imageView: ptrAny(),
  imageLayout: i32(),
});

export const vkDescriptorBufferInfo = struct({
  buffer: ptrAny(),
  offset: u64(),
  range: u64(),
});

export const vkWriteDescriptorSet = struct({
  sType: i32(),
  pNext: ptrAny(),
  dstSet: ptrAny(),
  dstBinding: u32(),
  dstArrayElement: u32(),
  descriptorCount: u32(),
  descriptorType: i32(),
  pImageInfo: ptrAny(),
  pBufferInfo: ptrAny(),
  pTexelBufferView: ptrAny(),
});

export const vkCopyDescriptorSet = struct({
  sType: i32(),
  pNext: ptrAny(),
  srcSet: ptrAny(),
  srcBinding: u32(),
  srcArrayElement: u32(),
  dstSet: ptrAny(),
  dstBinding: u32(),
  dstArrayElement: u32(),
  descriptorCount: u32(),
});

// MARK: Shader Structures

export const vkShaderModuleCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  codeSize: u64(),
  pCode: ptrAny(),
});

export const vkPipelineLayoutCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  setLayoutCount: u32(),
  pSetLayouts: ptrAny(),
  pushConstantRangeCount: u32(),
  pPushConstantRanges: ptrAny(),
});

// MARK: Sampler Structures

export const vkSamplerCreateInfo = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  magFilter: i32(),
  minFilter: i32(),
  mipmapMode: i32(),
  addressModeU: i32(),
  addressModeV: i32(),
  addressModeW: i32(),
  mipLodBias: f32(),
  anisotropyEnable: u32(),
  maxAnisotropy: f32(),
  compareEnable: u32(),
  compareOp: i32(),
  minLod: f32(),
  maxLod: f32(),
  borderColor: i32(),
  unnormalizedCoordinates: u32(),
});

// MARK: Extension Structures - EXT_debug_utils

export const vkDebugUtilsMessengerCreateInfoEXT = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  messageSeverity: u32(),
  messageType: u32(),
  pfnUserCallback: ptrAny(),
  pUserData: ptrAny(),
});

export const vkDebugUtilsMessengerCallbackDataEXT = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  pMessageIdName: string(),
  messageIdNumber: i32(),
  pMessage: string(),
  queueLabelCount: u32(),
  pQueueLabels: ptrAny(),
  cmdBufLabelCount: u32(),
  pCmdBufLabels: ptrAny(),
  objectCount: u32(),
  pObjects: ptrAny(),
});
