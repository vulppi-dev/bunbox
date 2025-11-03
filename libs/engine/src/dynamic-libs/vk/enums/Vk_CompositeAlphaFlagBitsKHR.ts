/**
 * Alpha compositing modes supported on a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCompositeAlphaFlagBitsKHR.html
 */
export enum Vk_CompositeAlphaFlagBitsKHR {
  OPAQUE_BIT_KHR = 0x00000001,
  PRE_MULTIPLIED_BIT_KHR = 0x00000002,
  POST_MULTIPLIED_BIT_KHR = 0x00000004,
  INHERIT_BIT_KHR = 0x00000008,
}
