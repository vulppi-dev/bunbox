/**
 * Bitmask specifying which aspects of an image are included in a view.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageAspectFlagBits.html
 */
export enum Vk_ImageAspectFlagBits {
  COLOR_BIT = 0x00000001,
  DEPTH_BIT = 0x00000002,
  STENCIL_BIT = 0x00000004,
  METADATA_BIT = 0x00000008,
}
