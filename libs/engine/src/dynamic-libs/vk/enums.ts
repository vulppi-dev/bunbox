/**
 * Vulkan command return codes.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkResult.html
 */
export enum Vk_Result {
  SUCCESS = 0,
  NOT_READY = 1,
  TIMEOUT = 2,
  EVENT_SET = 3,
  EVENT_RESET = 4,
  INCOMPLETE = 5,
  ERROR_OUT_OF_HOST_MEMORY = -1,
  ERROR_OUT_OF_DEVICE_MEMORY = -2,
  ERROR_INITIALIZATION_FAILED = -3,
  ERROR_DEVICE_LOST = -4,
  ERROR_MEMORY_MAP_FAILED = -5,
  ERROR_LAYER_NOT_PRESENT = -6,
  ERROR_EXTENSION_NOT_PRESENT = -7,
  ERROR_FEATURE_NOT_PRESENT = -8,
  ERROR_INCOMPATIBLE_DRIVER = -9,
  ERROR_TOO_MANY_OBJECTS = -10,
  ERROR_FORMAT_NOT_SUPPORTED = -11,
  ERROR_FRAGMENTED_POOL = -12,
  ERROR_UNKNOWN = -13,
  ERROR_OUT_OF_POOL_MEMORY = -1000069000,
  ERROR_INVALID_EXTERNAL_HANDLE = -1000072003,
  ERROR_FRAGMENTATION = -1000161000,
  ERROR_INVALID_OPAQUE_CAPTURE_ADDRESS = -1000257000,
  PIPELINE_COMPILE_REQUIRED = 1000297000,
  ERROR_SURFACE_LOST_KHR = -1000000000,
  ERROR_NATIVE_WINDOW_IN_USE_KHR = -1000000001,
  SUBOPTIMAL_KHR = 1000001003,
  ERROR_OUT_OF_DATE_KHR = -1000001004,
  ERROR_INCOMPATIBLE_DISPLAY_KHR = -1000003001,
  ERROR_VALIDATION_FAILED_EXT = -1000011001,
  ERROR_INVALID_SHADER_NV = -1000012000,
  ERROR_COMPRESSION_EXHAUSTED_EXT = -1000338000,
}

/**
 * Structure type enumerant.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkStructureType.html
 */
export enum Vk_StructureType {
  // MARK: VK 1.0
  APPLICATION_INFO = 0,
  INSTANCE_CREATE_INFO = 1,
  DEVICE_QUEUE_CREATE_INFO = 2,
  DEVICE_CREATE_INFO = 3,
  SUBMIT_INFO = 4,
  MEMORY_ALLOCATE_INFO = 5,
  MAPPED_MEMORY_RANGE = 6,
  BIND_SPARSE_INFO = 7,
  FENCE_CREATE_INFO = 8,
  SEMAPHORE_CREATE_INFO = 9,
  EVENT_CREATE_INFO = 10,
  QUERY_POOL_CREATE_INFO = 11,
  BUFFER_CREATE_INFO = 12,
  BUFFER_VIEW_CREATE_INFO = 13,
  IMAGE_CREATE_INFO = 14,
  IMAGE_VIEW_CREATE_INFO = 15,
  SHADER_MODULE_CREATE_INFO = 16,
  PIPELINE_CACHE_CREATE_INFO = 17,
  PIPELINE_SHADER_STAGE_CREATE_INFO = 18,
  PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO = 19,
  PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO = 20,
  PIPELINE_TESSELLATION_STATE_CREATE_INFO = 21,
  PIPELINE_VIEWPORT_STATE_CREATE_INFO = 22,
  PIPELINE_RASTERIZATION_STATE_CREATE_INFO = 23,
  PIPELINE_MULTISAMPLE_STATE_CREATE_INFO = 24,
  PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO = 25,
  PIPELINE_COLOR_BLEND_STATE_CREATE_INFO = 26,
  PIPELINE_DYNAMIC_STATE_CREATE_INFO = 27,
  GRAPHICS_PIPELINE_CREATE_INFO = 28,
  COMPUTE_PIPELINE_CREATE_INFO = 29,
  PIPELINE_LAYOUT_CREATE_INFO = 30,
  SAMPLER_CREATE_INFO = 31,
  DESCRIPTOR_SET_LAYOUT_CREATE_INFO = 32,
  DESCRIPTOR_POOL_CREATE_INFO = 33,
  DESCRIPTOR_SET_ALLOCATE_INFO = 34,
  WRITE_DESCRIPTOR_SET = 35,
  COPY_DESCRIPTOR_SET = 36,
  FRAMEBUFFER_CREATE_INFO = 37,
  RENDER_PASS_CREATE_INFO = 38,
  COMMAND_POOL_CREATE_INFO = 39,
  COMMAND_BUFFER_ALLOCATE_INFO = 40,
  COMMAND_BUFFER_INHERITANCE_INFO = 41,
  COMMAND_BUFFER_BEGIN_INFO = 42,
  RENDER_PASS_BEGIN_INFO = 43,
  BUFFER_MEMORY_BARRIER = 44,
  IMAGE_MEMORY_BARRIER = 45,
  MEMORY_BARRIER = 46,

