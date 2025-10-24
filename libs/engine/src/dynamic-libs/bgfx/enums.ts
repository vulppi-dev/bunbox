// BGFX MARK: Fatal

export enum Fatal {
  /** Debug check. */
  DEBUG_CHECK = 0,

  /** Invalid shader. */
  INVALID_SHADER = 1,

  /** Unable to initialize. */
  UNABLE_TO_INITIALIZE = 2,

  /** Unable to create texture. */
  UNABLE_TO_CREATE_TEXTURE = 3,

  /** Device lost. */
  DEVICE_LOST = 4,

  COUNT = 5,
}

// BGFX MARK: Renderer Type

export enum RendererType {
  /** No rendering. */
  NOOP = 0,

  /** AGC */
  AGC = 1,

  /** Direct3D 11.0 */
  DIRECT3D11 = 2,

  /** Direct3D 12.0 */
  DIRECT3D12 = 3,

  /** GNM */
  GNM = 4,

  /** Metal */
  METAL = 5,

  /** NVN */
  NVN = 6,

  /** OpenGL ES 2.0+ */
  OPENGLES = 7,

  /** OpenGL 2.1+ */
  OPENGL = 8,

  /** Vulkan */
  VULKAN = 9,

  COUNT = 10,
}

// BGFX MARK: Access

export enum Access {
  /** Read. */
  READ = 0,

  /** Write. */
  WRITE = 1,

  /** Read and write. */
  READWRITE = 2,

  COUNT = 3,
}

// BGFX MARK: Attrib

export enum Attrib {
  /** a_position */
  POSITION = 0,

  /** a_normal */
  NORMAL = 1,

  /** a_tangent */
  TANGENT = 2,

  /** a_bitangent */
  BITANGENT = 3,

  /** a_color0 */
  COLOR0 = 4,

  /** a_color1 */
  COLOR1 = 5,

  /** a_color2 */
  COLOR2 = 6,

  /** a_color3 */
  COLOR3 = 7,

  /** a_indices */
  INDICES = 8,

  /** a_weight */
  WEIGHT = 9,

  /** a_texcoord0 */
  TEXCOORD0 = 10,

  /** a_texcoord1 */
  TEXCOORD1 = 11,

  /** a_texcoord2 */
  TEXCOORD2 = 12,

  /** a_texcoord3 */
  TEXCOORD3 = 13,

  /** a_texcoord4 */
  TEXCOORD4 = 14,

  /** a_texcoord5 */
  TEXCOORD5 = 15,

  /** a_texcoord6 */
  TEXCOORD6 = 16,

  /** a_texcoord7 */
  TEXCOORD7 = 17,

  COUNT = 18,
}

// BGFX MARK: Attrib Type

export enum AttribType {
  /** Uint8 */
  UINT8 = 0,

  /** Uint10, availability depends on: BGFX_CAPS_VERTEX_ATTRIB_UINT10. */
  UINT10 = 1,

  /** Int16 */
  INT16 = 2,

  /** Half, availability depends on: BGFX_CAPS_VERTEX_ATTRIB_HALF. */
  HALF = 3,

  /** Float */
  FLOAT = 4,

  COUNT = 5,
}

// BGFX MARK: Texture Format

export enum TextureFormat {
  /** DXT1 R5G6B5A1 */
  BC1 = 0,

  /** DXT3 R5G6B5A4 */
  BC2 = 1,

  /** DXT5 R5G6B5A8 */
  BC3 = 2,

  /** LATC1/ATI1 R8 */
  BC4 = 3,

  /** LATC2/ATI2 RG8 */
  BC5 = 4,

  /** BC6H RGB16F */
  BC6H = 5,

  /** BC7 RGB 4-7 bits per color channel, 0-8 bits alpha */
  BC7 = 6,

  /** ETC1 RGB8 */
  ETC1 = 7,

  /** ETC2 RGB8 */
  ETC2 = 8,

  /** ETC2 RGBA8 */
  ETC2A = 9,

