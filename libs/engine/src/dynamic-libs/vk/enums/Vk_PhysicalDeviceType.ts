/**
 * Supported physical device types.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPhysicalDeviceType.html
 */
export enum Vk_PhysicalDeviceType {
  OTHER = 0,
  INTEGRATED_GPU = 1,
  DISCRETE_GPU = 2,
  VIRTUAL_GPU = 3,
  CPU = 4,
}
