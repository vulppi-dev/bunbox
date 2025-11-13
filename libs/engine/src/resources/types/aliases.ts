/**
 * Comparison function used in depth testing, stencil operations, and sampler compare modes.
 */
export type CompareFunction =
  | 'never'
  | 'less'
  | 'less-equal'
  | 'greater'
  | 'greater-equal'
  | 'equal'
  | 'not-equal'
  | 'always';

/**
 * Texture min/mag filter mode.
 */
export type FilterMode = 'nearest' | 'linear';

/**
 * Mipmap level filter mode.
 */
export type MipmapFilter = 'nearest' | 'linear';

/**
 * Texture addressing (wrap) mode per axis.
 */
export type AddressMode =
  | 'repeat'
  | 'mirror-repeat'
  | 'clamp-to-edge'
  | 'clamp-to-border';

/**
 * Border color used when addressMode is clamp-to-border.
 */
export type BorderColor = 'transparent-black' | 'opaque-black' | 'opaque-white';

/**
 * Texture format specifier based on Vulkan 1.1 formats.
 */
export type TextureFormat =
  // 8-bit formats - Single Channel
  | 'r8unorm' // R8 unsigned normalized
  | 'r8snorm' // R8 signed normalized
  | 'r8uint' // R8 unsigned integer
  | 'r8sint' // R8 signed integer
  | 'r8srgb' // R8 sRGB

  // 8-bit formats - Two Channel
  | 'rg8unorm' // RG8 unsigned normalized
  | 'rg8snorm' // RG8 signed normalized
  | 'rg8uint' // RG8 unsigned integer
  | 'rg8sint' // RG8 signed integer
  | 'rg8srgb' // RG8 sRGB

  // 8-bit formats - Three Channel
  | 'rgb8unorm' // RGB8 unsigned normalized (not widely supported)
  | 'rgb8snorm' // RGB8 signed normalized (not widely supported)
  | 'rgb8uint' // RGB8 unsigned integer (not widely supported)
  | 'rgb8sint' // RGB8 signed integer (not widely supported)
  | 'rgb8srgb' // RGB8 sRGB (not widely supported)

  // 8-bit formats - Four Channel
  | 'rgba8unorm' // RGBA8 unsigned normalized (most common)
  | 'rgba8snorm' // RGBA8 signed normalized (for normal maps)
  | 'rgba8uint' // RGBA8 unsigned integer
  | 'rgba8sint' // RGBA8 signed integer
  | 'rgba8unorm-srgb' // RGBA8 sRGB (for diffuse/albedo textures)
  | 'bgra8unorm' // BGRA8 unsigned normalized (Windows/Metal prefer)
  | 'bgra8unorm-srgb' // BGRA8 sRGB

  // 16-bit formats - Single Channel
  | 'r16unorm' // R16 unsigned normalized
  | 'r16snorm' // R16 signed normalized
  | 'r16uint' // R16 unsigned integer
  | 'r16sint' // R16 signed integer
  | 'r16float' // R16 float (HDR shadows, height maps)

  // 16-bit formats - Two Channel
  | 'rg16unorm' // RG16 unsigned normalized
  | 'rg16snorm' // RG16 signed normalized
  | 'rg16uint' // RG16 unsigned integer
  | 'rg16sint' // RG16 signed integer
  | 'rg16float' // RG16 float (HDR normal maps, flow maps)

  // 16-bit formats - Three Channel
  | 'rgb16unorm' // RGB16 unsigned normalized
  | 'rgb16snorm' // RGB16 signed normalized
  | 'rgb16uint' // RGB16 unsigned integer
  | 'rgb16sint' // RGB16 signed integer
  | 'rgb16float' // RGB16 float

  // 16-bit formats - Four Channel
  | 'rgba16unorm' // RGBA16 unsigned normalized
  | 'rgba16snorm' // RGBA16 signed normalized
  | 'rgba16uint' // RGBA16 unsigned integer
  | 'rgba16sint' // RGBA16 signed integer
  | 'rgba16float' // RGBA16 float (HDR color, good balance)

  // 32-bit formats - Single Channel
  | 'r32uint' // R32 unsigned integer
  | 'r32sint' // R32 signed integer
  | 'r32float' // R32 float (high precision single channel)

  // 32-bit formats - Two Channel
  | 'rg32uint' // RG32 unsigned integer
  | 'rg32sint' // RG32 signed integer
  | 'rg32float' // RG32 float

  // 32-bit formats - Three Channel
  | 'rgb32uint' // RGB32 unsigned integer
  | 'rgb32sint' // RGB32 signed integer
  | 'rgb32float' // RGB32 float

  // 32-bit formats - Four Channel
  | 'rgba32uint' // RGBA32 unsigned integer
  | 'rgba32sint' // RGBA32 signed integer
  | 'rgba32float' // RGBA32 float (maximum precision)

  // Packed 16-bit formats
  | 'rgb565unorm' // RGB 5:6:5 unsigned normalized
  | 'rgba4unorm' // RGBA 4:4:4:4 unsigned normalized
  | 'rgb5a1unorm' // RGB 5:5:5 + A 1 unsigned normalized

  // Packed 32-bit formats
  | 'rgb10a2unorm' // RGB 10:10:10 + A 2 unsigned normalized (HDR displays)
  | 'rgb10a2uint' // RGB 10:10:10 + A 2 unsigned integer
  | 'rg11b10float' // RG 11:11 + B 10 float (packed HDR without alpha)
  | 'rgb9e5float' // RGB 9:9:9 + E 5 shared exponent float

  // Compressed Formats - BC (DirectX/Vulkan Desktop)
  | 'bc1-rgba-unorm' // BC1/DXT1 - RGB + 1-bit alpha (6:1 compression)
  | 'bc1-rgba-unorm-srgb' // BC1/DXT1 sRGB
  | 'bc2-rgba-unorm' // BC2/DXT3 - RGBA explicit alpha (4:1 compression)
  | 'bc2-rgba-unorm-srgb' // BC2/DXT3 sRGB
  | 'bc3-rgba-unorm' // BC3/DXT5 - RGBA interpolated alpha (4:1 compression)
  | 'bc3-rgba-unorm-srgb' // BC3/DXT5 sRGB
  | 'bc4-r-unorm' // BC4 - Single channel (height, roughness)
  | 'bc4-r-snorm' // BC4 - Single channel signed
  | 'bc5-rg-unorm' // BC5 - Two channel (normal maps)
  | 'bc5-rg-snorm' // BC5 - Two channel signed
  | 'bc6h-rgb-ufloat' // BC6H - HDR RGB unsigned float
  | 'bc6h-rgb-sfloat' // BC6H - HDR RGB signed float
  | 'bc7-rgba-unorm' // BC7 - High quality RGBA (4:1)
  | 'bc7-rgba-unorm-srgb' // BC7 sRGB

  // Compressed Formats - ETC2/EAC (Mobile/Vulkan)
  | 'etc2-rgb8unorm' // ETC2 RGB (6:1 compression)
  | 'etc2-rgb8unorm-srgb' // ETC2 RGB sRGB
  | 'etc2-rgb8a1unorm' // ETC2 RGB + 1-bit alpha
  | 'etc2-rgb8a1unorm-srgb' // ETC2 RGB + 1-bit alpha sRGB
  | 'etc2-rgba8unorm' // ETC2 RGBA (4:1 compression)
  | 'etc2-rgba8unorm-srgb' // ETC2 RGBA sRGB
  | 'eac-r11unorm' // EAC R11 unsigned normalized
  | 'eac-r11snorm' // EAC R11 signed normalized
  | 'eac-rg11unorm' // EAC RG11 unsigned normalized
  | 'eac-rg11snorm' // EAC RG11 signed normalized

  // Compressed Formats - ASTC (Mobile/Vulkan)
  | 'astc-4x4-unorm' // ASTC 4x4 (8:1 compression, high quality)
  | 'astc-4x4-unorm-srgb' // ASTC 4x4 sRGB
  | 'astc-5x4-unorm' // ASTC 5x4 (10:1 compression)
  | 'astc-5x4-unorm-srgb' // ASTC 5x4 sRGB
  | 'astc-5x5-unorm' // ASTC 5x5 (10.2:1 compression)
  | 'astc-5x5-unorm-srgb' // ASTC 5x5 sRGB
  | 'astc-6x5-unorm' // ASTC 6x5 (12.5:1 compression)
  | 'astc-6x5-unorm-srgb' // ASTC 6x5 sRGB
  | 'astc-6x6-unorm' // ASTC 6x6 (11.1:1 compression, medium quality)
  | 'astc-6x6-unorm-srgb' // ASTC 6x6 sRGB
  | 'astc-8x5-unorm' // ASTC 8x5 (16:1 compression)
  | 'astc-8x5-unorm-srgb' // ASTC 8x5 sRGB
  | 'astc-8x6-unorm' // ASTC 8x6 (16:1 compression)
  | 'astc-8x6-unorm-srgb' // ASTC 8x6 sRGB
  | 'astc-8x8-unorm' // ASTC 8x8 (16:1 compression, lower quality)
  | 'astc-8x8-unorm-srgb' // ASTC 8x8 sRGB
  | 'astc-10x5-unorm' // ASTC 10x5 (20.8:1 compression)
  | 'astc-10x5-unorm-srgb' // ASTC 10x5 sRGB
  | 'astc-10x6-unorm' // ASTC 10x6 (21.3:1 compression)
  | 'astc-10x6-unorm-srgb' // ASTC 10x6 sRGB
  | 'astc-10x8-unorm' // ASTC 10x8 (26.7:1 compression)
  | 'astc-10x8-unorm-srgb' // ASTC 10x8 sRGB
  | 'astc-10x10-unorm' // ASTC 10x10 (26.7:1 compression)
  | 'astc-10x10-unorm-srgb' // ASTC 10x10 sRGB
  | 'astc-12x10-unorm' // ASTC 12x10 (32:1 compression)
  | 'astc-12x10-unorm-srgb' // ASTC 12x10 sRGB
  | 'astc-12x12-unorm' // ASTC 12x12 (32:1 compression, lowest quality)
  | 'astc-12x12-unorm-srgb' // ASTC 12x12 sRGB

  // Depth/Stencil Formats
  | 'depth16unorm' // D16 unsigned normalized (mobile friendly)
  | 'depth24plus' // D24 (implementation dependent, may be D24 or D32F)
  | 'depth24unorm-stencil8' // D24 unsigned normalized + S8 (not widely supported)
  | 'depth32float' // D32F float (high precision depth for shadows)
  | 'depth32float-stencil8' // D32F float + S8 unsigned integer
  | 'depth24plus-stencil8' // D24+ + S8 (implementation dependent)
  | 'stencil8'; // S8 stencil only

