import { array, i32, i8, ptrAny, struct, u32, u64 } from '@bunbox/struct';
import { VkStructureType13 } from '../enums';

// MARK: Vulkan 1.3 Structures

export const vkPhysicalDeviceVulkan13Features = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_VULKAN_1_3_FEATURES),
  pNext: ptrAny(),
  robustImageAccess: u32(),
  inlineUniformBlock: u32(),
  descriptorBindingInlineUniformBlockUpdateAfterBind: u32(),
  pipelineCreationCacheControl: u32(),
  privateData: u32(),
  shaderDemoteToHelperInvocation: u32(),
  shaderTerminateInvocation: u32(),
  subgroupSizeControl: u32(),
  computeFullSubgroups: u32(),
  synchronization2: u32(),
  textureCompressionASTC_HDR: u32(),
  shaderZeroInitializeWorkgroupMemory: u32(),
  dynamicRendering: u32(),
  shaderIntegerDotProduct: u32(),
  maintenance4: u32(),
});

export const vkPhysicalDeviceVulkan13Properties = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_VULKAN_1_3_PROPERTIES),
  pNext: ptrAny(),
  minSubgroupSize: u32(),
  maxSubgroupSize: u32(),
  maxComputeWorkgroupSubgroups: u32(),
  requiredSubgroupSizeStages: u32(),
  maxInlineUniformBlockSize: u32(),
  maxPerStageDescriptorInlineUniformBlocks: u32(),
  maxPerStageDescriptorUpdateAfterBindInlineUniformBlocks: u32(),
  maxDescriptorSetInlineUniformBlocks: u32(),
  maxDescriptorSetUpdateAfterBindInlineUniformBlocks: u32(),
  maxInlineUniformTotalSize: u32(),
  integerDotProduct8BitUnsignedAccelerated: u32(),
  integerDotProduct8BitSignedAccelerated: u32(),
  integerDotProduct8BitMixedSignednessAccelerated: u32(),
  integerDotProduct4x8BitPackedUnsignedAccelerated: u32(),
  integerDotProduct4x8BitPackedSignedAccelerated: u32(),
  integerDotProduct4x8BitPackedMixedSignednessAccelerated: u32(),
  integerDotProduct16BitUnsignedAccelerated: u32(),
  integerDotProduct16BitSignedAccelerated: u32(),
  integerDotProduct16BitMixedSignednessAccelerated: u32(),
  integerDotProduct32BitUnsignedAccelerated: u32(),
  integerDotProduct32BitSignedAccelerated: u32(),
  integerDotProduct32BitMixedSignednessAccelerated: u32(),
  integerDotProduct64BitUnsignedAccelerated: u32(),
  integerDotProduct64BitSignedAccelerated: u32(),
  integerDotProduct64BitMixedSignednessAccelerated: u32(),
  integerDotProductAccumulatingSaturating8BitUnsignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating8BitSignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating8BitMixedSignednessAccelerated: u32(),
  integerDotProductAccumulatingSaturating4x8BitPackedUnsignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating4x8BitPackedSignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating4x8BitPackedMixedSignednessAccelerated:
    u32(),
  integerDotProductAccumulatingSaturating16BitUnsignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating16BitSignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating16BitMixedSignednessAccelerated: u32(),
  integerDotProductAccumulatingSaturating32BitUnsignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating32BitSignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating32BitMixedSignednessAccelerated: u32(),
  integerDotProductAccumulatingSaturating64BitUnsignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating64BitSignedAccelerated: u32(),
  integerDotProductAccumulatingSaturating64BitMixedSignednessAccelerated: u32(),
  storageTexelBufferOffsetAlignmentBytes: u64(),
  storageTexelBufferOffsetSingleTexelAlignment: u32(),
  uniformTexelBufferOffsetAlignmentBytes: u64(),
  uniformTexelBufferOffsetSingleTexelAlignment: u32(),
  maxBufferSize: u64(),
});

