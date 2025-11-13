import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkFormat,
  vkImageCreateInfo,
  VkImageLayout,
  VkImageTiling,
  VkImageType,
  VkImageUsageFlagBits,
  vkMemoryAllocateInfo,
  VkMemoryPropertyFlagBits,
  vkMemoryRequirements,
  vkPhysicalDeviceMemoryProperties,
  VkResult,
  VkSampleCountFlagBits,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import type {
  SampleCount,
  TextureBase,
  TextureFormat,
  TextureUsage,
} from '../../resources';
import { VK_DEBUG } from '../../singleton/logger';

/**
 * Wrapper for Vulkan VkImage
 * Creates GPU images for textures, depth buffers, stencil buffers, etc.
 * Handles memory allocation and binding automatically.
 */
export class VkImage implements Disposable {
  private static __mapFormat(format: TextureFormat): number {
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
      depth16unorm: VkFormat.D16_UNORM,
      depth24plus: VkFormat.D24_UNORM_S8_UINT,
      'depth24unorm-stencil8': VkFormat.D24_UNORM_S8_UINT,
      depth32float: VkFormat.D32_SFLOAT,
      'depth32float-stencil8': VkFormat.D32_SFLOAT_S8_UINT,
      'depth24plus-stencil8': VkFormat.D24_UNORM_S8_UINT,
      stencil8: VkFormat.S8_UINT,
    };

