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
 * Texture format specifier.
 */
export type TextureFormat =
  // Color Formats - 8-bit normalized
  | 'rgba8unorm' // Standard 8-bit RGBA (most common)
  | 'rgba8unorm-srgb' // SRGB color space (for diffuse/albedo textures)
  | 'bgra8unorm' // Platform-specific (Windows/Metal prefer BGRA)
  | 'bgra8unorm-srgb' // SRGB BGRA variant
  | 'rgba8snorm' // Signed normalized (for normal maps)

  // Color Formats - 16-bit float (HDR)
  | 'rgba16float' // HDR color, good balance
  | 'r16float' // Single channel HDR (shadows, height maps)
  | 'rg16float' // Two channel HDR (normal maps, flow maps)

  // Color Formats - 32-bit float (high precision)
  | 'rgba32float' // Maximum precision, compute buffers
  | 'r32float' // Single channel high precision

  // Color Formats - packed/compressed
  | 'rgb10a2unorm' // 10-bit color, 2-bit alpha (HDR displays)
  | 'rg11b10float' // Packed HDR without alpha

  // Single/Dual Channel
  | 'r8unorm' // Grayscale, masks
  | 'rg8unorm' // Dual channel (2D vectors, flow)

  // Compressed Formats - BC (DirectX/Vulkan)
  | 'bc1-rgba-unorm' // DXT1 - Color, 1-bit alpha (6:1 compression)
  | 'bc1-rgba-unorm-srgb' // DXT1 SRGB
  | 'bc3-rgba-unorm' // DXT5 - Color + alpha (4:1 compression)
  | 'bc3-rgba-unorm-srgb' // DXT5 SRGB
  | 'bc4-r-unorm' // Single channel (height, roughness)
  | 'bc5-rg-unorm' // Two channel (normal maps)
  | 'bc7-rgba-unorm' // High quality RGB/RGBA (4:1)
  | 'bc7-rgba-unorm-srgb' // BC7 SRGB
  | 'bc6h-rgb-ufloat' // HDR compressed

  // Compressed Formats - ASTC (Mobile/Vulkan)
  | 'astc-4x4-unorm' // High quality (8:1)
  | 'astc-4x4-unorm-srgb' // ASTC SRGB
  | 'astc-6x6-unorm' // Medium quality (11.1:1)
  | 'astc-8x8-unorm' // Lower quality (16:1)

  // Depth/Stencil Formats
  | 'depth16unorm' // Basic depth (mobile friendly)
  | 'depth24plus' // 24-bit depth (standard)
  | 'depth32float' // High precision depth (shadows)
  | 'depth24plus-stencil8' // Depth + stencil
  | 'depth32float-stencil8'; // High precision depth + stencil

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
  | 'graphics-storage-read'
  | 'compute-storage-read'
  | 'compute-storage-write'
  | 'compute-storage-rw';

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
  | 'depth24plus'
  | 'depth24plus-stencil8'
  | 'depth32float';