  // MARK: VK 1.0 - KHR Extensions
  SWAPCHAIN_CREATE_INFO_KHR = 1000001000,
  PRESENT_INFO_KHR = 1000001001,
  XLIB_SURFACE_CREATE_INFO_KHR = 1000004000,
  XCB_SURFACE_CREATE_INFO_KHR = 1000005000,
  WAYLAND_SURFACE_CREATE_INFO_KHR = 1000006000,
  WIN32_SURFACE_CREATE_INFO_KHR = 1000009000,

  // MARK: VK 1.1
  QUEUE_FAMILY_PROPERTIES_2 = 1000059005,

  // MARK: VK 1.1 - EXT Extensions
  METAL_SURFACE_CREATE_INFO_EXT = 1000217000,
}

/**
 * Available image formats.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFormat.html
 */
export enum Vk_Format {
  UNDEFINED = 0,
  R4G4_UNORM_PACK8 = 1,
  R4G4B4A4_UNORM_PACK16 = 2,
  B4G4R4A4_UNORM_PACK16 = 3,
  R5G6B5_UNORM_PACK16 = 4,
  B5G6R5_UNORM_PACK16 = 5,
  R5G5B5A1_UNORM_PACK16 = 6,
  B5G5R5A1_UNORM_PACK16 = 7,
  A1R5G5B5_UNORM_PACK16 = 8,
  R8_UNORM = 9,
  R8_SNORM = 10,
  R8_USCALED = 11,
  R8_SSCALED = 12,
  R8_UINT = 13,
  R8_SINT = 14,
  R8_SRGB = 15,
  R8G8_UNORM = 16,
  R8G8_SNORM = 17,
  R8G8_USCALED = 18,
  R8G8_SSCALED = 19,
  R8G8_UINT = 20,
  R8G8_SINT = 21,
  R8G8_SRGB = 22,
  R8G8B8_UNORM = 23,
  R8G8B8_SNORM = 24,
  R8G8B8_USCALED = 25,
  R8G8B8_SSCALED = 26,
  R8G8B8_UINT = 27,
  R8G8B8_SINT = 28,
  R8G8B8_SRGB = 29,
  B8G8R8_UNORM = 30,
  B8G8R8_SNORM = 31,
  B8G8R8_USCALED = 32,
  B8G8R8_SSCALED = 33,
  B8G8R8_UINT = 34,
  B8G8R8_SINT = 35,
  B8G8R8_SRGB = 36,
  R8G8B8A8_UNORM = 37,
  R8G8B8A8_SNORM = 38,
  R8G8B8A8_USCALED = 39,
  R8G8B8A8_SSCALED = 40,
  R8G8B8A8_UINT = 41,
  R8G8B8A8_SINT = 42,
  R8G8B8A8_SRGB = 43,
  B8G8R8A8_UNORM = 44,
  B8G8R8A8_SNORM = 45,
  B8G8R8A8_USCALED = 46,
  B8G8R8A8_SSCALED = 47,
  B8G8R8A8_UINT = 48,
  B8G8R8A8_SINT = 49,
  B8G8R8A8_SRGB = 50,
  D16_UNORM = 124,
  D32_SFLOAT = 126,
  D16_UNORM_S8_UINT = 128,
  D24_UNORM_S8_UINT = 129,
  D32_SFLOAT_S8_UINT = 130,
}

/**
 * Layout of image and image subresources.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageLayout.html
 */
