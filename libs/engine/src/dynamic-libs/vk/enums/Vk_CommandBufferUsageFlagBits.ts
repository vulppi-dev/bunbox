/**
 * Bitmask specifying usage behavior for command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandBufferUsageFlagBits.html
 */
export enum Vk_CommandBufferUsageFlagBits {
  ONE_TIME_SUBMIT_BIT = 0x00000001,
  RENDER_PASS_CONTINUE_BIT = 0x00000002,
  SIMULTANEOUS_USE_BIT = 0x00000004,
}
