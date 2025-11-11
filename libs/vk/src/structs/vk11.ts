import { i32, ptrAny, struct, u32, u64 } from '@bunbox/struct';
import { VkStructureType11 } from '../enums';
import {
  vkPhysicalDeviceFeatures,
  vkPhysicalDeviceMemoryProperties,
  vkPhysicalDeviceProperties,
  vkQueueFamilyProperties,
} from './vk10';

// MARK: Vulkan 1.1 Structures

export const vkPhysicalDeviceFeatures2 = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_FEATURES_2),
  pNext: ptrAny(),
  features: vkPhysicalDeviceFeatures,
});

export const vkPhysicalDeviceProperties2 = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_PROPERTIES_2),
  pNext: ptrAny(),
  properties: vkPhysicalDeviceProperties,
});

export const vkFormatProperties2 = struct({
  sType: i32(VkStructureType11.FORMAT_PROPERTIES_2),
  pNext: ptrAny(),
  formatProperties: struct({
    linearTilingFeatures: u32(),
    optimalTilingFeatures: u32(),
    bufferFeatures: u32(),
  }),
});

export const vkImageFormatProperties2 = struct({
  sType: i32(VkStructureType11.IMAGE_FORMAT_PROPERTIES_2),
  pNext: ptrAny(),
  imageFormatProperties: struct({
    maxExtent: struct({
      width: u32(),
      height: u32(),
      depth: u32(),
    }),
    maxMipLevels: u32(),
    maxArrayLayers: u32(),
    sampleCounts: u32(),
    maxResourceSize: u64(),
  }),
});

export const vkPhysicalDeviceImageFormatInfo2 = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_IMAGE_FORMAT_INFO_2),
  pNext: ptrAny(),
  format: i32(),
  type: i32(),
  tiling: i32(),
  usage: u32(),
  flags: u32(),
});

export const vkQueueFamilyProperties2 = struct({
  sType: i32(VkStructureType11.QUEUE_FAMILY_PROPERTIES_2),
  pNext: ptrAny(),
  queueFamilyProperties: vkQueueFamilyProperties,
});

export const vkPhysicalDeviceMemoryProperties2 = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_MEMORY_PROPERTIES_2),
  pNext: ptrAny(),
  memoryProperties: vkPhysicalDeviceMemoryProperties,
});

export const vkBindBufferMemoryInfo = struct({
  sType: i32(VkStructureType11.BIND_BUFFER_MEMORY_INFO),
  pNext: ptrAny(),
  buffer: u64(),
  memory: u64(),
  memoryOffset: u64(),
});

export const vkBindImageMemoryInfo = struct({
  sType: i32(VkStructureType11.BIND_IMAGE_MEMORY_INFO),
  pNext: ptrAny(),
  image: u64(),
  memory: u64(),
  memoryOffset: u64(),
});

export const vkPhysicalDevice16BitStorageFeatures = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_16BIT_STORAGE_FEATURES),
  pNext: ptrAny(),
  storageBuffer16BitAccess: u32(),
  uniformAndStorageBuffer16BitAccess: u32(),
  storagePushConstant16: u32(),
  storageInputOutput16: u32(),
});

export const vkMemoryDedicatedRequirements = struct({
  sType: i32(VkStructureType11.MEMORY_DEDICATED_REQUIREMENTS),
  pNext: ptrAny(),
  prefersDedicatedAllocation: u32(),
  requiresDedicatedAllocation: u32(),
});

export const vkMemoryDedicatedAllocateInfo = struct({
  sType: i32(VkStructureType11.MEMORY_DEDICATED_ALLOCATE_INFO),
  pNext: ptrAny(),
  image: u64(),
  buffer: u64(),
});

export const vkMemoryAllocateFlagsInfo = struct({
  sType: i32(VkStructureType11.MEMORY_ALLOCATE_FLAGS_INFO),
  pNext: ptrAny(),
  flags: u32(),
  deviceMask: u32(),
});

export const vkDeviceGroupDeviceCreateInfo = struct({
  sType: i32(VkStructureType11.DEVICE_GROUP_DEVICE_CREATE_INFO),
  pNext: ptrAny(),
  physicalDeviceCount: u32(),
  pPhysicalDevices: ptrAny(),
});

export const vkBufferMemoryRequirementsInfo2 = struct({
  sType: i32(VkStructureType11.BUFFER_MEMORY_REQUIREMENTS_INFO_2),
  pNext: ptrAny(),
  buffer: u64(),
});

export const vkImageMemoryRequirementsInfo2 = struct({
  sType: i32(VkStructureType11.IMAGE_MEMORY_REQUIREMENTS_INFO_2),
  pNext: ptrAny(),
  image: u64(),
});

