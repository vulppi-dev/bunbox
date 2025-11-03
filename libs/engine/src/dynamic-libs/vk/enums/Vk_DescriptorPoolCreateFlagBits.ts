/**
 * Bitmask specifying certain supported operations on a descriptor pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorPoolCreateFlagBits.html
 */
export enum Vk_DescriptorPoolCreateFlagBits {
  FREE_DESCRIPTOR_SET_BIT = 0x00000001,
  UPDATE_AFTER_BIND_BIT = 0x00000002,
}
