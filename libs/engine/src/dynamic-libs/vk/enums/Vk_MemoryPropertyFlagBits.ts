/**
 * Bitmask specifying properties for a memory type.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryPropertyFlagBits.html
 */
export enum Vk_MemoryPropertyFlagBits {
  DEVICE_LOCAL_BIT = 0x00000001,
  HOST_VISIBLE_BIT = 0x00000002,
  HOST_COHERENT_BIT = 0x00000004,
  HOST_CACHED_BIT = 0x00000008,
  LAZILY_ALLOCATED_BIT = 0x00000010,
}
