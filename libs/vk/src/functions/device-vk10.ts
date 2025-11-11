import type { FFIFunction } from 'bun:ffi';

// MARK: Device Functions (Vulkan 1.0)

/**
 * Create a new device instance
 *
 * C ref: `VkResult vkCreateDevice(
 *   VkPhysicalDevice physicalDevice,
 *   const VkDeviceCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkDevice* pDevice)`
 */
export const vkCreateDevice = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pDevice: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a logical device
 *
 * C ref: `void vkDestroyDevice(
 *   VkDevice device,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyDevice = {
  args: ['ptr', 'ptr'] as [device: 'ptr', pAllocator: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get a queue handle from a device
 *
 * C ref: `void vkGetDeviceQueue(
 *   VkDevice device,
 *   uint32_t queueFamilyIndex,
 *   uint32_t queueIndex,
 *   VkQueue* pQueue)`
 */
export const vkGetDeviceQueue = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    device: 'ptr',
    queueFamilyIndex: 'u32',
    queueIndex: 'u32',
    pQueue: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submits a sequence of semaphores or command buffers to a queue
 *
 * C ref: `VkResult vkQueueSubmit(
 *   VkQueue queue,
 *   uint32_t submitCount,
 *   const VkSubmitInfo* pSubmits,
 *   VkFence fence)`
 */
export const vkQueueSubmit = {
  args: ['ptr', 'u32', 'ptr', 'u64'] as [
    queue: 'ptr',
    submitCount: 'u32',
    pSubmits: 'ptr',
    fence: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for a queue to become idle
 *
 * C ref: `VkResult vkQueueWaitIdle(
 *   VkQueue queue)`
 */
export const vkQueueWaitIdle = {
  args: ['ptr'] as [queue: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for a device to become idle
 *
 * C ref: `VkResult vkDeviceWaitIdle(
 *   VkDevice device)`
 */
export const vkDeviceWaitIdle = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Return a function pointer for a command
 *
 * C ref: `PFN_vkVoidFunction vkGetDeviceProcAddr(
 *   VkDevice device,
 *   const char* pName)`
 */
export const vkGetDeviceProcAddr = {
  args: ['ptr', 'cstring'] as [device: 'ptr', pName: 'cstring'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// MARK: Memory Management

/**
 * Allocate device memory
 *
 * C ref: `VkResult vkAllocateMemory(
 *   VkDevice device,
 *   const VkMemoryAllocateInfo* pAllocateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkDeviceMemory* pMemory)`
 */
export const vkAllocateMemory = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pAllocateInfo: 'ptr',
    pAllocator: 'ptr',
    pMemory: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Free device memory
 *
 * C ref: `void vkFreeMemory(
 *   VkDevice device,
 *   VkDeviceMemory memory,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkFreeMemory = {
  args: ['ptr', 'u64', 'ptr'] as [
    device: 'ptr',
    memory: 'u64',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Map a memory object into application address space
 *
 * C ref: `VkResult vkMapMemory(
 *   VkDevice device,
 *   VkDeviceMemory memory,
 *   VkDeviceSize offset,
 *   VkDeviceSize size,
 *   VkMemoryMapFlags flags,
 *   void** ppData)`
 */
export const vkMapMemory = {
  args: ['ptr', 'u64', 'u64', 'u64', 'u32', 'ptr'] as [
    device: 'ptr',
    memory: 'u64',
    offset: 'u64',
    size: 'u64',
    flags: 'u32',
    ppData: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Unmap a previously mapped memory object
 *
 * C ref: `void vkUnmapMemory(
 *   VkDevice device,
 *   VkDeviceMemory memory)`
 */
export const vkUnmapMemory = {
  args: ['ptr', 'u64'] as [device: 'ptr', memory: 'u64'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Flush mapped memory ranges
 *
 * C ref: `VkResult vkFlushMappedMemoryRanges(
 *   VkDevice device,
 *   uint32_t memoryRangeCount,
 *   const VkMappedMemoryRange* pMemoryRanges)`
 */
export const vkFlushMappedMemoryRanges = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    memoryRangeCount: 'u32',
    pMemoryRanges: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Invalidate ranges of mapped memory objects
 *
 * C ref: `VkResult vkInvalidateMappedMemoryRanges(
 *   VkDevice device,
 *   uint32_t memoryRangeCount,
 *   const VkMappedMemoryRange* pMemoryRanges)`
 */
export const vkInvalidateMappedMemoryRanges = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    memoryRangeCount: 'u32',
    pMemoryRanges: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query the current commitment for a VkDeviceMemory
 *
 * C ref: `void vkGetDeviceMemoryCommitment(
 *   VkDevice device,
 *   VkDeviceMemory memory,
 *   VkDeviceSize* pCommittedMemoryInBytes)`
 */
export const vkGetDeviceMemoryCommitment = {
  args: ['ptr', 'u64', 'ptr'] as [
    device: 'ptr',
    memory: 'u64',
    pCommittedMemoryInBytes: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// MARK: Synchronization

/**
 * Create a new fence object
 *
 * C ref: `VkResult vkCreateFence(
 *   VkDevice device,
 *   const VkFenceCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkFence* pFence)`
 */
export const vkCreateFence = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pFence: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a fence object
 *
 * C ref: `void vkDestroyFence(
 *   VkDevice device,
 *   VkFence fence,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyFence = {
  args: ['ptr', 'u64', 'ptr'] as [
    device: 'ptr',
    fence: 'u64',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resets one or more fence objects
 *
 * C ref: `VkResult vkResetFences(
 *   VkDevice device,
 *   uint32_t fenceCount,
 *   const VkFence* pFences)`
 */
export const vkResetFences = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    fenceCount: 'u32',
    pFences: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Return the status of a fence
 *
 * C ref: `VkResult vkGetFenceStatus(
 *   VkDevice device,
 *   VkFence fence)`
 */
export const vkGetFenceStatus = {
  args: ['ptr', 'u64'] as [device: 'ptr', fence: 'u64'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for one or more fences to become signaled
 *
 * C ref: `VkResult vkWaitForFences(
 *   VkDevice device,
 *   uint32_t fenceCount,
 *   const VkFence* pFences,
 *   VkBool32 waitAll,
 *   uint64_t timeout)`
 */
export const vkWaitForFences = {
  args: ['ptr', 'u32', 'ptr', 'u32', 'u64'] as [
    device: 'ptr',
    fenceCount: 'u32',
    pFences: 'ptr',
    waitAll: 'u32',
    timeout: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create a new queue semaphore object
 *
 * C ref: `VkResult vkCreateSemaphore(
 *   VkDevice device,
 *   const VkSemaphoreCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkSemaphore* pSemaphore)`
 */
export const vkCreateSemaphore = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pSemaphore: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a semaphore object
 *
 * C ref: `void vkDestroySemaphore(
 *   VkDevice device,
 *   VkSemaphore semaphore,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroySemaphore = {
  args: ['ptr', 'u64', 'ptr'] as [
    device: 'ptr',
    semaphore: 'u64',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create a new event object
 *
 * C ref: `VkResult vkCreateEvent(
 *   VkDevice device,
 *   const VkEventCreateInfo* pCreateInfo,
 *   const VkAllocationCallbacks* pAllocator,
 *   VkEvent* pEvent)`
 */
export const vkCreateEvent = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pCreateInfo: 'ptr',
    pAllocator: 'ptr',
    pEvent: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an event object
 *
 * C ref: `void vkDestroyEvent(
 *   VkDevice device,
 *   VkEvent event,
 *   const VkAllocationCallbacks* pAllocator)`
 */
export const vkDestroyEvent = {
  args: ['ptr', 'u64', 'ptr'] as [
    device: 'ptr',
    event: 'u64',
    pAllocator: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieve the status of an event object
 *
 * C ref: `VkResult vkGetEventStatus(
 *   VkDevice device,
 *   VkEvent event)`
 */
export const vkGetEventStatus = {
  args: ['ptr', 'u64'] as [device: 'ptr', event: 'u64'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Set an event to signaled state
 *
 * C ref: `VkResult vkSetEvent(
 *   VkDevice device,
 *   VkEvent event)`
 */
export const vkSetEvent = {
  args: ['ptr', 'u64'] as [device: 'ptr', event: 'u64'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reset an event to non-signaled state
 *
 * C ref: `VkResult vkResetEvent(
 *   VkDevice device,
 *   VkEvent event)`
 */
export const vkResetEvent = {
  args: ['ptr', 'u64'] as [device: 'ptr', event: 'u64'],
  returns: 'i32',
} as const satisfies FFIFunction;
