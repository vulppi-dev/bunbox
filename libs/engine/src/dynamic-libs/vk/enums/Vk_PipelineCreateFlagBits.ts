/**
 * Bitmask specifying additional parameters of a pipeline.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineCreateFlagBits.html
 */
export enum Vk_PipelineCreateFlagBits {
  DISABLE_OPTIMIZATION_BIT = 0x00000001,
  ALLOW_DERIVATIVES_BIT = 0x00000002,
  DERIVATIVE_BIT = 0x00000004,
}