export const vkPipelineCreationFeedbackCreateInfo = struct({
  sType: i32(VkStructureType13.PIPELINE_CREATION_FEEDBACK_CREATE_INFO),
  pNext: ptrAny(),
  pPipelineCreationFeedback: ptrAny(),
  pipelineStageCreationFeedbackCount: u32(),
  pPipelineStageCreationFeedbacks: ptrAny(),
});

export const vkPipelineCreationFeedback = struct({
  flags: u32(),
  duration: u64(),
});

export const vkPhysicalDeviceToolProperties = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_TOOL_PROPERTIES),
  pNext: ptrAny(),
  name: array(i8(), 256),
  version: array(i8(), 256),
  purposes: u32(),
  description: array(i8(), 256),
  layer: array(i8(), 256),
});

export const vkPhysicalDeviceShaderTerminateInvocationFeatures = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_SHADER_TERMINATE_INVOCATION_FEATURES,
  ),
  pNext: ptrAny(),
  shaderTerminateInvocation: u32(),
});

export const vkPhysicalDeviceShaderDemoteToHelperInvocationFeatures = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_SHADER_DEMOTE_TO_HELPER_INVOCATION_FEATURES,
  ),
  pNext: ptrAny(),
  shaderDemoteToHelperInvocation: u32(),
});

export const vkPhysicalDevicePrivateDataFeatures = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_PRIVATE_DATA_FEATURES),
  pNext: ptrAny(),
  privateData: u32(),
});

export const vkDevicePrivateDataCreateInfo = struct({
  sType: i32(VkStructureType13.DEVICE_PRIVATE_DATA_CREATE_INFO),
  pNext: ptrAny(),
  privateDataSlotRequestCount: u32(),
});

export const vkPrivateDataSlotCreateInfo = struct({
  sType: i32(VkStructureType13.PRIVATE_DATA_SLOT_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
});

export const vkPhysicalDevicePipelineCreationCacheControlFeatures = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_PIPELINE_CREATION_CACHE_CONTROL_FEATURES,
  ),
  pNext: ptrAny(),
  pipelineCreationCacheControl: u32(),
});

export const vkMemoryBarrier2 = struct({
  sType: i32(VkStructureType13.MEMORY_BARRIER_2),
  pNext: ptrAny(),
  srcStageMask: u64(),
  srcAccessMask: u64(),
  dstStageMask: u64(),
  dstAccessMask: u64(),
});

export const vkBufferMemoryBarrier2 = struct({
  sType: i32(VkStructureType13.BUFFER_MEMORY_BARRIER_2),
  pNext: ptrAny(),
  srcStageMask: u64(),
  srcAccessMask: u64(),
  dstStageMask: u64(),
  dstAccessMask: u64(),
  srcQueueFamilyIndex: u32(),
  dstQueueFamilyIndex: u32(),
  buffer: u64(),
  offset: u64(),
  size: u64(),
});

export const vkImageMemoryBarrier2 = struct({
  sType: i32(VkStructureType13.IMAGE_MEMORY_BARRIER_2),
  pNext: ptrAny(),
  srcStageMask: u64(),
  srcAccessMask: u64(),
  dstStageMask: u64(),
  dstAccessMask: u64(),
  oldLayout: i32(),
  newLayout: i32(),
  srcQueueFamilyIndex: u32(),
  dstQueueFamilyIndex: u32(),
  image: u64(),
  subresourceRange: struct({
    aspectMask: u32(),
    baseMipLevel: u32(),
    levelCount: u32(),
    baseArrayLayer: u32(),
    layerCount: u32(),
  }),
});

export const vkDependencyInfo = struct({
  sType: i32(VkStructureType13.DEPENDENCY_INFO),
  pNext: ptrAny(),
  dependencyFlags: u32(),
  memoryBarrierCount: u32(),
  pMemoryBarriers: ptrAny(),
  bufferMemoryBarrierCount: u32(),
  pBufferMemoryBarriers: ptrAny(),
  imageMemoryBarrierCount: u32(),
  pImageMemoryBarriers: ptrAny(),
});