export enum Vk_ImageLayout {
  UNDEFINED = 0,
  GENERAL = 1,
  COLOR_ATTACHMENT_OPTIMAL = 2,
  DEPTH_STENCIL_ATTACHMENT_OPTIMAL = 3,
  DEPTH_STENCIL_READ_ONLY_OPTIMAL = 4,
  SHADER_READ_ONLY_OPTIMAL = 5,
  TRANSFER_SRC_OPTIMAL = 6,
  TRANSFER_DST_OPTIMAL = 7,
  PREINITIALIZED = 8,
  PRESENT_SRC_KHR = 1000001002,
}

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

/**
 * Presentation mode supported for a surface.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPresentModeKHR.html
 */
export enum Vk_PresentModeKHR {
  IMMEDIATE_KHR = 0,
  MAILBOX_KHR = 1,
  FIFO_KHR = 2,
  FIFO_RELAXED_KHR = 3,
}

/**
 * Supported color space of the presentation engine.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkColorSpaceKHR.html
 */
export enum Vk_ColorSpaceKHR {
  SRGB_NONLINEAR_KHR = 0,
  DISPLAY_P3_NONLINEAR_EXT = 1000104001,
  EXTENDED_SRGB_LINEAR_EXT = 1000104002,
  DISPLAY_P3_LINEAR_EXT = 1000104003,
  DCI_P3_NONLINEAR_EXT = 1000104004,
  BT709_LINEAR_EXT = 1000104005,
  BT709_NONLINEAR_EXT = 1000104006,
  BT2020_LINEAR_EXT = 1000104007,
  HDR10_ST2084_EXT = 1000104008,
  DOLBYVISION_EXT = 1000104009,
  HDR10_HLG_EXT = 1000104010,
  ADOBERGB_LINEAR_EXT = 1000104011,
  ADOBERGB_NONLINEAR_EXT = 1000104012,
  PASS_THROUGH_EXT = 1000104013,
  EXTENDED_SRGB_NONLINEAR_EXT = 1000104014,
}

/**
 * Specifies the type of an image object.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageType.html
 */
export enum Vk_ImageType {
  TYPE_1D = 0,
  TYPE_2D = 1,
  TYPE_3D = 2,
}

/**
 * Image view types.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageViewType.html
 */
export enum Vk_ImageViewType {
  TYPE_1D = 0,
  TYPE_2D = 1,
  TYPE_3D = 2,
  CUBE = 3,
  ARRAY_1D = 4,
  ARRAY_2D = 5,
  CUBE_ARRAY = 6,
}

/**
 * Bitmask specifying sample counts supported for an image used for storage operations.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSampleCountFlagBits.html
 */
export enum Vk_SampleCountFlagBits {
  COUNT_1_BIT = 0x00000001,
  COUNT_2_BIT = 0x00000002,
  COUNT_4_BIT = 0x00000004,
  COUNT_8_BIT = 0x00000008,
  COUNT_16_BIT = 0x00000010,
  COUNT_32_BIT = 0x00000020,
  COUNT_64_BIT = 0x00000040,
}

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

/**
 * Supported primitive topologies.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPrimitiveTopology.html
 */
export enum Vk_PrimitiveTopology {
  POINT_LIST = 0,
  LINE_LIST = 1,
  LINE_STRIP = 2,
  TRIANGLE_LIST = 3,
  TRIANGLE_STRIP = 4,
  TRIANGLE_FAN = 5,
  LINE_LIST_WITH_ADJACENCY = 6,
  LINE_STRIP_WITH_ADJACENCY = 7,
  TRIANGLE_LIST_WITH_ADJACENCY = 8,
  TRIANGLE_STRIP_WITH_ADJACENCY = 9,
  PATCH_LIST = 10,
}

/**
 * Stencil comparison function.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCompareOp.html
 */
export enum Vk_CompareOp {
  NEVER = 0,
  LESS = 1,
  EQUAL = 2,
  LESS_OR_EQUAL = 3,
  GREATER = 4,
  NOT_EQUAL = 5,
  GREATER_OR_EQUAL = 6,
  ALWAYS = 7,
}

/**
 * Framebuffer blending factors.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBlendFactor.html
 */
