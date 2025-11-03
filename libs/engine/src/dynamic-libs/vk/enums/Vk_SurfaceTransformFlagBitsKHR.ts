/**
 * Presentation transforms supported on a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSurfaceTransformFlagBitsKHR.html
 */
export enum Vk_SurfaceTransformFlagBitsKHR {
  IDENTITY_BIT_KHR = 0x00000001,
  ROTATE_90_BIT_KHR = 0x00000002,
  ROTATE_180_BIT_KHR = 0x00000004,
  ROTATE_270_BIT_KHR = 0x00000008,
  HORIZONTAL_MIRROR_BIT_KHR = 0x00000010,
  HORIZONTAL_MIRROR_ROTATE_90_BIT_KHR = 0x00000020,
  HORIZONTAL_MIRROR_ROTATE_180_BIT_KHR = 0x00000040,
  HORIZONTAL_MIRROR_ROTATE_270_BIT_KHR = 0x00000080,
  INHERIT_BIT_KHR = 0x00000100,
}
