/**
 * Bitmask specifying allowed usage of a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferUsageFlagBits.html
 */
export enum Vk_BufferUsageFlagBits {
  TRANSFER_SRC_BIT = 0x00000001,
  TRANSFER_DST_BIT = 0x00000002,
  UNIFORM_TEXEL_BUFFER_BIT = 0x00000004,
  STORAGE_TEXEL_BUFFER_BIT = 0x00000008,
  UNIFORM_BUFFER_BIT = 0x00000010,
  STORAGE_BUFFER_BIT = 0x00000020,
  INDEX_BUFFER_BIT = 0x00000040,
  VERTEX_BUFFER_BIT = 0x00000080,
  INDIRECT_BUFFER_BIT = 0x00000100,
}