export enum Vk_BlendFactor {
  ZERO = 0,
  ONE = 1,
  SRC_COLOR = 2,
  ONE_MINUS_SRC_COLOR = 3,
  DST_COLOR = 4,
  ONE_MINUS_DST_COLOR = 5,
  SRC_ALPHA = 6,
  ONE_MINUS_SRC_ALPHA = 7,
  DST_ALPHA = 8,
  ONE_MINUS_DST_ALPHA = 9,
  CONSTANT_COLOR = 10,
  ONE_MINUS_CONSTANT_COLOR = 11,
  CONSTANT_ALPHA = 12,
  ONE_MINUS_CONSTANT_ALPHA = 13,
  SRC_ALPHA_SATURATE = 14,
  SRC1_COLOR = 15,
  ONE_MINUS_SRC1_COLOR = 16,
  SRC1_ALPHA = 17,
  ONE_MINUS_SRC1_ALPHA = 18,
}

/**
 * Framebuffer blending operations.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBlendOp.html
 */
export enum Vk_BlendOp {
  ADD = 0,
  SUBTRACT = 1,
  REVERSE_SUBTRACT = 2,
  MIN = 3,
  MAX = 4,
}

/**
 * Specify how contents of an attachment are treated at the beginning of a subpass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentLoadOp.html
 */
export enum Vk_AttachmentLoadOp {
  LOAD = 0,
  CLEAR = 1,
  DONT_CARE = 2,
}

/**
 * Specify how contents of an attachment are treated at the end of a subpass.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentStoreOp.html
 */
export enum Vk_AttachmentStoreOp {
  STORE = 0,
  DONT_CARE = 1,
}

/**
 * Enumerant specifying a command buffer level.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandBufferLevel.html
 */
export enum Vk_CommandBufferLevel {
  PRIMARY = 0,
  SECONDARY = 1,
}

/**
 * Type of index buffer indices.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkIndexType.html
 */
export enum Vk_IndexType {
  UINT16 = 0,
  UINT32 = 1,
  UINT8_EXT = 1000265000,
}

/**
 * Specify filters used for texture lookups.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFilter.html
 */
export enum Vk_Filter {
  NEAREST = 0,
  LINEAR = 1,
  CUBIC_IMG = 1000015000,
}

/**
 * Specify mipmap mode used for texture lookups.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSamplerMipmapMode.html
 */
export enum Vk_SamplerMipmapMode {
  NEAREST = 0,
  LINEAR = 1,
}

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

/**
 * Specifies the type of a descriptor in a descriptor set.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorType.html
 */
export enum Vk_DescriptorType {
  SAMPLER = 0,
  COMBINED_IMAGE_SAMPLER = 1,
  SAMPLED_IMAGE = 2,
  STORAGE_IMAGE = 3,
  UNIFORM_TEXEL_BUFFER = 4,
  STORAGE_TEXEL_BUFFER = 5,
  UNIFORM_BUFFER = 6,
  STORAGE_BUFFER = 7,
  UNIFORM_BUFFER_DYNAMIC = 8,
  STORAGE_BUFFER_DYNAMIC = 9,
  INPUT_ATTACHMENT = 10,
}

/**
 * Specify the type of queries managed by a query pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkQueryType.html
 */
export enum Vk_QueryType {
  OCCLUSION = 0,
  PIPELINE_STATISTICS = 1,
  TIMESTAMP = 2,
}

/**
 * Specify how commands in the first subpass of a render pass are provided.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassContents.html
 */
export enum Vk_SubpassContents {
  INLINE = 0,
  SECONDARY_COMMAND_BUFFERS = 1,
}

/**
 * Specify a component swizzle.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkComponentSwizzle.html
 */
export enum Vk_ComponentSwizzle {
  IDENTITY = 0,
  ZERO = 1,
  ONE = 2,
  R = 3,
  G = 4,
  B = 5,
  A = 6,
}

/**
 * Bitmask controlling triangle culling.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCullModeFlagBits.html
 */
export enum Vk_CullModeFlagBits {
  NONE = 0,
  FRONT_BIT = 0x00000001,
  BACK_BIT = 0x00000002,
  FRONT_AND_BACK = 0x00000003,
}

/**
 * Interpret polygon front-facing orientation.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFrontFace.html
 */
export enum Vk_FrontFace {
  COUNTER_CLOCKWISE = 0,
  CLOCKWISE = 1,
}

/**
 * Control polygon rasterization mode.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPolygonMode.html
 */
export enum Vk_PolygonMode {
  FILL = 0,
  LINE = 1,
  POINT = 2,
}

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

