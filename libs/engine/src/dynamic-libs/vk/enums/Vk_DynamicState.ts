/**
 * Indicate which dynamic state is taken from dynamic state commands.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDynamicState.html
 */
export enum Vk_DynamicState {
  VIEWPORT = 0,
  SCISSOR = 1,
  LINE_WIDTH = 2,
  DEPTH_BIAS = 3,
  BLEND_CONSTANTS = 4,
  DEPTH_BOUNDS = 5,
  STENCIL_COMPARE_MASK = 6,
  STENCIL_WRITE_MASK = 7,
  STENCIL_REFERENCE = 8,
}