  /** ETC2 RGB8A1 */
  ETC2A1 = 10,

  /** PTC 12 */
  PTC12 = 11,

  /** PTC 14 */
  PTC14 = 12,

  /** PTC 12 Alpha */
  PTC12A = 13,

  /** PTC 14 Alpha */
  PTC14A = 14,

  /** PTC 22 */
  PTC22 = 15,

  /** PTC 24 */
  PTC24 = 16,

  /** ATC RGB 4BPP */
  ATC = 17,

  /** ATCE RGBA 8 BPP explicit alpha */
  ATCE = 18,

  /** ATCI RGBA 8 BPP interpolated alpha */
  ATCI = 19,

  /** ASTC 4x4 8.0 BPP */
  ASTC4X4 = 20,

  /** ASTC 5x4 6.40 BPP */
  ASTC5X4 = 21,

  /** ASTC 5x5 5.12 BPP */
  ASTC5X5 = 22,

  /** ASTC 6x5 4.27 BPP */
  ASTC6X5 = 23,

  /** ASTC 6x6 3.56 BPP */
  ASTC6X6 = 24,

  /** ASTC 8x5 3.20 BPP */
  ASTC8X5 = 25,

  /** ASTC 8x6 2.67 BPP */
  ASTC8X6 = 26,

  /** ASTC 8x8 2.00 BPP */
  ASTC8X8 = 27,

  /** ASTC 10x5 2.56 BPP */
  ASTC10X5 = 28,

  /** ASTC 10x6 2.13 BPP */
  ASTC10X6 = 29,

  /** ASTC 10x8 1.60 BPP */
  ASTC10X8 = 30,

  /** ASTC 10x10 1.28 BPP */
  ASTC10X10 = 31,

  /** ASTC 12x10 1.07 BPP */
  ASTC12X10 = 32,

  /** ASTC 12x12 0.89 BPP */
  ASTC12X12 = 33,

  /** Compressed formats above. */
  UNKNOWN = 34,

  R1 = 35,
  A8 = 36,
  R8 = 37,
  R8I = 38,
  R8U = 39,
  R8S = 40,
  R16 = 41,
  R16I = 42,
  R16U = 43,
  R16F = 44,
  R16S = 45,
  R32I = 46,
  R32U = 47,
  R32F = 48,
  RG8 = 49,
  RG8I = 50,
  RG8U = 51,
  RG8S = 52,
  RG16 = 53,
  RG16I = 54,
  RG16U = 55,
  RG16F = 56,
  RG16S = 57,
  RG32I = 58,
  RG32U = 59,
  RG32F = 60,
  RGB8 = 61,
  RGB8I = 62,
  RGB8U = 63,
  RGB8S = 64,
  RGB9E5F = 65,
  BGRA8 = 66,
  RGBA8 = 67,
  RGBA8I = 68,
  RGBA8U = 69,
  RGBA8S = 70,
  RGBA16 = 71,
  RGBA16I = 72,
  RGBA16U = 73,
  RGBA16F = 74,
  RGBA16S = 75,
  RGBA32I = 76,
  RGBA32U = 77,
  RGBA32F = 78,
  B5G6R5 = 79,
  R5G6B5 = 80,
  BGRA4 = 81,
  RGBA4 = 82,
  BGR5A1 = 83,
  RGB5A1 = 84,
  RGB10A2 = 85,
  RG11B10F = 86,

  /** Depth formats below. */
  UNKNOWN_DEPTH = 87,

  D16 = 88,
  D24 = 89,
  D24S8 = 90,
  D32 = 91,
  D16F = 92,
  D24F = 93,
  D32F = 94,
  D0S8 = 95,

  COUNT = 96,
}

// BGFX MARK: Uniform Type

export enum UniformType {
  /** Sampler. */
  SAMPLER = 0,

  /** Reserved, do not use. */
  END = 1,

  /** 4 floats vector. */
  VEC4 = 2,

  /** 3x3 matrix. */
  MAT3 = 3,

