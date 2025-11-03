/**
 * Stencil comparison function.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkStencilOp.html
 */
export enum Vk_StencilOp {
  KEEP = 0,
  ZERO = 1,
  REPLACE = 2,
  INCREMENT_AND_CLAMP = 3,
  DECREMENT_AND_CLAMP = 4,
  INVERT = 5,
  INCREMENT_AND_WRAP = 6,
  DECREMENT_AND_WRAP = 7,
}