export const vkSemaphoreSubmitInfo = struct({
  sType: i32(VkStructureType13.SEMAPHORE_SUBMIT_INFO),
  pNext: ptrAny(),
  semaphore: ptrAny(),
  value: u64(),
  stageMask: u64(),
  deviceIndex: u32(),
});

export const vkCommandBufferSubmitInfo = struct({
  sType: i32(VkStructureType13.COMMAND_BUFFER_SUBMIT_INFO),
  pNext: ptrAny(),
  commandBuffer: ptrAny(),
  deviceMask: u32(),
});

export const vkSubmitInfo2 = struct({
  sType: i32(VkStructureType13.SUBMIT_INFO_2),
  pNext: ptrAny(),
  flags: u32(),
  waitSemaphoreInfoCount: u32(),
  pWaitSemaphoreInfos: ptrAny(),
  commandBufferInfoCount: u32(),
  pCommandBufferInfos: ptrAny(),
  signalSemaphoreInfoCount: u32(),
  pSignalSemaphoreInfos: ptrAny(),
});

export const vkPhysicalDeviceSynchronization2Features = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_SYNCHRONIZATION_2_FEATURES),
  pNext: ptrAny(),
  synchronization2: u32(),
});

export const vkPhysicalDeviceZeroInitializeWorkgroupMemoryFeatures = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_ZERO_INITIALIZE_WORKGROUP_MEMORY_FEATURES,
  ),
  pNext: ptrAny(),
  shaderZeroInitializeWorkgroupMemory: u32(),
});

export const vkPhysicalDeviceImageRobustnessFeatures = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_IMAGE_ROBUSTNESS_FEATURES),
  pNext: ptrAny(),
  robustImageAccess: u32(),
});

export const vkPhysicalDeviceSubgroupSizeControlFeatures = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_SUBGROUP_SIZE_CONTROL_FEATURES),
  pNext: ptrAny(),
  subgroupSizeControl: u32(),
  computeFullSubgroups: u32(),
});

export const vkPhysicalDeviceSubgroupSizeControlProperties = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_SUBGROUP_SIZE_CONTROL_PROPERTIES,
  ),
  pNext: ptrAny(),
  minSubgroupSize: u32(),
  maxSubgroupSize: u32(),
  maxComputeWorkgroupSubgroups: u32(),
  requiredSubgroupSizeStages: u32(),
});

export const vkPipelineShaderStageRequiredSubgroupSizeCreateInfo = struct({
  sType: i32(
    VkStructureType13.PIPELINE_SHADER_STAGE_REQUIRED_SUBGROUP_SIZE_CREATE_INFO,
  ),
  pNext: ptrAny(),
  requiredSubgroupSize: u32(),
});

export const vkPhysicalDeviceInlineUniformBlockFeatures = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_INLINE_UNIFORM_BLOCK_FEATURES),
  pNext: ptrAny(),
  inlineUniformBlock: u32(),
  descriptorBindingInlineUniformBlockUpdateAfterBind: u32(),
});

export const vkPhysicalDeviceInlineUniformBlockProperties = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_INLINE_UNIFORM_BLOCK_PROPERTIES),
  pNext: ptrAny(),
  maxInlineUniformBlockSize: u32(),
  maxPerStageDescriptorInlineUniformBlocks: u32(),
  maxPerStageDescriptorUpdateAfterBindInlineUniformBlocks: u32(),
  maxDescriptorSetInlineUniformBlocks: u32(),
  maxDescriptorSetUpdateAfterBindInlineUniformBlocks: u32(),
});

export const vkWriteDescriptorSetInlineUniformBlock = struct({
  sType: i32(VkStructureType13.WRITE_DESCRIPTOR_SET_INLINE_UNIFORM_BLOCK),
  pNext: ptrAny(),
  dataSize: u32(),
  pData: ptrAny(),
});