export const vkMemoryRequirements2 = struct({
  sType: i32(VkStructureType11.MEMORY_REQUIREMENTS_2),
  pNext: ptrAny(),
  memoryRequirements: struct({
    size: u64(),
    alignment: u64(),
    memoryTypeBits: u32(),
  }),
});

export const vkSamplerYcbcrConversionCreateInfo = struct({
  sType: i32(VkStructureType11.SAMPLER_YCBCR_CONVERSION_CREATE_INFO),
  pNext: ptrAny(),
  format: i32(),
  ycbcrModel: i32(),
  ycbcrRange: i32(),
  components: struct({
    r: i32(),
    g: i32(),
    b: i32(),
    a: i32(),
  }),
  xChromaOffset: i32(),
  yChromaOffset: i32(),
  chromaFilter: i32(),
  forceExplicitReconstruction: u32(),
});

export const vkSamplerYcbcrConversionInfo = struct({
  sType: i32(VkStructureType11.SAMPLER_YCBCR_CONVERSION_INFO),
  pNext: ptrAny(),
  conversion: u64(),
});

export const vkDescriptorUpdateTemplateCreateInfo = struct({
  sType: i32(VkStructureType11.DESCRIPTOR_UPDATE_TEMPLATE_CREATE_INFO),
  pNext: ptrAny(),
  flags: u32(),
  descriptorUpdateEntryCount: u32(),
  pDescriptorUpdateEntries: ptrAny(),
  templateType: i32(),
  descriptorSetLayout: u64(),
  pipelineBindPoint: i32(),
  pipelineLayout: u64(),
  set: u32(),
});

export const vkExternalMemoryProperties = struct({
  externalMemoryFeatures: u32(),
  exportFromImportedHandleTypes: u32(),
  compatibleHandleTypes: u32(),
});

export const vkPhysicalDeviceExternalImageFormatInfo = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_EXTERNAL_IMAGE_FORMAT_INFO),
  pNext: ptrAny(),
  handleType: u32(),
});

export const vkExternalImageFormatProperties = struct({
  sType: i32(VkStructureType11.EXTERNAL_IMAGE_FORMAT_PROPERTIES),
  pNext: ptrAny(),
  externalMemoryProperties: vkExternalMemoryProperties,
});

export const vkPhysicalDeviceExternalBufferInfo = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_EXTERNAL_BUFFER_INFO),
  pNext: ptrAny(),
  flags: u32(),
  usage: u32(),
  handleType: u32(),
});

export const vkExternalBufferProperties = struct({
  sType: i32(VkStructureType11.EXTERNAL_BUFFER_PROPERTIES),
  pNext: ptrAny(),
  externalMemoryProperties: vkExternalMemoryProperties,
});

export const vkPhysicalDeviceIDProperties = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_ID_PROPERTIES),
  pNext: ptrAny(),
  deviceUUID: ptrAny(),
  driverUUID: ptrAny(),
  deviceLUID: ptrAny(),
  deviceNodeMask: u32(),
  deviceLUIDValid: u32(),
});

export const vkExternalMemoryImageCreateInfo = struct({
  sType: i32(VkStructureType11.EXTERNAL_MEMORY_IMAGE_CREATE_INFO),
  pNext: ptrAny(),
  handleTypes: u32(),
});

export const vkExternalMemoryBufferCreateInfo = struct({
  sType: i32(VkStructureType11.EXTERNAL_MEMORY_BUFFER_CREATE_INFO),
  pNext: ptrAny(),
  handleTypes: u32(),
});

export const vkExportMemoryAllocateInfo = struct({
  sType: i32(VkStructureType11.EXPORT_MEMORY_ALLOCATE_INFO),
  pNext: ptrAny(),
  handleTypes: u32(),
});

export const vkPhysicalDeviceMultiviewFeatures = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_MULTIVIEW_FEATURES),
  pNext: ptrAny(),
  multiview: u32(),
  multiviewGeometryShader: u32(),
  multiviewTessellationShader: u32(),
});

export const vkPhysicalDeviceMultiviewProperties = struct({
  sType: i32(VkStructureType11.PHYSICAL_DEVICE_MULTIVIEW_PROPERTIES),
  pNext: ptrAny(),
  maxMultiviewViewCount: u32(),
  maxMultiviewInstanceIndex: u32(),
});

export const vkRenderPassMultiviewCreateInfo = struct({
  sType: i32(VkStructureType11.RENDER_PASS_MULTIVIEW_CREATE_INFO),
  pNext: ptrAny(),
  subpassCount: u32(),
  pViewMasks: ptrAny(),
  dependencyCount: u32(),
  pViewOffsets: ptrAny(),
  correlationMaskCount: u32(),
  pCorrelationMasks: ptrAny(),
});
