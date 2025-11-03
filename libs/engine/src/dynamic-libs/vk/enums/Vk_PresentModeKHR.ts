/**
 * Presentation mode supported for a surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPresentModeKHR.html
 */
export enum Vk_PresentModeKHR {
  IMMEDIATE_KHR = 0,
  MAILBOX_KHR = 1,
  FIFO_KHR = 2,
  FIFO_RELAXED_KHR = 3,
}
