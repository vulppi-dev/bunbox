/**
 * Bitmask specifying capabilities of queues in a queue family.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkQueueFlagBits.html
 */
export enum Vk_QueueFlagBits {
  GRAPHICS_BIT = 0x00000001,
  COMPUTE_BIT = 0x00000002,
  TRANSFER_BIT = 0x00000004,
  SPARSE_BINDING_BIT = 0x00000008,
  PROTECTED_BIT = 0x00000010,
}
