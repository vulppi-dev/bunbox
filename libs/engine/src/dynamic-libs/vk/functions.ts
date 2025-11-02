import type { FFIFunction } from 'bun:ffi';

// Instance functions
/**
 * Create a new Vulkan instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateInstance.html
 */
export const vkCreateInstance = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instanceCreateInfo: 'ptr',
    allocationCallbacks: 'ptr',
    instance: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an instance of Vulkan.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyInstance.html
 */
export const vkDestroyInstance = {
  args: ['ptr', 'ptr'] as [instance: 'ptr', allocationCallbacks: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Enumerates the physical devices accessible to a Vulkan instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumeratePhysicalDevices.html
 */
export const vkEnumeratePhysicalDevices = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    physicalDeviceCount: 'ptr',
    physicalDevices: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reports capabilities of a physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceFeatures.html
 */
export const vkGetPhysicalDeviceFeatures = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', features: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Lists physical device's format capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceFormatProperties.html
 */
export const vkGetPhysicalDeviceFormatProperties = {
  args: ['ptr', 'i32', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    formatProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Lists physical device's image format capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceImageFormatProperties.html
 */
export const vkGetPhysicalDeviceImageFormatProperties = {
  args: ['ptr', 'i32', 'i32', 'i32', 'i32', 'i32', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    type: 'i32',
    tiling: 'i32',
    usage: 'i32',
    flags: 'i32',
    imageFormatProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns properties of a physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceProperties.html
 */
export const vkGetPhysicalDeviceProperties = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', properties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports properties of the queues of the specified physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceQueueFamilyProperties.html
 */
export const vkGetPhysicalDeviceQueueFamilyProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    queueFamilyPropertyCount: 'ptr',
    queueFamilyProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports memory information for the specified physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceMemoryProperties.html
 */
export const vkGetPhysicalDeviceMemoryProperties = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', memoryProperties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Return a function pointer for a command.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetInstanceProcAddr.html
 */
export const vkGetInstanceProcAddr = {
  args: ['ptr', 'ptr'] as [instance: 'ptr', name: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Return a function pointer for a command.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceProcAddr.html
 */
export const vkGetDeviceProcAddr = {
  args: ['ptr', 'ptr'] as [device: 'ptr', name: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// Device functions
/**
 * Create a new device instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDevice.html
 */
export const vkCreateDevice = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    device: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a logical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyDevice.html
 */
export const vkDestroyDevice = {
  args: ['ptr', 'ptr'] as [device: 'ptr', allocationCallbacks: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of global extension properties.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumerateInstanceExtensionProperties.html
 */
export const vkEnumerateInstanceExtensionProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    layerName: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns properties of available physical device extensions.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumerateDeviceExtensionProperties.html
 */
export const vkEnumerateDeviceExtensionProperties = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    layerName: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of global layer properties.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumerateInstanceLayerProperties.html
 */
export const vkEnumerateInstanceLayerProperties = {
  args: ['ptr', 'ptr'] as [propertyCount: 'ptr', properties: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns properties of available layers.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumerateDeviceLayerProperties.html
 */
export const vkEnumerateDeviceLayerProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Get a queue handle from a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceQueue.html
 */
export const vkGetDeviceQueue = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    device: 'ptr',
    queueFamilyIndex: 'u32',
    queueIndex: 'u32',
    queue: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submits a sequence of semaphores or command buffers to a queue.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkQueueSubmit.html
 */
export const vkQueueSubmit = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    queue: 'ptr',
    submitCount: 'u32',
    submits: 'ptr',
    fence: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for a queue to become idle.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkQueueWaitIdle.html
 */
export const vkQueueWaitIdle = {
  args: ['ptr'] as [queue: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for a device to become idle.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDeviceWaitIdle.html
 */
export const vkDeviceWaitIdle = {
  args: ['ptr'] as [device: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

// Memory functions
/**
 * Allocate device memory.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkAllocateMemory.html
 */
export const vkAllocateMemory = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    allocateInfo: 'ptr',
    allocationCallbacks: 'ptr',
    memory: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Free device memory.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkFreeMemory.html
 */
export const vkFreeMemory = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    memory: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Map a memory object into application address space.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkMapMemory.html
 */
export const vkMapMemory = {
  args: ['ptr', 'ptr', 'u64', 'u64', 'u32', 'ptr'] as [
    device: 'ptr',
    memory: 'ptr',
    offset: 'u64',
    size: 'u64',
    flags: 'u32',
    data: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Unmap a previously mapped memory object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkUnmapMemory.html
 */
export const vkUnmapMemory = {
  args: ['ptr', 'ptr'] as [device: 'ptr', memory: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Flush mapped memory ranges from the host caches.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkFlushMappedMemoryRanges.html
 */
export const vkFlushMappedMemoryRanges = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    memoryRangeCount: 'u32',
    memoryRanges: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Invalidate ranges of mapped memory objects.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkInvalidateMappedMemoryRanges.html
 */
export const vkInvalidateMappedMemoryRanges = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    memoryRangeCount: 'u32',
    memoryRanges: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query the current commitment for a VkDeviceMemory.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceMemoryCommitment.html
 */
export const vkGetDeviceMemoryCommitment = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    memory: 'ptr',
    committedMemoryInBytes: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Buffer functions
/**
 * Bind device memory to a buffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkBindBufferMemory.html
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
 * Bind device memory to an image object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkBindImageMemory.html
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
 * Returns the memory requirements for a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetBufferMemoryRequirements.html
 */
export const vkGetBufferMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    buffer: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for specified Vulkan object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetImageMemoryRequirements.html
 */
export const vkGetImageMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query the memory requirements for a sparse image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetImageSparseMemoryRequirements.html
 */
export const vkGetImageSparseMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    sparseMemoryRequirementCount: 'ptr',
    sparseMemoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieve properties of an image format applied to sparse images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSparseImageFormatProperties.html
 */
export const vkGetPhysicalDeviceSparseImageFormatProperties = {
  args: ['ptr', 'i32', 'i32', 'i32', 'i32', 'i32', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    type: 'i32',
    samples: 'i32',
    usage: 'i32',
    tiling: 'i32',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind device memory to a sparse resource object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkQueueBindSparse.html
 */
export const vkQueueBindSparse = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    queue: 'ptr',
    bindInfoCount: 'u32',
    bindInfo: 'ptr',
    fence: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Fence functions
/**
 * Create a new fence object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateFence.html
 */
export const vkCreateFence = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    fence: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a fence object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyFence.html
 */
export const vkDestroyFence = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    fence: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resets one or more fence objects.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetFences.html
 */
export const vkResetFences = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    fenceCount: 'u32',
    fences: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Return the status of a fence.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetFenceStatus.html
 */
export const vkGetFenceStatus = {
  args: ['ptr', 'ptr'] as [device: 'ptr', fence: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for one or more fences to become signaled.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkWaitForFences.html
 */
export const vkWaitForFences = {
  args: ['ptr', 'u32', 'ptr', 'u32', 'u64'] as [
    device: 'ptr',
    fenceCount: 'u32',
    fences: 'ptr',
    waitAll: 'u32',
    timeout: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Semaphore functions
/**
 * Create a new queue semaphore object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateSemaphore.html
 */
export const vkCreateSemaphore = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    semaphore: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a semaphore object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroySemaphore.html
 */
export const vkDestroySemaphore = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    semaphore: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Event functions
/**
 * Create a new event object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateEvent.html
 */
export const vkCreateEvent = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    event: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an event object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyEvent.html
 */
export const vkDestroyEvent = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    event: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieve the status of an event object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetEventStatus.html
 */
export const vkGetEventStatus = {
  args: ['ptr', 'ptr'] as [device: 'ptr', event: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Set an event to signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkSetEvent.html
 */
export const vkSetEvent = {
  args: ['ptr', 'ptr'] as [device: 'ptr', event: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reset an event to non-signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetEvent.html
 */
export const vkResetEvent = {
  args: ['ptr', 'ptr'] as [device: 'ptr', event: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

// Query pool functions
/**
 * Create a new query pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateQueryPool.html
 */
export const vkCreateQueryPool = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    queryPool: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a query pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyQueryPool.html
 */
export const vkDestroyQueryPool = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    queryPool: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy results of queries in a query pool to a host memory region.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetQueryPoolResults.html
 */
export const vkGetQueryPoolResults = {
  args: ['ptr', 'ptr', 'u32', 'u32', 'u64', 'ptr', 'u64', 'i32'] as [
    device: 'ptr',
    queryPool: 'ptr',
    firstQuery: 'u32',
    queryCount: 'u32',
    dataSize: 'u64',
    data: 'ptr',
    stride: 'u64',
    flags: 'i32',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Buffer functions
/**
 * Create a new buffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateBuffer.html
 */
export const vkCreateBuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    buffer: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a buffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyBuffer.html
 */
export const vkDestroyBuffer = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    buffer: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Buffer view functions
/**
 * Create a new buffer view object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateBufferView.html
 */
export const vkCreateBufferView = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    view: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a buffer view object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyBufferView.html
 */
export const vkDestroyBufferView = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    bufferView: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Image functions
/**
 * Create a new image object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateImage.html
 */
export const vkCreateImage = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    image: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an image object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyImage.html
 */
export const vkDestroyImage = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieve information about an image subresource.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetImageSubresourceLayout.html
 */
export const vkGetImageSubresourceLayout = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    image: 'ptr',
    subresource: 'ptr',
    layout: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Image view functions
/**
 * Create an image view from an existing image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateImageView.html
 */
export const vkCreateImageView = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    view: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy an image view object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyImageView.html
 */
export const vkDestroyImageView = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    imageView: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Shader module functions
/**
 * Creates a new shader module object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateShaderModule.html
 */
export const vkCreateShaderModule = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    shaderModule: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a shader module.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyShaderModule.html
 */
export const vkDestroyShaderModule = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    shaderModule: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Pipeline cache functions
/**
 * Creates a new pipeline cache object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreatePipelineCache.html
 */
export const vkCreatePipelineCache = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    pipelineCache: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a pipeline cache object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyPipelineCache.html
 */
export const vkDestroyPipelineCache = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get the data store from a pipeline cache.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPipelineCacheData.html
 */
export const vkGetPipelineCacheData = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    dataSize: 'ptr',
    data: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Combine the data stores of pipeline caches.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkMergePipelineCaches.html
 */
export const vkMergePipelineCaches = {
  args: ['ptr', 'ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    dstCache: 'ptr',
    srcCacheCount: 'u32',
    srcCaches: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Pipeline functions
/**
 * Create graphics pipelines.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateGraphicsPipelines.html
 */
export const vkCreateGraphicsPipelines = {
  args: ['ptr', 'ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    createInfoCount: 'u32',
    createInfos: 'ptr',
    allocationCallbacks: 'ptr',
    pipelines: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Creates a new compute pipeline object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateComputePipelines.html
 */
export const vkCreateComputePipelines = {
  args: ['ptr', 'ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineCache: 'ptr',
    createInfoCount: 'u32',
    createInfos: 'ptr',
    allocationCallbacks: 'ptr',
    pipelines: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a pipeline object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyPipeline.html
 */
export const vkDestroyPipeline = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipeline: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Pipeline layout functions
/**
 * Creates a new pipeline layout object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreatePipelineLayout.html
 */
export const vkCreatePipelineLayout = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    pipelineLayout: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a pipeline layout object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyPipelineLayout.html
 */
export const vkDestroyPipelineLayout = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    pipelineLayout: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Sampler functions
/**
 * Create a new sampler object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateSampler.html
 */
export const vkCreateSampler = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    sampler: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a sampler object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroySampler.html
 */
export const vkDestroySampler = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    sampler: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Descriptor set layout functions
/**
 * Create a new descriptor set layout.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDescriptorSetLayout.html
 */
export const vkCreateDescriptorSetLayout = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    setLayout: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a descriptor set layout object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyDescriptorSetLayout.html
 */
export const vkDestroyDescriptorSetLayout = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    descriptorSetLayout: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Descriptor pool functions
/**
 * Creates a descriptor pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDescriptorPool.html
 */
export const vkCreateDescriptorPool = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    descriptorPool: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a descriptor pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyDescriptorPool.html
 */
export const vkDestroyDescriptorPool = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    descriptorPool: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resets a descriptor pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetDescriptorPool.html
 */
export const vkResetDescriptorPool = {
  args: ['ptr', 'ptr', 'i32'] as [
    device: 'ptr',
    descriptorPool: 'ptr',
    flags: 'i32',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Descriptor set functions
/**
 * Allocate one or more descriptor sets.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkAllocateDescriptorSets.html
 */
export const vkAllocateDescriptorSets = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    allocateInfo: 'ptr',
    descriptorSets: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Free one or more descriptor sets.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkFreeDescriptorSets.html
 */
export const vkFreeDescriptorSets = {
  args: ['ptr', 'ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    descriptorPool: 'ptr',
    descriptorSetCount: 'u32',
    descriptorSets: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Update the contents of a descriptor set object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkUpdateDescriptorSets.html
 */
export const vkUpdateDescriptorSets = {
  args: ['ptr', 'u32', 'ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    descriptorWriteCount: 'u32',
    descriptorWrites: 'ptr',
    descriptorCopyCount: 'u32',
    descriptorCopies: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Framebuffer functions
/**
 * Create a new framebuffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateFramebuffer.html
 */
export const vkCreateFramebuffer = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    framebuffer: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a framebuffer object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyFramebuffer.html
 */
export const vkDestroyFramebuffer = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    framebuffer: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Render pass functions
/**
 * Create a new render pass object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateRenderPass.html
 */
export const vkCreateRenderPass = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    renderPass: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a render pass object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyRenderPass.html
 */
export const vkDestroyRenderPass = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    renderPass: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the granularity for optimal render area.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetRenderAreaGranularity.html
 */
export const vkGetRenderAreaGranularity = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    renderPass: 'ptr',
    granularity: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Command pool functions
/**
 * Create a new command pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateCommandPool.html
 */
export const vkCreateCommandPool = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    commandPool: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a command pool object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyCommandPool.html
 */
export const vkDestroyCommandPool = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    commandPool: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset a command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetCommandPool.html
 */
export const vkResetCommandPool = {
  args: ['ptr', 'ptr', 'i32'] as [
    device: 'ptr',
    commandPool: 'ptr',
    flags: 'i32',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// Command buffer functions
/**
 * Allocate command buffers from an existing command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkAllocateCommandBuffers.html
 */
export const vkAllocateCommandBuffers = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    allocateInfo: 'ptr',
    commandBuffers: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Free command buffers.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkFreeCommandBuffers.html
 */
export const vkFreeCommandBuffers = {
  args: ['ptr', 'ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    commandPool: 'ptr',
    commandBufferCount: 'u32',
    commandBuffers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Start recording a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkBeginCommandBuffer.html
 */
export const vkBeginCommandBuffer = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', beginInfo: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Finish recording a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEndCommandBuffer.html
 */
export const vkEndCommandBuffer = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reset a command buffer to the initial state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetCommandBuffer.html
 */
export const vkResetCommandBuffer = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', flags: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

// Command buffer commands
/**
 * Bind a pipeline object to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBindPipeline.html
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
 * Set viewport dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetViewport.html
 */
export const vkCmdSetViewport = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    firstViewport: 'u32',
    viewportCount: 'u32',
    viewports: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set scissor rectangles dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetScissor.html
 */
export const vkCmdSetScissor = {
  args: ['ptr', 'u32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    firstScissor: 'u32',
    scissorCount: 'u32',
    scissors: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set line width dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetLineWidth.html
 */
export const vkCmdSetLineWidth = {
  args: ['ptr', 'f32'] as [commandBuffer: 'ptr', lineWidth: 'f32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth bias dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthBias.html
 */
export const vkCmdSetDepthBias = {
  args: ['ptr', 'f32', 'f32', 'f32'] as [
    commandBuffer: 'ptr',
    depthBiasConstantFactor: 'f32',
    depthBiasClamp: 'f32',
    depthBiasSlopeFactor: 'f32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set the values of blend constants dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetBlendConstants.html
 */
export const vkCmdSetBlendConstants = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', blendConstants: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth bounds dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthBounds.html
 */
export const vkCmdSetDepthBounds = {
  args: ['ptr', 'f32', 'f32'] as [
    commandBuffer: 'ptr',
    minDepthBounds: 'f32',
    maxDepthBounds: 'f32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil compare mask dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetStencilCompareMask.html
 */
export const vkCmdSetStencilCompareMask = {
  args: ['ptr', 'i32', 'u32'] as [
    commandBuffer: 'ptr',
    faceMask: 'i32',
    compareMask: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil write mask dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetStencilWriteMask.html
 */
export const vkCmdSetStencilWriteMask = {
  args: ['ptr', 'i32', 'u32'] as [
    commandBuffer: 'ptr',
    faceMask: 'i32',
    writeMask: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil reference value dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetStencilReference.html
 */
export const vkCmdSetStencilReference = {
  args: ['ptr', 'i32', 'u32'] as [
    commandBuffer: 'ptr',
    faceMask: 'i32',
    reference: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Binds descriptor sets to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBindDescriptorSets.html
 */
export const vkCmdBindDescriptorSets = {
  args: ['ptr', 'i32', 'ptr', 'u32', 'u32', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    pipelineBindPoint: 'i32',
    layout: 'ptr',
    firstSet: 'u32',
    descriptorSetCount: 'u32',
    descriptorSets: 'ptr',
    dynamicOffsetCount: 'u32',
    dynamicOffsets: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind an index buffer to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBindIndexBuffer.html
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
 * Bind vertex buffers to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBindVertexBuffers.html
 */
export const vkCmdBindVertexBuffers = {
  args: ['ptr', 'u32', 'u32', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    firstBinding: 'u32',
    bindingCount: 'u32',
    buffers: 'ptr',
    offsets: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw primitives.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDraw.html
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
 * Draw primitives with indexed vertices.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDrawIndexed.html
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
 * Draw primitives with indirect parameters.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDrawIndirect.html
 */
export const vkCmdDrawIndirect = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    drawCount: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw primitives with indirect parameters and indexed vertices.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDrawIndexedIndirect.html
 */
export const vkCmdDrawIndexedIndirect = {
  args: ['ptr', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    drawCount: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute work items.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDispatch.html
 */
export const vkCmdDispatch = {
  args: ['ptr', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    groupCountX: 'u32',
    groupCountY: 'u32',
    groupCountZ: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute work items with indirect parameters.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDispatchIndirect.html
 */
export const vkCmdDispatchIndirect = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data between buffer regions.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyBuffer.html
 */
export const vkCmdCopyBuffer = {
  args: ['ptr', 'ptr', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcBuffer: 'ptr',
    dstBuffer: 'ptr',
    regionCount: 'u32',
    regions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data between images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyImage.html
 */
export const vkCmdCopyImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'i32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcImage: 'ptr',
    srcImageLayout: 'i32',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    regions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy regions of an image, potentially performing format conversion.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBlitImage.html
 */
export const vkCmdBlitImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'i32', 'u32', 'ptr', 'i32'] as [
    commandBuffer: 'ptr',
    srcImage: 'ptr',
    srcImageLayout: 'i32',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    regions: 'ptr',
    filter: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data from a buffer into an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyBufferToImage.html
 */
export const vkCmdCopyBufferToImage = {
  args: ['ptr', 'ptr', 'ptr', 'i32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcBuffer: 'ptr',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    regions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy image data into a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyImageToBuffer.html
 */
export const vkCmdCopyImageToBuffer = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcImage: 'ptr',
    srcImageLayout: 'i32',
    dstBuffer: 'ptr',
    regionCount: 'u32',
    regions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Update a buffer's contents from host memory.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdUpdateBuffer.html
 */
export const vkCmdUpdateBuffer = {
  args: ['ptr', 'ptr', 'u64', 'u64', 'ptr'] as [
    commandBuffer: 'ptr',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    dataSize: 'u64',
    data: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Fill a region of a buffer with a fixed value.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdFillBuffer.html
 */
export const vkCmdFillBuffer = {
  args: ['ptr', 'ptr', 'u64', 'u64', 'u32'] as [
    commandBuffer: 'ptr',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    size: 'u64',
    data: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clear regions of a color image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdClearColorImage.html
 */
export const vkCmdClearColorImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    image: 'ptr',
    imageLayout: 'i32',
    color: 'ptr',
    rangeCount: 'u32',
    ranges: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clear regions of a depth/stencil image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdClearDepthStencilImage.html
 */
export const vkCmdClearDepthStencilImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    image: 'ptr',
    imageLayout: 'i32',
    depthStencil: 'ptr',
    rangeCount: 'u32',
    ranges: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Clear regions within bound framebuffer attachments.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdClearAttachments.html
 */
export const vkCmdClearAttachments = {
  args: ['ptr', 'u32', 'ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    attachmentCount: 'u32',
    attachments: 'ptr',
    rectCount: 'u32',
    rects: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resolve regions of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdResolveImage.html
 */
export const vkCmdResolveImage = {
  args: ['ptr', 'ptr', 'i32', 'ptr', 'i32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    srcImage: 'ptr',
    srcImageLayout: 'i32',
    dstImage: 'ptr',
    dstImageLayout: 'i32',
    regionCount: 'u32',
    regions: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set an event object to signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetEvent.html
 */
export const vkCmdSetEvent = {
  args: ['ptr', 'ptr', 'i32'] as [
    commandBuffer: 'ptr',
    event: 'ptr',
    stageMask: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset an event object to non-signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdResetEvent.html
 */
export const vkCmdResetEvent = {
  args: ['ptr', 'ptr', 'i32'] as [
    commandBuffer: 'ptr',
    event: 'ptr',
    stageMask: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Wait for one or more events.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdWaitEvents.html
 */
export const vkCmdWaitEvents = {
  args: [
    'ptr',
    'u32',
    'ptr',
    'i32',
    'i32',
    'u32',
    'ptr',
    'u32',
    'ptr',
    'u32',
    'ptr',
  ] as [
    commandBuffer: 'ptr',
    eventCount: 'u32',
    events: 'ptr',
    srcStageMask: 'i32',
    dstStageMask: 'i32',
    memoryBarrierCount: 'u32',
    memoryBarriers: 'ptr',
    bufferMemoryBarrierCount: 'u32',
    bufferMemoryBarriers: 'ptr',
    imageMemoryBarrierCount: 'u32',
    imageMemoryBarriers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Insert a memory dependency.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdPipelineBarrier.html
 */
export const vkCmdPipelineBarrier = {
  args: [
    'ptr',
    'i32',
    'i32',
    'i32',
    'u32',
    'ptr',
    'u32',
    'ptr',
    'u32',
    'ptr',
  ] as [
    commandBuffer: 'ptr',
    srcStageMask: 'i32',
    dstStageMask: 'i32',
    dependencyFlags: 'i32',
    memoryBarrierCount: 'u32',
    memoryBarriers: 'ptr',
    bufferMemoryBarrierCount: 'u32',
    bufferMemoryBarriers: 'ptr',
    imageMemoryBarrierCount: 'u32',
    imageMemoryBarriers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begin a query.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBeginQuery.html
 */
export const vkCmdBeginQuery = {
  args: ['ptr', 'ptr', 'u32', 'i32'] as [
    commandBuffer: 'ptr',
    queryPool: 'ptr',
    query: 'u32',
    flags: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Ends a query.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdEndQuery.html
 */
export const vkCmdEndQuery = {
  args: ['ptr', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    queryPool: 'ptr',
    query: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset queries in a query pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdResetQueryPool.html
 */
export const vkCmdResetQueryPool = {
  args: ['ptr', 'ptr', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    queryPool: 'ptr',
    firstQuery: 'u32',
    queryCount: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Write a device timestamp into a query object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdWriteTimestamp.html
 */
export const vkCmdWriteTimestamp = {
  args: ['ptr', 'i32', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    pipelineStage: 'i32',
    queryPool: 'ptr',
    query: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy results of queries in a query pool to a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyQueryPoolResults.html
 */
export const vkCmdCopyQueryPoolResults = {
  args: ['ptr', 'ptr', 'u32', 'u32', 'ptr', 'u64', 'u64', 'i32'] as [
    commandBuffer: 'ptr',
    queryPool: 'ptr',
    firstQuery: 'u32',
    queryCount: 'u32',
    dstBuffer: 'ptr',
    dstOffset: 'u64',
    stride: 'u64',
    flags: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Update push constants in a pipeline layout.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdPushConstants.html
 */
export const vkCmdPushConstants = {
  args: ['ptr', 'ptr', 'i32', 'u32', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    layout: 'ptr',
    stageFlags: 'i32',
    offset: 'u32',
    size: 'u32',
    values: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begin a new render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBeginRenderPass.html
 */
export const vkCmdBeginRenderPass = {
  args: ['ptr', 'ptr', 'i32'] as [
    commandBuffer: 'ptr',
    renderPassBegin: 'ptr',
    contents: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Transition to the next subpass of a render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdNextSubpass.html
 */
export const vkCmdNextSubpass = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', contents: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * End the current render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdEndRenderPass.html
 */
export const vkCmdEndRenderPass = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Execute a secondary command buffer from a primary command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdExecuteCommands.html
 */
export const vkCmdExecuteCommands = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    commandBufferCount: 'u32',
    commandBuffers: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Vulkan MARK: 1.1
/**
 * Query instance-level version before instance creation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumerateInstanceVersion.html
 */
export const vkEnumerateInstanceVersion = {
  args: ['ptr'] as [apiVersion: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Bind device memory to buffer objects.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkBindBufferMemory2.html
 */
export const vkBindBufferMemory2 = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    bindInfoCount: 'u32',
    bindInfos: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Bind device memory to image objects.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkBindImageMemory2.html
 */
export const vkBindImageMemory2 = {
  args: ['ptr', 'u32', 'ptr'] as [
    device: 'ptr',
    bindInfoCount: 'u32',
    bindInfos: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported peer memory features.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceGroupPeerMemoryFeatures.html
 */
export const vkGetDeviceGroupPeerMemoryFeatures = {
  args: ['ptr', 'u32', 'u32', 'u32', 'ptr'] as [
    device: 'ptr',
    heapIndex: 'u32',
    localDeviceIndex: 'u32',
    remoteDeviceIndex: 'u32',
    peerMemoryFeatures: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Modify device mask of a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDeviceMask.html
 */
export const vkCmdSetDeviceMask = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', deviceMask: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Dispatch compute work items with non-zero base values.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDispatchBase.html
 */
export const vkCmdDispatchBase = {
  args: ['ptr', 'u32', 'u32', 'u32', 'u32', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    baseGroupX: 'u32',
    baseGroupY: 'u32',
    baseGroupZ: 'u32',
    groupCountX: 'u32',
    groupCountY: 'u32',
    groupCountZ: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Enumerates groups of physical devices.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkEnumeratePhysicalDeviceGroups.html
 */
export const vkEnumeratePhysicalDeviceGroups = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    physicalDeviceGroupCount: 'ptr',
    physicalDeviceGroupProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for specified Vulkan object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetImageMemoryRequirements2.html
 */
export const vkGetImageMemoryRequirements2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetBufferMemoryRequirements2.html
 */
export const vkGetBufferMemoryRequirements2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query the memory requirements for a sparse image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetImageSparseMemoryRequirements2.html
 */
export const vkGetImageSparseMemoryRequirements2 = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    sparseMemoryRequirementCount: 'ptr',
    sparseMemoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports capabilities of a physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceFeatures2.html
 */
export const vkGetPhysicalDeviceFeatures2 = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', features: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns properties of a physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceProperties2.html
 */
export const vkGetPhysicalDeviceProperties2 = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', properties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Lists physical device's format capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceFormatProperties2.html
 */
export const vkGetPhysicalDeviceFormatProperties2 = {
  args: ['ptr', 'i32', 'ptr'] as [
    physicalDevice: 'ptr',
    format: 'i32',
    formatProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Lists physical device's image format capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceImageFormatProperties2.html
 */
export const vkGetPhysicalDeviceImageFormatProperties2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    imageFormatInfo: 'ptr',
    imageFormatProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Reports properties of the queues of the specified physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceQueueFamilyProperties2.html
 */
export const vkGetPhysicalDeviceQueueFamilyProperties2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    queueFamilyPropertyCount: 'ptr',
    queueFamilyProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reports memory information for the specified physical device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceMemoryProperties2.html
 */
export const vkGetPhysicalDeviceMemoryProperties2 = {
  args: ['ptr', 'ptr'] as [physicalDevice: 'ptr', memoryProperties: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieve properties of an image format applied to sparse images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSparseImageFormatProperties2.html
 */
export const vkGetPhysicalDeviceSparseImageFormatProperties2 = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    formatInfo: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Trim a command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkTrimCommandPool.html
 */
export const vkTrimCommandPool = {
  args: ['ptr', 'ptr', 'i32'] as [
    device: 'ptr',
    commandPool: 'ptr',
    flags: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Get a queue handle from a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceQueue2.html
 */
export const vkGetDeviceQueue2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    queueInfo: 'ptr',
    queue: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create a new Y′C B C R conversion.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateSamplerYcbcrConversion.html
 */
export const vkCreateSamplerYcbcrConversion = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    ycbcrConversion: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a created Y′C B C R conversion.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroySamplerYcbcrConversion.html
 */
export const vkDestroySamplerYcbcrConversion = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    ycbcrConversion: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create a new descriptor update template.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDescriptorUpdateTemplate.html
 */
export const vkCreateDescriptorUpdateTemplate = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    descriptorUpdateTemplate: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a descriptor update template object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyDescriptorUpdateTemplate.html
 */
export const vkDestroyDescriptorUpdateTemplate = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    descriptorUpdateTemplate: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Update the contents of a descriptor set object using a template.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkUpdateDescriptorSetWithTemplate.html
 */
export const vkUpdateDescriptorSetWithTemplate = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    descriptorSet: 'ptr',
    descriptorUpdateTemplate: 'ptr',
    data: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query external handle types supported by buffers.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceExternalBufferProperties.html
 */
export const vkGetPhysicalDeviceExternalBufferProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    externalBufferInfo: 'ptr',
    externalBufferProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query external fence handle types supported.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceExternalFenceProperties.html
 */
export const vkGetPhysicalDeviceExternalFenceProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    externalFenceInfo: 'ptr',
    externalFenceProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query external semaphore handle types supported.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceExternalSemaphoreProperties.html
 */
export const vkGetPhysicalDeviceExternalSemaphoreProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    externalSemaphoreInfo: 'ptr',
    externalSemaphoreProperties: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query whether a descriptor set layout can be created.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDescriptorSetLayoutSupport.html
 */
export const vkGetDescriptorSetLayoutSupport = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    support: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// Vulkan MARK: 1.2
/**
 * Draw primitives with indirect parameters and draw count.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDrawIndirectCount.html
 */
export const vkCmdDrawIndirectCount = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    countBuffer: 'ptr',
    countBufferOffset: 'u64',
    maxDrawCount: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Draw primitives with indirect parameters, indexed vertices, and draw count.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdDrawIndexedIndirectCount.html
 */
export const vkCmdDrawIndexedIndirectCount = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'u64', 'u32', 'u32'] as [
    commandBuffer: 'ptr',
    buffer: 'ptr',
    offset: 'u64',
    countBuffer: 'ptr',
    countBufferOffset: 'u64',
    maxDrawCount: 'u32',
    stride: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Create a new render pass object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateRenderPass2.html
 */
export const vkCreateRenderPass2 = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    renderPass: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Begin a new render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBeginRenderPass2.html
 */
export const vkCmdBeginRenderPass2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    renderPassBegin: 'ptr',
    subpassBeginInfo: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Transition to the next subpass of a render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdNextSubpass2.html
 */
export const vkCmdNextSubpass2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    subpassBeginInfo: 'ptr',
    subpassEndInfo: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * End the current render pass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdEndRenderPass2.html
 */
export const vkCmdEndRenderPass2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', subpassEndInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset queries in a query pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkResetQueryPool.html
 */
export const vkResetQueryPool = {
  args: ['ptr', 'ptr', 'u32', 'u32'] as [
    device: 'ptr',
    queryPool: 'ptr',
    firstQuery: 'u32',
    queryCount: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query the current state of a timeline semaphore.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetSemaphoreCounterValue.html
 */
export const vkGetSemaphoreCounterValue = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    semaphore: 'ptr',
    value: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Wait for timeline semaphores on the host.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkWaitSemaphores.html
 */
export const vkWaitSemaphores = {
  args: ['ptr', 'ptr', 'u64'] as [
    device: 'ptr',
    waitInfo: 'ptr',
    timeout: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Signal a timeline semaphore on the host.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkSignalSemaphore.html
 */
export const vkSignalSemaphore = {
  args: ['ptr', 'ptr'] as [device: 'ptr', signalInfo: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query an address of a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetBufferDeviceAddress.html
 */
export const vkGetBufferDeviceAddress = {
  args: ['ptr', 'ptr'] as [device: 'ptr', info: 'ptr'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Query an opaque capture address of a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetBufferOpaqueCaptureAddress.html
 */
export const vkGetBufferOpaqueCaptureAddress = {
  args: ['ptr', 'ptr'] as [device: 'ptr', info: 'ptr'],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Query an opaque capture address of a memory object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceMemoryOpaqueCaptureAddress.html
 */
export const vkGetDeviceMemoryOpaqueCaptureAddress = {
  args: ['ptr', 'ptr'] as [device: 'ptr', info: 'ptr'],
  returns: 'u64',
} as const satisfies FFIFunction;

// Vulkan MARK: 1.3
/**
 * Reports properties of tools active on the device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceToolProperties.html
 */
export const vkGetPhysicalDeviceToolProperties = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    toolCount: 'ptr',
    toolProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create a slot for private data storage.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreatePrivateDataSlot.html
 */
export const vkCreatePrivateDataSlot = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    privateDataSlot: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a private data slot.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroyPrivateDataSlot.html
 */
export const vkDestroyPrivateDataSlot = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    privateDataSlot: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Associate data with a Vulkan object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkSetPrivateData.html
 */
export const vkSetPrivateData = {
  args: ['ptr', 'i32', 'u64', 'ptr', 'u64'] as [
    device: 'ptr',
    objectType: 'i32',
    objectHandle: 'u64',
    privateDataSlot: 'ptr',
    data: 'u64',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Retrieve data associated with a Vulkan object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPrivateData.html
 */
export const vkGetPrivateData = {
  args: ['ptr', 'i32', 'u64', 'ptr', 'ptr'] as [
    device: 'ptr',
    objectType: 'i32',
    objectHandle: 'u64',
    privateDataSlot: 'ptr',
    data: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set an event object to signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetEvent2.html
 */
export const vkCmdSetEvent2 = {
  args: ['ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    event: 'ptr',
    dependencyInfo: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Reset an event object to non-signaled state.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdResetEvent2.html
 */
export const vkCmdResetEvent2 = {
  args: ['ptr', 'ptr', 'u64'] as [
    commandBuffer: 'ptr',
    event: 'ptr',
    stageMask: 'u64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Wait for one or more events.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdWaitEvents2.html
 */
export const vkCmdWaitEvents2 = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    eventCount: 'u32',
    events: 'ptr',
    dependencyInfos: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Insert a memory dependency.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdPipelineBarrier2.html
 */
export const vkCmdPipelineBarrier2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', dependencyInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Write a device timestamp into a query object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdWriteTimestamp2.html
 */
export const vkCmdWriteTimestamp2 = {
  args: ['ptr', 'u64', 'ptr', 'u32'] as [
    commandBuffer: 'ptr',
    stage: 'u64',
    queryPool: 'ptr',
    query: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Submits command buffers to a queue.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkQueueSubmit2.html
 */
export const vkQueueSubmit2 = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    queue: 'ptr',
    submitCount: 'u32',
    submits: 'ptr',
    fence: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Copy data between buffer regions.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyBuffer2.html
 */
export const vkCmdCopyBuffer2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', copyBufferInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data between images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyImage2.html
 */
export const vkCmdCopyImage2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', copyImageInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy data from a buffer into an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyBufferToImage2.html
 */
export const vkCmdCopyBufferToImage2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', copyBufferToImageInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy image data into a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdCopyImageToBuffer2.html
 */
export const vkCmdCopyImageToBuffer2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', copyImageToBufferInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Copy regions of an image, potentially performing format conversion.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBlitImage2.html
 */
export const vkCmdBlitImage2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', blitImageInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Resolve regions of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdResolveImage2.html
 */
export const vkCmdResolveImage2 = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', resolveImageInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Begin a dynamic render pass instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBeginRendering.html
 */
export const vkCmdBeginRendering = {
  args: ['ptr', 'ptr'] as [commandBuffer: 'ptr', renderingInfo: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * End a dynamic render pass instance.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdEndRendering.html
 */
export const vkCmdEndRendering = {
  args: ['ptr'] as [commandBuffer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set cull mode dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetCullMode.html
 */
export const vkCmdSetCullMode = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', cullMode: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set front face orientation dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetFrontFace.html
 */
export const vkCmdSetFrontFace = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', frontFace: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set primitive topology dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetPrimitiveTopology.html
 */
export const vkCmdSetPrimitiveTopology = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', primitiveTopology: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set the viewport count and viewports dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetViewportWithCount.html
 */
export const vkCmdSetViewportWithCount = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    viewportCount: 'u32',
    viewports: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set the scissor count and scissor rectangles dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetScissorWithCount.html
 */
export const vkCmdSetScissorWithCount = {
  args: ['ptr', 'u32', 'ptr'] as [
    commandBuffer: 'ptr',
    scissorCount: 'u32',
    scissors: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Bind vertex buffers to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdBindVertexBuffers2.html
 */
export const vkCmdBindVertexBuffers2 = {
  args: ['ptr', 'u32', 'u32', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    commandBuffer: 'ptr',
    firstBinding: 'u32',
    bindingCount: 'u32',
    buffers: 'ptr',
    offsets: 'ptr',
    sizes: 'ptr',
    strides: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth test enable dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthTestEnable.html
 */
export const vkCmdSetDepthTestEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', depthTestEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth write enable dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthWriteEnable.html
 */
export const vkCmdSetDepthWriteEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', depthWriteEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth comparison operator dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthCompareOp.html
 */
export const vkCmdSetDepthCompareOp = {
  args: ['ptr', 'i32'] as [commandBuffer: 'ptr', depthCompareOp: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set depth bounds test enable dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthBoundsTestEnable.html
 */
export const vkCmdSetDepthBoundsTestEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', depthBoundsTestEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil test enable dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetStencilTestEnable.html
 */
export const vkCmdSetStencilTestEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', stencilTestEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set stencil operation dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetStencilOp.html
 */
export const vkCmdSetStencilOp = {
  args: ['ptr', 'i32', 'i32', 'i32', 'i32', 'i32'] as [
    commandBuffer: 'ptr',
    faceMask: 'i32',
    failOp: 'i32',
    passOp: 'i32',
    depthFailOp: 'i32',
    compareOp: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Control whether primitives are discarded before the rasterization stage dynamically.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetRasterizerDiscardEnable.html
 */
export const vkCmdSetRasterizerDiscardEnable = {
  args: ['ptr', 'u32'] as [
    commandBuffer: 'ptr',
    rasterizerDiscardEnable: 'u32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Control whether to bias fragment depth values dynamically.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetDepthBiasEnable.html
 */
export const vkCmdSetDepthBiasEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', depthBiasEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Set primitive restart enable dynamically for a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCmdSetPrimitiveRestartEnable.html
 */
export const vkCmdSetPrimitiveRestartEnable = {
  args: ['ptr', 'u32'] as [commandBuffer: 'ptr', primitiveRestartEnable: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceBufferMemoryRequirements.html
 */
export const vkGetDeviceBufferMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the memory requirements for specified Vulkan object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceImageMemoryRequirements.html
 */
export const vkGetDeviceImageMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    memoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query the memory requirements for a sparse image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceImageSparseMemoryRequirements.html
 */
export const vkGetDeviceImageSparseMemoryRequirements = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    info: 'ptr',
    sparseMemoryRequirementCount: 'ptr',
    sparseMemoryRequirements: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

// KHR Surface extension
/**
 * Destroy a VkSurfaceKHR object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroySurfaceKHR.html
 */
export const vkDestroySurfaceKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    surface: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Query if presentation is supported.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfaceSupportKHR.html
 */
export const vkGetPhysicalDeviceSurfaceSupportKHR = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    queueFamilyIndex: 'u32',
    surface: 'ptr',
    supported: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query surface capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfaceCapabilitiesKHR.html
 */
export const vkGetPhysicalDeviceSurfaceCapabilitiesKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    surfaceCapabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported surface formats.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfaceFormatsKHR.html
 */
export const vkGetPhysicalDeviceSurfaceFormatsKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    surfaceFormatCount: 'ptr',
    surfaceFormats: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query supported presentation modes.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfacePresentModesKHR.html
 */
export const vkGetPhysicalDeviceSurfacePresentModesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    presentModeCount: 'ptr',
    presentModes: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// KHR Swapchain extension
/**
 * Create a swapchain.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateSwapchainKHR.html
 */
export const vkCreateSwapchainKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    swapchain: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Destroy a swapchain object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkDestroySwapchainKHR.html
 */
export const vkDestroySwapchainKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    allocationCallbacks: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Obtain the array of presentable images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetSwapchainImagesKHR.html
 */
export const vkGetSwapchainImagesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    swapchainImageCount: 'ptr',
    swapchainImages: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Retrieve the index of the next available image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkAcquireNextImageKHR.html
 */
export const vkAcquireNextImageKHR = {
  args: ['ptr', 'ptr', 'u64', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchain: 'ptr',
    timeout: 'u64',
    semaphore: 'ptr',
    fence: 'ptr',
    imageIndex: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Queue an image for presentation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkQueuePresentKHR.html
 */
export const vkQueuePresentKHR = {
  args: ['ptr', 'ptr'] as [queue: 'ptr', presentInfo: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query present capabilities for a device group.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceGroupPresentCapabilitiesKHR.html
 */
export const vkGetDeviceGroupPresentCapabilitiesKHR = {
  args: ['ptr', 'ptr'] as [
    device: 'ptr',
    deviceGroupPresentCapabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query present capabilities for a surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDeviceGroupSurfacePresentModesKHR.html
 */
export const vkGetDeviceGroupSurfacePresentModesKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [device: 'ptr', surface: 'ptr', modes: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query present rectangles for a surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDevicePresentRectanglesKHR.html
 */
export const vkGetPhysicalDevicePresentRectanglesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surface: 'ptr',
    rectCount: 'ptr',
    rects: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Retrieve the index of the next available image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkAcquireNextImage2KHR.html
 */
export const vkAcquireNextImage2KHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    acquireInfo: 'ptr',
    imageIndex: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// KHR Display extension
/**
 * Query information about available displays.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceDisplayPropertiesKHR.html
 */
export const vkGetPhysicalDeviceDisplayPropertiesKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query the plane properties.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceDisplayPlanePropertiesKHR.html
 */
export const vkGetPhysicalDeviceDisplayPlanePropertiesKHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query displays supported by a plane.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDisplayPlaneSupportedDisplaysKHR.html
 */
export const vkGetDisplayPlaneSupportedDisplaysKHR = {
  args: ['ptr', 'u32', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    planeIndex: 'u32',
    displayCount: 'ptr',
    displays: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query the set of mode properties supported by the display.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDisplayModePropertiesKHR.html
 */
export const vkGetDisplayModePropertiesKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    display: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create a display mode.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDisplayModeKHR.html
 */
export const vkCreateDisplayModeKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    display: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    mode: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query capabilities of a mode and plane combination.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDisplayPlaneCapabilitiesKHR.html
 */
export const vkGetDisplayPlaneCapabilitiesKHR = {
  args: ['ptr', 'ptr', 'u32', 'ptr'] as [
    physicalDevice: 'ptr',
    mode: 'ptr',
    planeIndex: 'u32',
    capabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create a VkSurfaceKHR structure representing a display plane.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateDisplayPlaneSurfaceKHR.html
 */
export const vkCreateDisplayPlaneSurfaceKHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    surface: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Create multiple swapchains that share presentable images.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateSharedSwapchainsKHR.html
 */
export const vkCreateSharedSwapchainsKHR = {
  args: ['ptr', 'u32', 'ptr', 'ptr', 'ptr'] as [
    device: 'ptr',
    swapchainCount: 'u32',
    createInfos: 'ptr',
    allocationCallbacks: 'ptr',
    swapchains: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// KHR Get Surface Capabilities2 extension
/**
 * Query information about available displays.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceDisplayProperties2KHR.html
 */
export const vkGetPhysicalDeviceDisplayProperties2KHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query information about the available display planes.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceDisplayPlaneProperties2KHR.html
 */
export const vkGetPhysicalDeviceDisplayPlaneProperties2KHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query the set of mode properties supported by the display.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDisplayModeProperties2KHR.html
 */
export const vkGetDisplayModeProperties2KHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    display: 'ptr',
    propertyCount: 'ptr',
    properties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query capabilities of a mode and plane combination.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetDisplayPlaneCapabilities2KHR.html
 */
export const vkGetDisplayPlaneCapabilities2KHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    displayPlaneInfo: 'ptr',
    capabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query surface capabilities.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfaceCapabilities2KHR.html
 */
export const vkGetPhysicalDeviceSurfaceCapabilities2KHR = {
  args: ['ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surfaceInfo: 'ptr',
    surfaceCapabilities: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Query color formats supported by surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceSurfaceFormats2KHR.html
 */
export const vkGetPhysicalDeviceSurfaceFormats2KHR = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    physicalDevice: 'ptr',
    surfaceInfo: 'ptr',
    surfaceFormatCount: 'ptr',
    surfaceFormats: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;

// EXT Headless Surface extension
/**
 * Create a headless VkSurfaceKHR object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateHeadlessSurfaceEXT.html
 */
export const vkCreateHeadlessSurfaceEXT = {
  args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
    instance: 'ptr',
    createInfo: 'ptr',
    allocationCallbacks: 'ptr',
    surface: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;
