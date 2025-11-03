/**
 * Framebuffer logical operations.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkLogicOp.html
 */
export enum Vk_LogicOp {
  CLEAR = 0,
  AND = 1,
  AND_REVERSE = 2,
  COPY = 3,
  AND_INVERTED = 4,
  NO_OP = 5,
  XOR = 6,
  OR = 7,
  NOR = 8,
  EQUIVALENT = 9,
  INVERT = 10,
  OR_REVERSE = 11,
  COPY_INVERTED = 12,
  OR_INVERTED = 13,
  NAND = 14,
  SET = 15,
}
