import {
  VkAttachmentLoadOp,
  VkAttachmentStoreOp,
  VkFormat,
  VkImageLayout,
  VkSampleCountFlagBits,
} from '@bunbox/vk';
import type {
  ImageLayout,
  LoadOp,
  SampleCount,
  StoreOp,
  TextureFormat,
} from '../resources';

/**
 * Convert TextureFormat to VkFormat
 */
export function mapTextureFormatToVk(format: TextureFormat): number {
  const formatMap: Record<TextureFormat, number> = {
    // 8-bit formats - Single Channel
    r8unorm: VkFormat.R8_UNORM,
    r8snorm: VkFormat.R8_SNORM,
    r8uint: VkFormat.R8_UINT,
    r8sint: VkFormat.R8_SINT,
    r8srgb: VkFormat.R8_SRGB,

    // 8-bit formats - Two Channel
    rg8unorm: VkFormat.R8G8_UNORM,
    rg8snorm: VkFormat.R8G8_SNORM,
    rg8uint: VkFormat.R8G8_UINT,
    rg8sint: VkFormat.R8G8_SINT,
    rg8srgb: VkFormat.R8G8_SRGB,

    // 8-bit formats - Three Channel
    rgb8unorm: VkFormat.R8G8B8_UNORM,
    rgb8snorm: VkFormat.R8G8B8_SNORM,
    rgb8uint: VkFormat.R8G8B8_UINT,
    rgb8sint: VkFormat.R8G8B8_SINT,
    rgb8srgb: VkFormat.R8G8B8_SRGB,

    // 8-bit formats - Four Channel
    rgba8unorm: VkFormat.R8G8B8A8_UNORM,
    rgba8snorm: VkFormat.R8G8B8A8_SNORM,
    rgba8uint: VkFormat.R8G8B8A8_UINT,
    rgba8sint: VkFormat.R8G8B8A8_SINT,
    'rgba8unorm-srgb': VkFormat.R8G8B8A8_SRGB,
    bgra8unorm: VkFormat.B8G8R8A8_UNORM,
    'bgra8unorm-srgb': VkFormat.B8G8R8A8_SRGB,

    // 16-bit formats - Single Channel
    r16unorm: VkFormat.R16_UNORM,
    r16snorm: VkFormat.R16_SNORM,
    r16uint: VkFormat.R16_UINT,
    r16sint: VkFormat.R16_SINT,
    r16float: VkFormat.R16_SFLOAT,

    // 16-bit formats - Two Channel
    rg16unorm: VkFormat.R16G16_UNORM,
    rg16snorm: VkFormat.R16G16_SNORM,
    rg16uint: VkFormat.R16G16_UINT,
    rg16sint: VkFormat.R16G16_SINT,
    rg16float: VkFormat.R16G16_SFLOAT,

    // 16-bit formats - Three Channel
    rgb16unorm: VkFormat.R16G16B16_UNORM,
    rgb16snorm: VkFormat.R16G16B16_SNORM,
    rgb16uint: VkFormat.R16G16B16_UINT,
    rgb16sint: VkFormat.R16G16B16_SINT,
    rgb16float: VkFormat.R16G16B16_SFLOAT,

    // 16-bit formats - Four Channel
    rgba16unorm: VkFormat.R16G16B16A16_UNORM,
    rgba16snorm: VkFormat.R16G16B16A16_SNORM,
    rgba16uint: VkFormat.R16G16B16A16_UINT,
    rgba16sint: VkFormat.R16G16B16A16_SINT,
    rgba16float: VkFormat.R16G16B16A16_SFLOAT,

    // 32-bit formats - Single Channel
    r32uint: VkFormat.R32_UINT,
    r32sint: VkFormat.R32_SINT,
    r32float: VkFormat.R32_SFLOAT,

    // 32-bit formats - Two Channel
    rg32uint: VkFormat.R32G32_UINT,
    rg32sint: VkFormat.R32G32_SINT,
    rg32float: VkFormat.R32G32_SFLOAT,

    // 32-bit formats - Three Channel
    rgb32uint: VkFormat.R32G32B32_UINT,
    rgb32sint: VkFormat.R32G32B32_SINT,
    rgb32float: VkFormat.R32G32B32_SFLOAT,

    // 32-bit formats - Four Channel
    rgba32uint: VkFormat.R32G32B32A32_UINT,
    rgba32sint: VkFormat.R32G32B32A32_SINT,
    rgba32float: VkFormat.R32G32B32A32_SFLOAT,

    // Packed 16-bit formats
    rgb565unorm: VkFormat.R5G6B5_UNORM_PACK16,
    rgba4unorm: VkFormat.R4G4B4A4_UNORM_PACK16,
    rgb5a1unorm: VkFormat.R5G5B5A1_UNORM_PACK16,

    // Packed 32-bit formats
    rgb10a2unorm: VkFormat.A2B10G10R10_UNORM_PACK32,
    rgb10a2uint: VkFormat.A2B10G10R10_UINT_PACK32,
    rg11b10float: VkFormat.B10G11R11_UFLOAT_PACK32,
    rgb9e5float: VkFormat.E5B9G9R9_UFLOAT_PACK32,

    // Compressed Formats - BC (DirectX/Vulkan Desktop)
    'bc1-rgba-unorm': VkFormat.BC1_RGBA_UNORM_BLOCK,
    'bc1-rgba-unorm-srgb': VkFormat.BC1_RGBA_SRGB_BLOCK,
    'bc2-rgba-unorm': VkFormat.BC2_UNORM_BLOCK,
    'bc2-rgba-unorm-srgb': VkFormat.BC2_SRGB_BLOCK,
    'bc3-rgba-unorm': VkFormat.BC3_UNORM_BLOCK,
    'bc3-rgba-unorm-srgb': VkFormat.BC3_SRGB_BLOCK,
    'bc4-r-unorm': VkFormat.BC4_UNORM_BLOCK,
    'bc4-r-snorm': VkFormat.BC4_SNORM_BLOCK,
    'bc5-rg-unorm': VkFormat.BC5_UNORM_BLOCK,
    'bc5-rg-snorm': VkFormat.BC5_SNORM_BLOCK,
    'bc6h-rgb-ufloat': VkFormat.BC6H_UFLOAT_BLOCK,
    'bc6h-rgb-sfloat': VkFormat.BC6H_SFLOAT_BLOCK,
    'bc7-rgba-unorm': VkFormat.BC7_UNORM_BLOCK,
    'bc7-rgba-unorm-srgb': VkFormat.BC7_SRGB_BLOCK,

    // Compressed Formats - ETC2/EAC (Mobile/Vulkan)
    'etc2-rgb8unorm': VkFormat.ETC2_R8G8B8_UNORM_BLOCK,
    'etc2-rgb8unorm-srgb': VkFormat.ETC2_R8G8B8_SRGB_BLOCK,
    'etc2-rgb8a1unorm': VkFormat.ETC2_R8G8B8A1_UNORM_BLOCK,
    'etc2-rgb8a1unorm-srgb': VkFormat.ETC2_R8G8B8A1_SRGB_BLOCK,
    'etc2-rgba8unorm': VkFormat.ETC2_R8G8B8A8_UNORM_BLOCK,
    'etc2-rgba8unorm-srgb': VkFormat.ETC2_R8G8B8A8_SRGB_BLOCK,
    'eac-r11unorm': VkFormat.EAC_R11_UNORM_BLOCK,
    'eac-r11snorm': VkFormat.EAC_R11_SNORM_BLOCK,
    'eac-rg11unorm': VkFormat.EAC_R11G11_UNORM_BLOCK,
    'eac-rg11snorm': VkFormat.EAC_R11G11_SNORM_BLOCK,

    // Compressed Formats - ASTC (Mobile/Vulkan)
    'astc-4x4-unorm': VkFormat.ASTC_4x4_UNORM_BLOCK,
    'astc-4x4-unorm-srgb': VkFormat.ASTC_4x4_SRGB_BLOCK,
    'astc-5x4-unorm': VkFormat.ASTC_5x4_UNORM_BLOCK,
    'astc-5x4-unorm-srgb': VkFormat.ASTC_5x4_SRGB_BLOCK,
    'astc-5x5-unorm': VkFormat.ASTC_5x5_UNORM_BLOCK,
    'astc-5x5-unorm-srgb': VkFormat.ASTC_5x5_SRGB_BLOCK,
    'astc-6x5-unorm': VkFormat.ASTC_6x5_UNORM_BLOCK,
    'astc-6x5-unorm-srgb': VkFormat.ASTC_6x5_SRGB_BLOCK,
    'astc-6x6-unorm': VkFormat.ASTC_6x6_UNORM_BLOCK,
    'astc-6x6-unorm-srgb': VkFormat.ASTC_6x6_SRGB_BLOCK,
    'astc-8x5-unorm': VkFormat.ASTC_8x5_UNORM_BLOCK,
    'astc-8x5-unorm-srgb': VkFormat.ASTC_8x5_SRGB_BLOCK,
    'astc-8x6-unorm': VkFormat.ASTC_8x6_UNORM_BLOCK,
    'astc-8x6-unorm-srgb': VkFormat.ASTC_8x6_SRGB_BLOCK,
    'astc-8x8-unorm': VkFormat.ASTC_8x8_UNORM_BLOCK,
    'astc-8x8-unorm-srgb': VkFormat.ASTC_8x8_SRGB_BLOCK,
    'astc-10x5-unorm': VkFormat.ASTC_10x5_UNORM_BLOCK,
    'astc-10x5-unorm-srgb': VkFormat.ASTC_10x5_SRGB_BLOCK,
    'astc-10x6-unorm': VkFormat.ASTC_10x6_UNORM_BLOCK,
    'astc-10x6-unorm-srgb': VkFormat.ASTC_10x6_SRGB_BLOCK,
    'astc-10x8-unorm': VkFormat.ASTC_10x8_UNORM_BLOCK,
    'astc-10x8-unorm-srgb': VkFormat.ASTC_10x8_SRGB_BLOCK,
    'astc-10x10-unorm': VkFormat.ASTC_10x10_UNORM_BLOCK,
    'astc-10x10-unorm-srgb': VkFormat.ASTC_10x10_SRGB_BLOCK,
    'astc-12x10-unorm': VkFormat.ASTC_12x10_UNORM_BLOCK,
    'astc-12x10-unorm-srgb': VkFormat.ASTC_12x10_SRGB_BLOCK,
    'astc-12x12-unorm': VkFormat.ASTC_12x12_UNORM_BLOCK,
    'astc-12x12-unorm-srgb': VkFormat.ASTC_12x12_SRGB_BLOCK,

    // Depth/Stencil Formats
    'depth16-unorm': VkFormat.D16_UNORM,
    'depth24-plus': VkFormat.D24_UNORM_S8_UINT,
    'depth24-unorm-stencil8': VkFormat.D24_UNORM_S8_UINT,
    'depth32-float': VkFormat.D32_SFLOAT,
    'depth32-float-stencil8': VkFormat.D32_SFLOAT_S8_UINT,
    'depth24-plus-stencil8': VkFormat.D24_UNORM_S8_UINT,
    stencil8: VkFormat.S8_UINT,
  };

  return formatMap[format];
}