/**
 * Specify rate at which vertex attributes are pulled from buffers.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkVertexInputRate.html
 */
export enum Vk_VertexInputRate {
  VERTEX = 0,
  INSTANCE = 1,
}

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

/**
 * Buffer and image sharing modes.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSharingMode.html
 */
export enum Vk_SharingMode {
  EXCLUSIVE = 0,
  CONCURRENT = 1,
}

/**
 * Specifies the tiling arrangement of data in an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageTiling.html
 */
export enum Vk_ImageTiling {
  OPTIMAL = 0,
  LINEAR = 1,
}

/**
 * Bitmask specifying which aspects of an image are included in a view.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageAspectFlagBits.html
 */
export enum Vk_ImageAspectFlagBits {
  COLOR_BIT = 0x00000001,
  DEPTH_BIT = 0x00000002,
  STENCIL_BIT = 0x00000004,
  METADATA_BIT = 0x00000008,
}

/**
 * Bitmask specifying properties for a memory type.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryPropertyFlagBits.html
 */
export enum Vk_MemoryPropertyFlagBits {
  DEVICE_LOCAL_BIT = 0x00000001,
  HOST_VISIBLE_BIT = 0x00000002,
  HOST_COHERENT_BIT = 0x00000004,
  HOST_CACHED_BIT = 0x00000008,
  LAZILY_ALLOCATED_BIT = 0x00000010,
}

/**
 * Bitmask specifying allowed usage of a buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkBufferUsageFlagBits.html
 */
export enum Vk_BufferUsageFlagBits {
  TRANSFER_SRC_BIT = 0x00000001,
  TRANSFER_DST_BIT = 0x00000002,
  UNIFORM_TEXEL_BUFFER_BIT = 0x00000004,
  STORAGE_TEXEL_BUFFER_BIT = 0x00000008,
  UNIFORM_BUFFER_BIT = 0x00000010,
  STORAGE_BUFFER_BIT = 0x00000020,
  INDEX_BUFFER_BIT = 0x00000040,
  VERTEX_BUFFER_BIT = 0x00000080,
  INDIRECT_BUFFER_BIT = 0x00000100,
}

/**
 * Bitmask specifying intended usage of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageUsageFlagBits.html
 */
export enum Vk_ImageUsageFlagBits {
  TRANSFER_SRC_BIT = 0x00000001,
  TRANSFER_DST_BIT = 0x00000002,
  SAMPLED_BIT = 0x00000004,
  STORAGE_BIT = 0x00000008,
  COLOR_ATTACHMENT_BIT = 0x00000010,
  DEPTH_STENCIL_ATTACHMENT_BIT = 0x00000020,
  TRANSIENT_ATTACHMENT_BIT = 0x00000040,
  INPUT_ATTACHMENT_BIT = 0x00000080,
}

/**
 * Bitmask specifying pipeline stages.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineStageFlagBits.html
 */
export enum Vk_PipelineStageFlagBits {
  TOP_OF_PIPE_BIT = 0x00000001,
  DRAW_INDIRECT_BIT = 0x00000002,
  VERTEX_INPUT_BIT = 0x00000004,
  VERTEX_SHADER_BIT = 0x00000008,
  TESSELLATION_CONTROL_SHADER_BIT = 0x00000010,
  TESSELLATION_EVALUATION_SHADER_BIT = 0x00000020,
  GEOMETRY_SHADER_BIT = 0x00000040,
  FRAGMENT_SHADER_BIT = 0x00000080,
  EARLY_FRAGMENT_TESTS_BIT = 0x00000100,
  LATE_FRAGMENT_TESTS_BIT = 0x00000200,
  COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400,
  COMPUTE_SHADER_BIT = 0x00000800,
  TRANSFER_BIT = 0x00001000,
  BOTTOM_OF_PIPE_BIT = 0x00002000,
  HOST_BIT = 0x00004000,
  ALL_GRAPHICS_BIT = 0x00008000,
  ALL_COMMANDS_BIT = 0x00010000,
}

/**
 * Bitmask specifying memory access types that will participate in a memory dependency.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAccessFlagBits.html
 */