    return formatMap[format];
  }

  private static __mapSampleCount(sampleCount: SampleCount): number {
    const sampleMap: Record<SampleCount, number> = {
      1: VkSampleCountFlagBits.COUNT_1_BIT,
      2: VkSampleCountFlagBits.COUNT_2_BIT,
      4: VkSampleCountFlagBits.COUNT_4_BIT,
      8: VkSampleCountFlagBits.COUNT_8_BIT,
    };

    return sampleMap[sampleCount];
  }

  private static __mapUsage(usage: readonly TextureUsage[]): number {
    let usageFlags = 0;

    for (const u of usage) {
      switch (u) {
        case 'sampler':
          usageFlags |= VkImageUsageFlagBits.SAMPLED_BIT;
          break;
        case 'color-target':
          usageFlags |= VkImageUsageFlagBits.COLOR_ATTACHMENT_BIT;
          break;
        case 'depth-stencil-target':
          usageFlags |= VkImageUsageFlagBits.DEPTH_STENCIL_ATTACHMENT_BIT;
          break;
        case 'storage':
          usageFlags |= VkImageUsageFlagBits.STORAGE_BIT;
          break;
        case 'transfer-src':
          usageFlags |= VkImageUsageFlagBits.TRANSFER_SRC_BIT;
          break;
        case 'transfer-dst':
          usageFlags |= VkImageUsageFlagBits.TRANSFER_DST_BIT;
          break;
      }
    }

    return usageFlags;
  }

  private static __findMemoryType(
    physicalDevice: Pointer,
    typeFilter: number,
    properties: number,
  ): number {
    const memProperties = instantiate(vkPhysicalDeviceMemoryProperties);
    VK.vkGetPhysicalDeviceMemoryProperties(
      physicalDevice,
      ptr(getInstanceBuffer(memProperties)),
    );

    for (let i = 0; i < memProperties.memoryTypeCount; i++) {
      const typeSupported = (typeFilter & (1 << i)) !== 0;
      const hasProperties =
        (memProperties.memoryTypes[i]!.propertyFlags & properties) ===
        properties;

      if (typeSupported && hasProperties) {
        return i;
      }
    }

    throw new DynamicLibError(
      'Failed to find suitable memory type for image',
      'Vulkan',
    );
  }

  // MARK: Instance props

  private __device: Pointer;
  private __physicalDevice: Pointer;
  private __instance: bigint;
  private __memory: Pointer;
  private __width: number;
  private __height: number;
  private __depth: number;
  private __mipLevels: number;
  private __format: number;
  private __currentLayout: number;

  constructor(device: Pointer, physicalDevice: Pointer, texture: TextureBase) {
    this.__device = device;
    this.__physicalDevice = physicalDevice;
    this.__width = texture.width;
    this.__height = texture.height;
    this.__depth = texture.depth;
    this.__mipLevels = texture.mipLevels;
    this.__format = VkImage.__mapFormat(texture.format);
    this.__currentLayout = VkImageLayout.UNDEFINED;

    VK_DEBUG(
      `Creating image: ${this.__width}x${this.__height}x${this.__depth}, format: ${texture.format}, mips: ${this.__mipLevels}`,
    );

    this.__instance = this.__createImage(texture);
    this.__memory = this.__allocateAndBindMemory();

    VK_DEBUG(`Image created: 0x${this.__instance.toString(16)}`);
  }

  get instance() {
    return this.__instance;
  }

  get memory() {
    return this.__memory;
  }

  get width() {
    return this.__width;
  }

  get height() {
    return this.__height;
  }

  get depth() {
    return this.__depth;
  }

  get mipLevels() {
    return this.__mipLevels;
  }

  get format() {
    return this.__format;
  }

  get layout() {
    return this.__currentLayout;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying image: 0x${this.__instance.toString(16)}`);
    VK.vkDestroyImage(this.__device, this.__instance, null);
    VK.vkFreeMemory(this.__device, this.__memory, null);
    VK_DEBUG('Image destroyed');
  }

  private __createImage(texture: TextureBase): bigint {
    const createInfo = instantiate(vkImageCreateInfo);
    createInfo.flags = 0;
    createInfo.imageType =
      this.__depth > 1 ? VkImageType.TYPE_3D : VkImageType.TYPE_2D;
    createInfo.format = this.__format;
    createInfo.extent.width = this.__width;
    createInfo.extent.height = this.__height;
    createInfo.extent.depth = this.__depth;
    createInfo.mipLevels = this.__mipLevels;
    createInfo.arrayLayers = texture.layerCount;
    createInfo.samples = VkImage.__mapSampleCount(texture.sampleCount);
    createInfo.tiling = VkImageTiling.OPTIMAL;
    createInfo.usage = VkImage.__mapUsage(texture.usage);
    createInfo.sharingMode = 0; // VkSharingMode.EXCLUSIVE
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.initialLayout = VkImageLayout.UNDEFINED;

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateImage(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return pointerHolder[0]!;
  }

  private __allocateAndBindMemory(): Pointer {
    // Get memory requirements
    const memRequirements = instantiate(vkMemoryRequirements);
    VK.vkGetImageMemoryRequirements(
      this.__device,
      this.__instance,
      ptr(getInstanceBuffer(memRequirements)),
    );

    VK_DEBUG(
      `Image memory requirements: size=${memRequirements.size}, alignment=${memRequirements.alignment}`,
    );

    // Find suitable memory type
    const memoryTypeIndex = VkImage.__findMemoryType(
      this.__physicalDevice,
      memRequirements.memoryTypeBits,
      VkMemoryPropertyFlagBits.DEVICE_LOCAL_BIT,
    );

    // Allocate memory
    const allocInfo = instantiate(vkMemoryAllocateInfo);
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = memoryTypeIndex;

    const memoryHolder = new BigUint64Array(1);
    const allocResult = VK.vkAllocateMemory(
      this.__device,
      ptr(getInstanceBuffer(allocInfo)),
      null,
      ptr(memoryHolder),
    );

    if (allocResult !== VkResult.SUCCESS) {
      VK.vkDestroyImage(this.__device, this.__instance, null);
      throw new DynamicLibError(getResultMessage(allocResult), 'Vulkan');
    }

    const memory = Number(memoryHolder[0]!) as Pointer;

    // Bind memory to image
    const bindResult = VK.vkBindImageMemory(
      this.__device,
      this.__instance,
      memory,
      0n,
    );

    if (bindResult !== VkResult.SUCCESS) {
      VK.vkFreeMemory(this.__device, memory, null);
      VK.vkDestroyImage(this.__device, this.__instance, null);
      throw new DynamicLibError(getResultMessage(bindResult), 'Vulkan');
    }

    VK_DEBUG(`Image memory allocated and bound: 0x${memory.toString(16)}`);

    return memory;
  }
}
