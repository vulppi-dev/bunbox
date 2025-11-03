/**
 * Bitmask specifying how execution and memory dependencies are formed.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDependencyFlagBits.html
 */
export enum Vk_DependencyFlagBits {
  BY_REGION_BIT = 0x00000001,
  DEVICE_GROUP_BIT = 0x00000004,
  VIEW_LOCAL_BIT = 0x00000002,
}
