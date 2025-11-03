/**
 * Specify an enumeration to track object handle types.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkObjectType.html
 */
export enum Vk_ObjectType {
  UNKNOWN = 0,
  INSTANCE = 1,
  PHYSICAL_DEVICE = 2,
  DEVICE = 3,
  QUEUE = 4,
  SEMAPHORE = 5,
  COMMAND_BUFFER = 6,
  FENCE = 7,
  DEVICE_MEMORY = 8,
  BUFFER = 9,
  IMAGE = 10,
  EVENT = 11,
  QUERY_POOL = 12,
  BUFFER_VIEW = 13,
  IMAGE_VIEW = 14,
  SHADER_MODULE = 15,
  PIPELINE_CACHE = 16,
  PIPELINE_LAYOUT = 17,
  RENDER_PASS = 18,
  PIPELINE = 19,
  DESCRIPTOR_SET_LAYOUT = 20,
  SAMPLER = 21,
  DESCRIPTOR_POOL = 22,
  DESCRIPTOR_SET = 23,
  FRAMEBUFFER = 24,
  COMMAND_POOL = 25,
  SURFACE_KHR = 1000000000,
  SWAPCHAIN_KHR = 1000001000,
  DISPLAY_KHR = 1000002000,
  DISPLAY_MODE_KHR = 1000002001,
}