export enum Vk_AccessFlagBits {
  INDIRECT_COMMAND_READ_BIT = 0x00000001,
  INDEX_READ_BIT = 0x00000002,
  VERTEX_ATTRIBUTE_READ_BIT = 0x00000004,
  UNIFORM_READ_BIT = 0x00000008,
  INPUT_ATTACHMENT_READ_BIT = 0x00000010,
  SHADER_READ_BIT = 0x00000020,
  SHADER_WRITE_BIT = 0x00000040,
  COLOR_ATTACHMENT_READ_BIT = 0x00000080,
  COLOR_ATTACHMENT_WRITE_BIT = 0x00000100,
  DEPTH_STENCIL_ATTACHMENT_READ_BIT = 0x00000200,
  DEPTH_STENCIL_ATTACHMENT_WRITE_BIT = 0x00000400,
  TRANSFER_READ_BIT = 0x00000800,
  TRANSFER_WRITE_BIT = 0x00001000,
  HOST_READ_BIT = 0x00002000,
  HOST_WRITE_BIT = 0x00004000,
  MEMORY_READ_BIT = 0x00008000,
  MEMORY_WRITE_BIT = 0x00010000,
}

/**
 * Bitmask specifying capabilities of queues in a queue family.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkQueueFlagBits.html
 */
export enum Vk_QueueFlagBits {
  GRAPHICS_BIT = 0x00000001,
  COMPUTE_BIT = 0x00000002,
  TRANSFER_BIT = 0x00000004,
  SPARSE_BINDING_BIT = 0x00000008,
  PROTECTED_BIT = 0x00000010,
}

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

/**
 * Bitmask controlling which components are written to the framebuffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkColorComponentFlagBits.html
 */
export enum Vk_ColorComponentFlagBits {
  R_BIT = 0x00000001,
  G_BIT = 0x00000002,
  B_BIT = 0x00000004,
  A_BIT = 0x00000008,
}

/**
 * Bitmask specifying additional parameters of an image.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkImageCreateFlagBits.html
 */
export enum Vk_ImageCreateFlagBits {
  SPARSE_BINDING_BIT = 0x00000001,
  SPARSE_RESIDENCY_BIT = 0x00000002,
  SPARSE_ALIASED_BIT = 0x00000004,
  MUTABLE_FORMAT_BIT = 0x00000008,
  CUBE_COMPATIBLE_BIT = 0x00000010,
}

/**
 * Bitmask specifying initial state and behavior of a fence.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFenceCreateFlagBits.html
 */
export enum Vk_FenceCreateFlagBits {
  SIGNALED_BIT = 0x00000001,
}

/**
 * Bitmask specifying usage behavior for a command pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandPoolCreateFlagBits.html
 */
export enum Vk_CommandPoolCreateFlagBits {
  TRANSIENT_BIT = 0x00000001,
  RESET_COMMAND_BUFFER_BIT = 0x00000002,
  PROTECTED_BIT = 0x00000004,
}

/**
 * Bitmask specifying usage behavior for command buffer.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCommandBufferUsageFlagBits.html
 */
export enum Vk_CommandBufferUsageFlagBits {
  ONE_TIME_SUBMIT_BIT = 0x00000001,
  RENDER_PASS_CONTINUE_BIT = 0x00000002,
  SIMULTANEOUS_USE_BIT = 0x00000004,
}

/**
 * Bitmask specifying certain supported operations on a descriptor pool.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDescriptorPoolCreateFlagBits.html
 */
export enum Vk_DescriptorPoolCreateFlagBits {
  FREE_DESCRIPTOR_SET_BIT = 0x00000001,
  UPDATE_AFTER_BIND_BIT = 0x00000002,
}

/**
 * Bitmask specifying additional properties of an attachment.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkAttachmentDescriptionFlagBits.html
 */
export enum Vk_AttachmentDescriptionFlagBits {
  MAY_ALIAS_BIT = 0x00000001,
}

/**
 * Bitmask specifying how execution and memory dependencies are formed.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkDependencyFlagBits.html
 */
export enum Vk_DependencyFlagBits {
  BY_REGION_BIT = 0x00000001,
  DEVICE_GROUP_BIT = 0x00000004,
  VIEW_LOCAL_BIT = 0x00000002,
}

/**
 * Alpha compositing modes supported on a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkCompositeAlphaFlagBitsKHR.html
 */
