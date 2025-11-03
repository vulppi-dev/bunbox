/**
 * Specify how commands in the first subpass of a render pass are provided.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassContents.html
 */
export enum Vk_SubpassContents {
  INLINE = 0,
  SECONDARY_COMMAND_BUFFERS = 1,
}
