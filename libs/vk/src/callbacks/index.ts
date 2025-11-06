import type { FFIFunction } from 'bun:ffi';

// Vulkan MARK: Allocation Callbacks

/**
 * Application-defined memory allocation function
 *
 * C ref: `typedef void* (VKAPI_PTR *PFN_vkAllocationFunction)(
 *   void* pUserData,
 *   size_t size,
 *   size_t alignment,
 *   VkSystemAllocationScope allocationScope)`
 */
export const vkAllocationCallback = {
  args: ['ptr', 'u64', 'u64', 'i32'] as [
    pUserData: 'ptr',
    size: 'u64',
    alignment: 'u64',
    allocationScope: 'i32',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Application-defined memory reallocation function
 *
 * C ref: `typedef void* (VKAPI_PTR *PFN_vkReallocationFunction)(
 *   void* pUserData,
 *   void* pOriginal,
 *   size_t size,
 *   size_t alignment,
 *   VkSystemAllocationScope allocationScope)`
 */
export const vkReallocationCallback = {
  args: ['ptr', 'ptr', 'u64', 'u64', 'i32'] as [
    pUserData: 'ptr',
    pOriginal: 'ptr',
    size: 'u64',
    alignment: 'u64',
    allocationScope: 'i32',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Application-defined memory free function
 *
 * C ref: `typedef void (VKAPI_PTR *PFN_vkFreeFunction)(
 *   void* pUserData,
 *   void* pMemory)`
 */
export const vkFreeCallback = {
  args: ['ptr', 'ptr'] as [pUserData: 'ptr', pMemory: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Application-defined memory allocation notification function
 *
 * C ref: `typedef void (VKAPI_PTR *PFN_vkInternalAllocationNotification)(
 *   void* pUserData,
 *   size_t size,
 *   VkInternalAllocationType allocationType,
 *   VkSystemAllocationScope allocationScope)`
 */
export const vkInternalAllocationNotificationCallback = {
  args: ['ptr', 'u64', 'i32', 'i32'] as [
    pUserData: 'ptr',
    size: 'u64',
    allocationType: 'i32',
    allocationScope: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Application-defined memory free notification function
 *
 * C ref: `typedef void (VKAPI_PTR *PFN_vkInternalFreeNotification)(
 *   void* pUserData,
 *   size_t size,
 *   VkInternalAllocationType allocationType,
 *   VkSystemAllocationScope allocationScope)`
 */
export const vkInternalFreeNotificationCallback = {
  args: ['ptr', 'u64', 'i32', 'i32'] as [
    pUserData: 'ptr',
    size: 'u64',
    allocationType: 'i32',
    allocationScope: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Vulkan MARK: Debug Callbacks

/**
 * Application-defined debug report callback function
 *
 * C ref: `typedef VkBool32 (VKAPI_PTR *PFN_vkDebugReportCallbackEXT)(
 *   VkDebugReportFlagsEXT flags,
 *   VkDebugReportObjectTypeEXT objectType,
 *   uint64_t object,
 *   size_t location,
 *   int32_t messageCode,
 *   const char* pLayerPrefix,
 *   const char* pMessage,
 *   void* pUserData)`
 */
export const vkDebugReportCallback = {
  args: [
    'i32',
    'i32',
    'u64',
    'u64',
    'i32',
    'cstring',
    'cstring',
    'ptr',
  ] as [
    flags: 'i32',
    objectType: 'i32',
    object: 'u64',
    location: 'u64',
    messageCode: 'i32',
    pLayerPrefix: 'cstring',
    pMessage: 'cstring',
    pUserData: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Application-defined debug messenger callback function
 *
 * C ref: `typedef VkBool32 (VKAPI_PTR *PFN_vkDebugUtilsMessengerCallbackEXT)(
 *   VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
 *   VkDebugUtilsMessageTypeFlagsEXT messageTypes,
 *   const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData,
 *   void* pUserData)`
 */
export const vkDebugUtilsMessengerCallback = {
  args: ['i32', 'i32', 'ptr', 'ptr'] as [
    messageSeverity: 'i32',
    messageTypes: 'i32',
    pCallbackData: 'ptr',
    pUserData: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Vulkan MARK: Device Memory Report Callback

/**
 * Application-defined device memory report callback function
 *
 * C ref: `typedef void (VKAPI_PTR *PFN_vkDeviceMemoryReportCallbackEXT)(
 *   const VkDeviceMemoryReportCallbackDataEXT* pCallbackData,
 *   void* pUserData)`
 */
export const vkDeviceMemoryReportCallback = {
  args: ['ptr', 'ptr'] as [pCallbackData: 'ptr', pUserData: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// Vulkan MARK: Function Pointers

/**
 * Application-defined function pointer
 *
 * C ref: `typedef void (VKAPI_PTR *PFN_vkVoidFunction)(void)`
 */
export const vkVoidFunctionCallback = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;
