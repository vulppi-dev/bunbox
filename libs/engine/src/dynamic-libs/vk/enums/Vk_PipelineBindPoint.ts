/**
 * Specify the bind point of a pipeline object to a command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineBindPoint.html
 */
export enum Vk_PipelineBindPoint {
  GRAPHICS = 0,
  COMPUTE = 1,
  RAY_TRACING_KHR = 1000165000,
}
