/**
 * Bitmask controlling triangle culling.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCullModeFlagBits.html
 */
export enum Vk_CullModeFlagBits {
  NONE = 0,
  FRONT_BIT = 0x00000001,
  BACK_BIT = 0x00000002,
  FRONT_AND_BACK = 0x00000003,
}
