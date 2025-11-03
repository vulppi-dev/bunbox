/**
 * Bitmask specifying intended usage of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageUsageFlagBits.html
 */
export enum Vk_ImageUsageFlagBits {
  TRANSFER_SRC_BIT = 0x00000001,
  TRANSFER_DST_BIT = 0x00000002,
  SAMPLED_BIT = 0x00000004,
  STORAGE_BIT = 0x00000008,
  COLOR_ATTACHMENT_BIT = 0x00000010,
  DEPTH_STENCIL_ATTACHMENT_BIT = 0x00000020,
  TRANSIENT_ATTACHMENT_BIT = 0x00000040,
  INPUT_ATTACHMENT_BIT = 0x00000080,
}
