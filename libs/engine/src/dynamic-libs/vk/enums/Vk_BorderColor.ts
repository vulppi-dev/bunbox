/**
 * Specify border color used for texture lookups.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBorderColor.html
 */
export enum Vk_BorderColor {
  FLOAT_TRANSPARENT_BLACK = 0,
  INT_TRANSPARENT_BLACK = 1,
  FLOAT_OPAQUE_BLACK = 2,
  INT_OPAQUE_BLACK = 3,
  FLOAT_OPAQUE_WHITE = 4,
  INT_OPAQUE_WHITE = 5,
}
