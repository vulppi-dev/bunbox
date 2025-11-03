/**
 * Bitmask specifying additional parameters of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageCreateFlagBits.html
 */
export enum Vk_ImageCreateFlagBits {
  SPARSE_BINDING_BIT = 0x00000001,
  SPARSE_RESIDENCY_BIT = 0x00000002,
  SPARSE_ALIASED_BIT = 0x00000004,
  MUTABLE_FORMAT_BIT = 0x00000008,
  CUBE_COMPATIBLE_BIT = 0x00000010,
}
