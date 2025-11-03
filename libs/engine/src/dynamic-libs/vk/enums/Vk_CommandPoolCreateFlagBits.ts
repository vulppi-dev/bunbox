/**
 * Bitmask specifying usage behavior for a command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandPoolCreateFlagBits.html
 */
export enum Vk_CommandPoolCreateFlagBits {
  TRANSIENT_BIT = 0x00000001,
  RESET_COMMAND_BUFFER_BIT = 0x00000002,
  PROTECTED_BIT = 0x00000004,
}
