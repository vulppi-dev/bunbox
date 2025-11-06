import type { FFIFunction } from 'bun:ffi';

// MARK: Instance Functions (Vulkan 1.0)

/**
 * Create a new Vulkan instance
 *
 * C ref: `VkResult vkCreateInstance(
 *   const VkInstanceCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkInstance* pInstance)`
 */
export const vkCreateInstance = {
  args: ['ptr', 'ptr', 'ptr'] as [
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pInstance: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an instance of Vulkan
 *
 * C ref: `void vkDestroyInstance(
 *   VkInstance instance,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyInstance = {
  args: ['ptr', 'ptr'] as [instance: 'ptr', pAllocator: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Enumerates the physical devices accessible to a Vulkan instance
 *
 * C ref: `VkResult vkEnumeratePhysicalDevices(
 *   VkInstance instance,
 *   uint32_t* pPhysicalDeviceCount,
 *   VkPhysicalDevice* pPhysicalDevices)`
 */
export const vkEnumeratePhysicalDevices = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    pPhysicalDeviceCount: 'ptr',
    pPhysicalDevices: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns properties of a physical device
 *
 * C ref: `void vkGetPhysicalDeviceProperties(
 *   VkPhysicalDevice physicalDevice,
 *   VkPhysicalDeviceProperties* pProperties)`
 */
export const vkGetPhysicalDeviceProperties = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', pProperties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports capabilities of a physical device
 *
 * C ref: `void vkGetPhysicalDeviceFeatures(
 *   VkPhysicalDevice physicalDevice,
 *   VkPhysicalDeviceFeatures* pFeatures)`
 */
export const vkGetPhysicalDeviceFeatures = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', pFeatures: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports properties of the queues of the specified physical device
 *
 * C ref: `void vkGetPhysicalDeviceQueueFamilyProperties(
 *   VkPhysicalDevice physicalDevice,
 *   uint32_t* pQueueFamilyPropertyCount,
 *   VkQueueFamilyProperties* pQueueFamilyProperties)`
 */
export const vkGetPhysicalDeviceQueueFamilyProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    pQueueFamilyPropertyCount: 'ptr',
    pQueueFamilyProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports memory information for the specified physical device
 *
 * C ref: `void vkGetPhysicalDeviceMemoryProperties(
 *   VkPhysicalDevice physicalDevice,
 *   VkPhysicalDeviceMemoryProperties* pMemoryProperties)`
 */
export const vkGetPhysicalDeviceMemoryProperties = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', pMemoryProperties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of extension properties
 *
 * C ref: `VkResult vkEnumerateDeviceExtensionProperties(
 *   VkPhysicalDevice physicalDevice,
 *   const char* pLayerName,
 *   uint32_t* pPropertyCount,
 *   VkExtensionProperties* pProperties)`
 */
export const vkEnumerateDeviceExtensionProperties = {
  args: ['ptr', 'cstring', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    pLayerName: 'cstring',
    pPropertyCount: 'ptr',
    pProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of device layer properties
 *
 * C ref: `VkResult vkEnumerateDeviceLayerProperties(
 *   VkPhysicalDevice physicalDevice,
 *   uint32_t* pPropertyCount,
 *   VkLayerProperties* pProperties)`
 */
export const vkEnumerateDeviceLayerProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    pPropertyCount: 'ptr',
    pProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Lists physical device's format capabilities
 *
 * C ref: `void vkGetPhysicalDeviceFormatProperties(
 *   VkPhysicalDevice physicalDevice,
 *   VkFormat format,
 *   VkFormatProperties* pFormatProperties)`
 */
export const vkGetPhysicalDeviceFormatProperties = {
  args: ['ptr', 'i32', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    pFormatProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Lists physical device's image format capabilities
 *
 * C ref: `VkResult vkGetPhysicalDeviceImageFormatProperties(
 *   VkPhysicalDevice physicalDevice,
 *   VkFormat format,
 *   VkImageType type,
 *   VkImageTiling tiling,
 *   VkImageUsageFlags usage,
 *   VkImageCreateFlags flags,
 *   VkImageFormatProperties* pImageFormatProperties)`
 */
export const vkGetPhysicalDeviceImageFormatProperties = {
  args: ['ptr', 'i32', 'i32', 'i32', 'u32', 'u32', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    type: 'i32',
    tiling: 'i32',
    usage: 'u32',
    flags: 'u32',
    pImageFormatProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported sparse memory features
 *
 * C ref: `void vkGetPhysicalDeviceSparseImageFormatProperties(
 *   VkPhysicalDevice physicalDevice,
 *   VkFormat format,
 *   VkImageType type,
 *   VkSampleCountFlagBits samples,
 *   VkImageUsageFlags usage,
 *   VkImageTiling tiling,
 *   uint32_t* pPropertyCount,
 *   VkSparseImageFormatProperties* pProperties)`
 */
export const vkGetPhysicalDeviceSparseImageFormatProperties = {
  args: ['ptr', 'i32', 'i32', 'i32', 'u32', 'i32', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    type: 'i32',
    samples: 'i32',
    usage: 'u32',
    tiling: 'i32',
    pPropertyCount: 'ptr',
    pProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;
