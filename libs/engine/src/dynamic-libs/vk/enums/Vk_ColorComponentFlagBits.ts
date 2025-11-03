/**
 * Bitmask controlling which components are written to the framebuffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkColorComponentFlagBits.html
 */
export enum Vk_ColorComponentFlagBits {
  R_BIT = 0x00000001,
  G_BIT = 0x00000002,
  B_BIT = 0x00000004,
  A_BIT = 0x00000008,
}
