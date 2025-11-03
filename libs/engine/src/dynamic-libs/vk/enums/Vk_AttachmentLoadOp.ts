/**
 * Specify how contents of an attachment are treated at the beginning of a subpass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentLoadOp.html
 */
export enum Vk_AttachmentLoadOp {
  LOAD = 0,
  CLEAR = 1,
  DONT_CARE = 2,
}
