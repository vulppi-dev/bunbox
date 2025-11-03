/**
 * Layout of image and image subresources.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageLayout.html
 */
export enum Vk_ImageLayout {
  UNDEFINED = 0,
  GENERAL = 1,
  COLOR_ATTACHMENT_OPTIMAL = 2,
  DEPTH_STENCIL_ATTACHMENT_OPTIMAL = 3,
  DEPTH_STENCIL_READ_ONLY_OPTIMAL = 4,
  SHADER_READ_ONLY_OPTIMAL = 5,
  TRANSFER_SRC_OPTIMAL = 6,
  TRANSFER_DST_OPTIMAL = 7,
  PREINITIALIZED = 8,
  PRESENT_SRC_KHR = 1000001002,
}