/**
 * Convert SampleCount to VkSampleCountFlagBits
 */
export function mapSampleCountToVk(samples: SampleCount): number {
  const sampleMap: Record<SampleCount, number> = {
    1: VkSampleCountFlagBits.COUNT_1_BIT,
    2: VkSampleCountFlagBits.COUNT_2_BIT,
    4: VkSampleCountFlagBits.COUNT_4_BIT,
    8: VkSampleCountFlagBits.COUNT_8_BIT,
    16: VkSampleCountFlagBits.COUNT_16_BIT,
    32: VkSampleCountFlagBits.COUNT_32_BIT,
    64: VkSampleCountFlagBits.COUNT_64_BIT,
  };

  return sampleMap[samples];
}

/**
 * Convert LoadOp to VkAttachmentLoadOp
 */
export function mapLoadOpToVk(loadOp: LoadOp): number {
  const loadOpMap: Record<LoadOp, number> = {
    load: VkAttachmentLoadOp.LOAD,
    clear: VkAttachmentLoadOp.CLEAR,
    'dont-care': VkAttachmentLoadOp.DONT_CARE,
  };

  return loadOpMap[loadOp];
}

/**
 * Convert StoreOp to VkAttachmentStoreOp
 */
export function mapStoreOpToVk(storeOp: StoreOp): number {
  const storeOpMap: Record<StoreOp, number> = {
    store: VkAttachmentStoreOp.STORE,
    'dont-care': VkAttachmentStoreOp.DONT_CARE,
  };

  return storeOpMap[storeOp];
}

/**
 * Convert ImageLayout to VkImageLayout
 */
export function mapImageLayoutToVk(layout: ImageLayout): number {
  const layoutMap: Record<ImageLayout, number> = {
    undefined: VkImageLayout.UNDEFINED,
    general: VkImageLayout.GENERAL,
    'color-attachment': VkImageLayout.COLOR_ATTACHMENT_OPTIMAL,
    'depth-stencil-attachment': VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
    'depth-stencil-read-only': VkImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL,
    'shader-read-only': VkImageLayout.SHADER_READ_ONLY_OPTIMAL,
    'transfer-src': VkImageLayout.TRANSFER_SRC_OPTIMAL,
    'transfer-dst': VkImageLayout.TRANSFER_DST_OPTIMAL,
    'present-src': VkImageLayout.PRESENT_SRC_KHR,
    'depth-read-only-stencil-attachment':
      VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
    'depth-attachment-stencil-read-only':
      VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
  };

  return layoutMap[layout];
}