export const vkDescriptorPoolInlineUniformBlockCreateInfo = struct({
  sType: i32(
    VkStructureType13.DESCRIPTOR_POOL_INLINE_UNIFORM_BLOCK_CREATE_INFO,
  ),
  pNext: ptrAny(),
  maxInlineUniformBlockBindings: u32(),
});

export const vkPhysicalDeviceTextureCompressionASTCHDRFeatures = struct({
  sType: i32(
    VkStructureType13.PHYSICAL_DEVICE_TEXTURE_COMPRESSION_ASTC_HDR_FEATURES,
  ),
  pNext: ptrAny(),
  textureCompressionASTC_HDR: u32(),
});

export const vkRenderingAttachmentInfo = struct({
  sType: i32(VkStructureType13.RENDERING_ATTACHMENT_INFO),
  pNext: ptrAny(),
  imageView: ptrAny(),
  imageLayout: i32(),
  resolveMode: i32(),
  resolveImageView: ptrAny(),
  resolveImageLayout: i32(),
  loadOp: i32(),
  storeOp: i32(),
  clearValue: struct({
    color: struct({
      float32: array(u32(), 4),
    }),
  }),
});

export const vkRenderingInfo = struct({
  sType: i32(VkStructureType13.RENDERING_INFO),
  pNext: ptrAny(),
  flags: u32(),
  renderArea: struct({
    offset: struct({
      x: i32(),
      y: i32(),
    }),
    extent: struct({
      width: u32(),
      height: u32(),
    }),
  }),
  layerCount: u32(),
  viewMask: u32(),
  colorAttachmentCount: u32(),
  pColorAttachments: ptrAny(),
  pDepthAttachment: ptrAny(),
  pStencilAttachment: ptrAny(),
});

export const vkPipelineRenderingCreateInfo = struct({
  sType: i32(VkStructureType13.PIPELINE_RENDERING_CREATE_INFO),
  pNext: ptrAny(),
  viewMask: u32(),
  colorAttachmentCount: u32(),
  pColorAttachmentFormats: ptrAny(),
  depthAttachmentFormat: i32(),
  stencilAttachmentFormat: i32(),
});

export const vkPhysicalDeviceDynamicRenderingFeatures = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_DYNAMIC_RENDERING_FEATURES),
  pNext: ptrAny(),
  dynamicRendering: u32(),
});

export const vkCommandBufferInheritanceRenderingInfo = struct({
  sType: i32(VkStructureType13.COMMAND_BUFFER_INHERITANCE_RENDERING_INFO),
  pNext: ptrAny(),
  flags: u32(),
  viewMask: u32(),
  colorAttachmentCount: u32(),
  pColorAttachmentFormats: ptrAny(),
  depthAttachmentFormat: i32(),
  stencilAttachmentFormat: i32(),
  rasterizationSamples: i32(),
});

export const vkPhysicalDeviceMaintenance4Features = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_MAINTENANCE_4_FEATURES),
  pNext: ptrAny(),
  maintenance4: u32(),
});

export const vkPhysicalDeviceMaintenance4Properties = struct({
  sType: i32(VkStructureType13.PHYSICAL_DEVICE_MAINTENANCE_4_PROPERTIES),
  pNext: ptrAny(),
  maxBufferSize: u64(),
});

export const vkDeviceBufferMemoryRequirements = struct({
  sType: i32(VkStructureType13.DEVICE_BUFFER_MEMORY_REQUIREMENTS),
  pNext: ptrAny(),
  pCreateInfo: ptrAny(),
});

export const vkDeviceImageMemoryRequirements = struct({
  sType: i32(VkStructureType13.DEVICE_IMAGE_MEMORY_REQUIREMENTS),
  pNext: ptrAny(),
  pCreateInfo: ptrAny(),
  planeAspect: i32(),
});

export const vkFormatProperties3 = struct({
  sType: i32(VkStructureType13.FORMAT_PROPERTIES_3),
  pNext: ptrAny(),
  linearTilingFeatures: u64(),
  optimalTilingFeatures: u64(),
  bufferFeatures: u64(),
});