export enum Vk_CompositeAlphaFlagBitsKHR {
  OPAQUE_BIT_KHR = 0x00000001,
  PRE_MULTIPLIED_BIT_KHR = 0x00000002,
  POST_MULTIPLIED_BIT_KHR = 0x00000004,
  INHERIT_BIT_KHR = 0x00000008,
}

/**
 * Presentation transforms supported on a device.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSurfaceTransformFlagBitsKHR.html
 */
export enum Vk_SurfaceTransformFlagBitsKHR {
  IDENTITY_BIT_KHR = 0x00000001,
  ROTATE_90_BIT_KHR = 0x00000002,
  ROTATE_180_BIT_KHR = 0x00000004,
  ROTATE_270_BIT_KHR = 0x00000008,
  HORIZONTAL_MIRROR_BIT_KHR = 0x00000010,
  HORIZONTAL_MIRROR_ROTATE_90_BIT_KHR = 0x00000020,
  HORIZONTAL_MIRROR_ROTATE_180_BIT_KHR = 0x00000040,
  HORIZONTAL_MIRROR_ROTATE_270_BIT_KHR = 0x00000080,
  INHERIT_BIT_KHR = 0x00000100,
}

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

/**
 * Bitmask specifying memory heap properties.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkMemoryHeapFlagBits.html
 */
export enum Vk_MemoryHeapFlagBits {
  DEVICE_LOCAL_BIT = 0x00000001,
  MULTI_INSTANCE_BIT = 0x00000002,
}

/**
 * Bitmask specifying subpass description flags.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassDescriptionFlagBits.html
 */
export enum Vk_SubpassDescriptionFlagBits {
  PER_VIEW_ATTRIBUTES_BIT_NVX = 0x00000001,
  PER_VIEW_POSITION_X_ONLY_BIT_NVX = 0x00000002,
}

/**
 * Bitmask specifying supported buffer features.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFormatFeatureFlagBits.html
 */
export enum Vk_FormatFeatureFlagBits {
  SAMPLED_IMAGE_BIT = 0x00000001,
  STORAGE_IMAGE_BIT = 0x00000002,
  STORAGE_IMAGE_ATOMIC_BIT = 0x00000004,
  UNIFORM_TEXEL_BUFFER_BIT = 0x00000008,
  STORAGE_TEXEL_BUFFER_BIT = 0x00000010,
  STORAGE_TEXEL_BUFFER_ATOMIC_BIT = 0x00000020,
  VERTEX_BUFFER_BIT = 0x00000040,
  COLOR_ATTACHMENT_BIT = 0x00000080,
  COLOR_ATTACHMENT_BLEND_BIT = 0x00000100,
  DEPTH_STENCIL_ATTACHMENT_BIT = 0x00000200,
  BLIT_SRC_BIT = 0x00000400,
  BLIT_DST_BIT = 0x00000800,
  SAMPLED_IMAGE_FILTER_LINEAR_BIT = 0x00001000,
}

/**
 * Bitmask specifying pipeline stages.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkPipelineStageFlagBits.html
 */
export enum Vk_PipelineStageFlagBits {
  TOP_OF_PIPE_BIT = 0x00000001,
  DRAW_INDIRECT_BIT = 0x00000002,
  VERTEX_INPUT_BIT = 0x00000004,
  VERTEX_SHADER_BIT = 0x00000008,
  TESSELLATION_CONTROL_SHADER_BIT = 0x00000010,
  TESSELLATION_EVALUATION_SHADER_BIT = 0x00000020,
  GEOMETRY_SHADER_BIT = 0x00000040,
  FRAGMENT_SHADER_BIT = 0x00000080,
  EARLY_FRAGMENT_TESTS_BIT = 0x00000100,
  LATE_FRAGMENT_TESTS_BIT = 0x00000200,
  COLOR_ATTACHMENT_OUTPUT_BIT = 0x00000400,
  COMPUTE_SHADER_BIT = 0x00000800,
  TRANSFER_BIT = 0x00001000,
  BOTTOM_OF_PIPE_BIT = 0x00002000,
  HOST_BIT = 0x00004000,
  ALL_GRAPHICS_BIT = 0x00008000,
  ALL_COMMANDS_BIT = 0x00010000,
}

/**
 * Specify how commands in the first subpass of a render pass are provided.
 *
 * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkSubpassContents.html
 */
export enum Vk_SubpassContents {
  INLINE = 0,
  SECONDARY_COMMAND_BUFFERS = 1,
}
