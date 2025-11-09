import type { FFIFunction } from 'bun:ffi';

// MARK: VK_KHR_surface Extension Functions

/**
 * Destroy a VkSurfaceKHR object
 *
 * C ref: `void vkDestroySurfaceKHR(
 *   VkInstance instance,
 *   VkSurfaceKHR surface,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroySurfaceKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    surface: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query if presentation is supported
 *
 * C ref: `VkResult vkGetPhysicalDeviceSurfaceSupportKHR(
 *   VkPhysicalDevice physicalDevice,
 *   uint32_t queueFamilyIndex,
 *   VkSurfaceKHR surface,
 *   VkBool32* pSupported)`
 */
export const vkGetPhysicalDeviceSurfaceSupportKHR = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    queueFamilyIndex: 'u32',
    surface: 'ptr',
    pSupported: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query surface capabilities
 *
 * C ref: `VkResult vkGetPhysicalDeviceSurfaceCapabilitiesKHR(
 *   VkPhysicalDevice physicalDevice,
 *   VkSurfaceKHR surface,
 *   VkSurfaceCapabilitiesKHR* pSurfaceCapabilities)`
 */
export const vkGetPhysicalDeviceSurfaceCapabilitiesKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    pSurfaceCapabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported surface formats
 *
 * C ref: `VkResult vkGetPhysicalDeviceSurfaceFormatsKHR(
 *   VkPhysicalDevice physicalDevice,
 *   VkSurfaceKHR surface,
 *   uint32_t* pSurfaceFormatCount,
 *   VkSurfaceFormatKHR* pSurfaceFormats)`
 */
export const vkGetPhysicalDeviceSurfaceFormatsKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    pSurfaceFormatCount: 'ptr',
    pSurfaceFormats: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported presentation modes
 *
 * C ref: `VkResult vkGetPhysicalDeviceSurfacePresentModesKHR(
 *   VkPhysicalDevice physicalDevice,
 *   VkSurfaceKHR surface,
 *   uint32_t* pPresentModeCount,
 *   VkPresentModeKHR* pPresentModes)`
 */
export const vkGetPhysicalDeviceSurfacePresentModesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    pPresentModeCount: 'ptr',
    pPresentModes: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// MARK: VK_KHR_swapchain Extension Functions

/**
 * Create a swapchain
 *
 * C ref: `VkResult vkCreateSwapchainKHR(
 *   VkDevice device,
 *   const VkSwapchainCreateInfoKHR* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkSwapchainKHR* pSwapchain)`
 */
export const vkCreateSwapchainKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pSwapchain: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a swapchain object
 *
 * C ref: `void vkDestroySwapchainKHR(
 *   VkDevice device,
 *   VkSwapchainKHR swapchain,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroySwapchainKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Obtain the array of presentable images associated with a swapchain
 *
 * C ref: `VkResult vkGetSwapchainImagesKHR(
 *   VkDevice device,
 *   VkSwapchainKHR swapchain,
 *   uint32_t* pSwapchainImageCount,
 *   VkImage* pSwapchainImages)`
 */
export const vkGetSwapchainImagesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    pSwapchainImageCount: 'ptr',
    pSwapchainImages: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Retrieve the index of the next available presentable image
 *
 * C ref: `VkResult vkAcquireNextImageKHR(
 *   VkDevice device,
 *   VkSwapchainKHR swapchain,
 *   uint64_t timeout,
 *   VkSemaphore semaphore,
 *   VkFence fence,
 *   uint32_t* pImageIndex)`
 */
export const vkAcquireNextImageKHR = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    timeout: 'u64',
    semaphore: 'ptr',
    fence: 'ptr',
    pImageIndex: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Queue an image for presentation
 *
 * C ref: `VkResult vkQueuePresentKHR(
 *   VkQueue queue,
 *   const VkPresentInfoKHR* pPresentInfo)`
 */
export const vkQueuePresentKHR = {
  args: ['ptr', 'ptr'] as [queue: 'ptr', pPresentInfo: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;