/**
 * Multi-sample anti-aliasing sample count.
 */
export type SampleCount = 1 | 2 | 4 | 8;

/**
 * Texture usage flags (string-based for clarity).
 */
export type TextureUsage =
  | 'sampler'
  | 'color-target'
  | 'depth-stencil-target'
  | 'storage'
  | 'transfer-src'
  | 'transfer-dst';

/**
 * Rasterizer fill mode.
 */
export type RasterizerFillMode = 'fill' | 'line' | 'point';

/**
 * Rasterizer face culling mode.
 */
export type RasterizerCullMode = 'none' | 'front' | 'back' | 'all';

/**
 * Rasterizer front face winding order.
 */
export type RasterizerFrontFace = 'cw' | 'ccw';

/**
 * Stencil operation.
 */
export type StencilOperation =
  | 'keep'
  | 'zero'
  | 'replace'
  | 'invert'
  | 'increment-clamp'
  | 'decrement-clamp'
  | 'increment-wrap'
  | 'decrement-wrap';

/**
 * Depth/stencil texture format.
 */
export type DepthStencilFormat =
  | 'depth16unorm'
  | 'depth24plus'
  | 'depth24unorm-stencil8'
  | 'depth32float'
  | 'depth32float-stencil8'
  | 'depth24plus-stencil8'
  | 'stencil8';
