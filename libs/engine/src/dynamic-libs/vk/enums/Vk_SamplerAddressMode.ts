/**
 * Specify behavior of sampling with texture coordinates outside an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSamplerAddressMode.html
 */
export enum Vk_SamplerAddressMode {
  REPEAT = 0,
  MIRRORED_REPEAT = 1,
  CLAMP_TO_EDGE = 2,
  CLAMP_TO_BORDER = 3,
  MIRROR_CLAMP_TO_EDGE = 4,
}
