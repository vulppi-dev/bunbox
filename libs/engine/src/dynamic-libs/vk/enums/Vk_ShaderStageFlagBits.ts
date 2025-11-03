/**
 * Bitmask specifying a pipeline stage.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkShaderStageFlagBits.html
 */
export enum Vk_ShaderStageFlagBits {
  VERTEX_BIT = 0x00000001,
  TESSELLATION_CONTROL_BIT = 0x00000002,
  TESSELLATION_EVALUATION_BIT = 0x00000004,
  GEOMETRY_BIT = 0x00000008,
  FRAGMENT_BIT = 0x00000010,
  COMPUTE_BIT = 0x00000020,
  ALL_GRAPHICS = 0x0000001f,
  ALL = 0x7fffffff,
}
