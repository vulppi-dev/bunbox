import {
  Vk_Format,
  Vk_ImageAspectFlagBits,
  Vk_ImageUsageFlagBits,
} from '../../dynamic-libs';
import type { TextureFormat, TextureUsage } from '../../elements';

/**
 * Maps TextureFormat to VkFormat
 * Note: Using numeric VkFormat values directly since not all format constants
 * are exposed in the current Vulkan bindings
 */
export function textureFormatToVulkan(format: TextureFormat): number {
  const formatMap: Partial<Record<TextureFormat, number>> = {
    // Color Formats - 8-bit normalized
    rgba8unorm: Vk_Format.R8G8B8A8_UNORM,
    'rgba8unorm-srgb': Vk_Format.R8G8B8A8_SRGB,
    bgra8unorm: Vk_Format.B8G8R8A8_UNORM,
    'bgra8unorm-srgb': Vk_Format.B8G8R8A8_SRGB,
    rgba8snorm: Vk_Format.R8G8B8A8_SNORM,

    // Color Formats - 16-bit float
    rgba16float: Vk_Format.R16G16B16A16_SFLOAT,
    r16float: Vk_Format.R16_SFLOAT,
    rg16float: Vk_Format.R16G16_SFLOAT,

    // Color Formats - 32-bit float
    rgba32float: Vk_Format.R32G32B32A32_SFLOAT,
    r32float: Vk_Format.R32_SFLOAT,

    // Color Formats - packed
    rgb10a2unorm: Vk_Format.A2B10G10R10_UNORM_PACK32,
    rg11b10float: Vk_Format.B10G11R11_UFLOAT_PACK32,

    // Single/Dual Channel
    r8unorm: Vk_Format.R8_UNORM,
    rg8unorm: Vk_Format.R8G8_UNORM,

    // Compressed Formats - BC
    'bc1-rgba-unorm': Vk_Format.BC1_RGBA_UNORM_BLOCK,
    'bc1-rgba-unorm-srgb': Vk_Format.BC1_RGBA_SRGB_BLOCK,
    'bc3-rgba-unorm': Vk_Format.BC3_UNORM_BLOCK,
    'bc3-rgba-unorm-srgb': Vk_Format.BC3_SRGB_BLOCK,
    'bc4-r-unorm': Vk_Format.BC4_UNORM_BLOCK,
    'bc5-rg-unorm': Vk_Format.BC5_UNORM_BLOCK,
    'bc7-rgba-unorm': Vk_Format.BC7_UNORM_BLOCK,
    'bc7-rgba-unorm-srgb': Vk_Format.BC7_SRGB_BLOCK,
    'bc6h-rgb-ufloat': Vk_Format.BC6H_UFLOAT_BLOCK,

    // Compressed Formats - ASTC
    'astc-4x4-unorm': Vk_Format.ASTC_4x4_UNORM_BLOCK,
    'astc-4x4-unorm-srgb': Vk_Format.ASTC_4x4_SRGB_BLOCK,
    'astc-6x6-unorm': Vk_Format.ASTC_6x6_UNORM_BLOCK,
    'astc-8x8-unorm': Vk_Format.ASTC_8x8_UNORM_BLOCK,

    // Depth/Stencil Formats
    depth16unorm: Vk_Format.D16_UNORM,
    depth24plus: Vk_Format.D24_UNORM_S8_UINT, // Vulkan doesn't have pure D24
    depth32float: Vk_Format.D32_SFLOAT,
    'depth24plus-stencil8': Vk_Format.D24_UNORM_S8_UINT,
    'depth32float-stencil8': Vk_Format.D32_SFLOAT_S8_UINT,
  };

  const vkFormat = formatMap[format];
  if (vkFormat === undefined) {
    throw new Error(`Unsupported texture format: ${format}`);
  }

  return vkFormat;
}

/**
 * Maps TextureUsage array to VkImageUsageFlags bitmask
 */
export function textureUsageToVulkan(usage: TextureUsage[]): number {
  let flags = 0;

  for (const u of usage) {
    switch (u) {
      case 'sampler':
        flags |= Vk_ImageUsageFlagBits.SAMPLED_BIT;
        break;
      case 'color-target':
        flags |= Vk_ImageUsageFlagBits.COLOR_ATTACHMENT_BIT;
        break;
      case 'depth-stencil-target':
        flags |= Vk_ImageUsageFlagBits.DEPTH_STENCIL_ATTACHMENT_BIT;
        break;
      case 'graphics-storage-read':
      case 'compute-storage-read':
      case 'compute-storage-write':
      case 'compute-storage-rw':
        flags |= Vk_ImageUsageFlagBits.STORAGE_BIT;
        break;
    }
  }

  // Always add TRANSFER_DST for uploading data
  flags |= Vk_ImageUsageFlagBits.TRANSFER_DST_BIT;

  // Add TRANSFER_SRC if we might generate mipmaps or copy from this texture
  flags |= Vk_ImageUsageFlagBits.TRANSFER_SRC_BIT;

  return flags;
}

/**
 * Checks if a format is a depth or depth-stencil format
 */
export function isDepthFormat(format: TextureFormat): boolean {
  return format.startsWith('depth');
}

/**
 * Gets the appropriate image aspect flags for a format
 */
export function getImageAspectFlags(format: TextureFormat): number {
  if (format.includes('stencil')) {
    return (
      Vk_ImageAspectFlagBits.DEPTH_BIT | Vk_ImageAspectFlagBits.STENCIL_BIT
    );
  }
  if (isDepthFormat(format)) {
    return Vk_ImageAspectFlagBits.DEPTH_BIT;
  }
  return Vk_ImageAspectFlagBits.COLOR_BIT;
}