  /** 4x4 matrix. */
  MAT4 = 4,

  COUNT = 5,
}

// BGFX MARK: Backbuffer Ratio

export enum BackbufferRatio {
  /** Equal to backbuffer. */
  EQUAL = 0,

  /** One half size of backbuffer. */
  HALF = 1,

  /** One quarter size of backbuffer. */
  QUARTER = 2,

  /** One eighth size of backbuffer. */
  EIGHTH = 3,

  /** One sixteenth size of backbuffer. */
  SIXTEENTH = 4,

  /** Double size of backbuffer. */
  DOUBLE = 5,

  COUNT = 6,
}

// BGFX MARK: Occlusion Query Result

export enum OcclusionQueryResult {
  /** Query failed test. */
  INVISIBLE = 0,

  /** Query passed test. */
  VISIBLE = 1,

  /** Query result is not available yet. */
  NO_RESULT = 2,

  COUNT = 3,
}

// BGFX MARK: Topology

export enum Topology {
  /** Triangle list. */
  TRI_LIST = 0,

  /** Triangle strip. */
  TRI_STRIP = 1,

  /** Line list. */
  LINE_LIST = 2,

  /** Line strip. */
  LINE_STRIP = 3,

  /** Point list. */
  POINT_LIST = 4,

  COUNT = 5,
}

// BGFX MARK: Topology Convert

export enum TopologyConvert {
  /** Flip winding order of triangle list. */
  TRI_LIST_FLIP_WINDING = 0,

  /** Flip winding order of triangle strip. */
  TRI_STRIP_FLIP_WINDING = 1,

  /** Convert triangle list to line list. */
  TRI_LIST_TO_LINE_LIST = 2,

  /** Convert triangle strip to triangle list. */
  TRI_STRIP_TO_TRI_LIST = 3,

  /** Convert line strip to line list. */
  LINE_STRIP_TO_LINE_LIST = 4,

  COUNT = 5,
}

// BGFX MARK: Topology Sort

export enum TopologySort {
  DIRECTION_FRONT_TO_BACK_MIN = 0,
  DIRECTION_FRONT_TO_BACK_AVG = 1,
  DIRECTION_FRONT_TO_BACK_MAX = 2,
  DIRECTION_BACK_TO_FRONT_MIN = 3,
  DIRECTION_BACK_TO_FRONT_AVG = 4,
  DIRECTION_BACK_TO_FRONT_MAX = 5,
  DISTANCE_FRONT_TO_BACK_MIN = 6,
  DISTANCE_FRONT_TO_BACK_AVG = 7,
  DISTANCE_FRONT_TO_BACK_MAX = 8,
  DISTANCE_BACK_TO_FRONT_MIN = 9,
  DISTANCE_BACK_TO_FRONT_AVG = 10,
  DISTANCE_BACK_TO_FRONT_MAX = 11,

  COUNT = 12,
}

// BGFX MARK: View Mode

export enum ViewMode {
  /** Default sort order. */
  DEFAULT = 0,

  /** Sort in the same order in which submit calls were called. */
  SEQUENTIAL = 1,

  /** Sort draw call depth in ascending order. */
  DEPTH_ASCENDING = 2,

  /** Sort draw call depth in descending order. */
  DEPTH_DESCENDING = 3,

  COUNT = 4,
}

// BGFX MARK: Native Window Handle Type

export enum NativeWindowHandleType {
  /** Platform default handle type (X11 on Linux). */
  DEFAULT = 0,

  /** Wayland. */
  WAYLAND = 1,

  COUNT = 2,
}

// BGFX MARK: Render Frame

export enum RenderFrame {
  /** Renderer context is not created yet. */
  NO_CONTEXT = 0,

  /** Renderer context is created and rendering. */
  RENDER = 1,

  /** Renderer context wait for main thread signal timed out without rendering. */
  TIMEOUT = 2,

  /** Renderer context is getting destroyed. */
  EXITING = 3,

  COUNT = 4,
}
