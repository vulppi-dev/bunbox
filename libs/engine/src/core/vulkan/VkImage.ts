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
import type { TextureBase } from '../../resources/TextureBase';
import type { SampleCount, TextureFormat } from '../../resources/types';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

/**
 * Wrapper for Vulkan VkImage
 * Creates GPU images for textures, depth buffers, stencil buffers, etc.
 * Handles memory allocation and binding automatically.
 */
export class VkImage implements Disposable {
  static #mapFormat(format: TextureFormat): number {
    const formatMap: Record<TextureFormat, number> = {
      // 8-bit normalized
      rgba8unorm: VkFormat.R8G8B8A8_UNORM,
      'rgba8unorm-srgb': VkFormat.R8G8B8A8_SRGB,
      bgra8unorm: VkFormat.B8G8R8A8_UNORM,
      'bgra8unorm-srgb': VkFormat.B8G8R8A8_SRGB,
      rgba8snorm: VkFormat.R8G8B8A8_SNORM,
      r8unorm: VkFormat.R8_UNORM,
      rg8unorm: VkFormat.R8G8_UNORM,

      // 16-bit float
      rgba16float: VkFormat.R16G16B16A16_SFLOAT,
      r16float: VkFormat.R16_SFLOAT,
      rg16float: VkFormat.R16G16_SFLOAT,

      // 32-bit float
      rgba32float: VkFormat.R32G32B32A32_SFLOAT,
      r32float: VkFormat.R32_SFLOAT,

      // Packed formats
      rgb10a2unorm: VkFormat.A2B10G10R10_UNORM_PACK32,
      rg11b10float: VkFormat.B10G11R11_UFLOAT_PACK32,
      // Compressed formats - BC
      'bc1-rgba-unorm': 0, // Not directly supported, placeholder
      'bc1-rgba-unorm-srgb': 0,
      'bc3-rgba-unorm': 0,
      'bc3-rgba-unorm-srgb': 0,
      'bc4-r-unorm': 0,
      'bc5-rg-unorm': 0,
      'bc7-rgba-unorm': 0,
      'bc7-rgba-unorm-srgb': 0,
      'bc6h-rgb-ufloat': 0,

      // Compressed formats - ASTC
      'astc-4x4-unorm': 0,
      'astc-4x4-unorm-srgb': 0,
      'astc-6x6-unorm': 0,
      'astc-8x8-unorm': 0,

      // Depth/Stencil
      depth16unorm: VkFormat.D16_UNORM,
      depth24plus: VkFormat.D24_UNORM_S8_UINT,
      depth32float: VkFormat.D32_SFLOAT,
      'depth24plus-stencil8': VkFormat.D24_UNORM_S8_UINT,
      'depth32float-stencil8': VkFormat.D32_SFLOAT_S8_UINT,
    };

    return formatMap[format];
  }

  static #mapSampleCount(sampleCount: SampleCount): number {
    const sampleMap: Record<SampleCount, number> = {
      1: VkSampleCountFlagBits.COUNT_1_BIT,
      2: VkSampleCountFlagBits.COUNT_2_BIT,
      4: VkSampleCountFlagBits.COUNT_4_BIT,
      8: VkSampleCountFlagBits.COUNT_8_BIT,
    };

    return sampleMap[sampleCount];
  }

  static #mapUsage(usage: readonly string[]): number {
    let usageFlags = 0;

    for (const u of usage) {
      switch (u) {
        case 'sampler':
          usageFlags |= VkImageUsageFlagBits.SAMPLED_BIT;
          break;
        case 'color-target':
          usageFlags |= VkImageUsageFlagBits.COLOR_ATTACHMENT_BIT;
          break;
        case 'depth-target':
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

  static #findMemoryType(
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

  #device: Pointer;
  #physicalDevice: Pointer;
  #instance: Pointer;
  #memory: Pointer;
  #width: number;
  #height: number;
  #depth: number;
  #mipLevels: number;
  #format: number;
  #currentLayout: number;

  constructor(device: Pointer, physicalDevice: Pointer, texture: TextureBase) {
    this.#device = device;
    this.#physicalDevice = physicalDevice;
    this.#width = texture.width;
    this.#height = texture.height;
    this.#depth = texture.depth;
    this.#mipLevels = texture.mipLevels;
    this.#format = VkImage.#mapFormat(texture.format);
    this.#currentLayout = VkImageLayout.UNDEFINED;

    VK_DEBUG(
      `Creating image: ${this.#width}x${this.#height}x${this.#depth}, format: ${texture.format}, mips: ${this.#mipLevels}`,
    );

    this.#instance = this.#createImage(texture);
    this.#memory = this.#allocateAndBindMemory();

    VK_DEBUG(`Image created: 0x${this.#instance.toString(16)}`);
  }

  get instance() {
    return this.#instance;
  }

  get memory() {
    return this.#memory;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get depth() {
    return this.#depth;
  }

  get mipLevels() {
    return this.#mipLevels;
  }

  get format() {
    return this.#format;
  }

  get layout() {
    return this.#currentLayout;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying image: 0x${this.#instance.toString(16)}`);
    VK.vkDestroyImage(this.#device, this.#instance, null);
    VK.vkFreeMemory(this.#device, this.#memory, null);
    VK_DEBUG('Image destroyed');
  }

  #createImage(texture: TextureBase): Pointer {
    const createInfo = instantiate(vkImageCreateInfo);
    createInfo.flags = 0;
    createInfo.imageType =
      this.#depth > 1 ? VkImageType.TYPE_3D : VkImageType.TYPE_2D;
    createInfo.format = this.#format;
    createInfo.extent.width = this.#width;
    createInfo.extent.height = this.#height;
    createInfo.extent.depth = this.#depth;
    createInfo.mipLevels = this.#mipLevels;
    createInfo.arrayLayers = texture.layerCount;
    createInfo.samples = VkImage.#mapSampleCount(texture.sampleCount);
    createInfo.tiling = VkImageTiling.OPTIMAL;
    createInfo.usage = VkImage.#mapUsage(texture.usage);
    createInfo.sharingMode = 0; // VkSharingMode.EXCLUSIVE
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.initialLayout = VkImageLayout.UNDEFINED;

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateImage(
      this.#device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return Number(pointerHolder[0]!) as Pointer;
  }

  #allocateAndBindMemory(): Pointer {
    // Get memory requirements
    const memRequirements = instantiate(vkMemoryRequirements);
    VK.vkGetImageMemoryRequirements(
      this.#device,
      this.#instance,
      ptr(getInstanceBuffer(memRequirements)),
    );

    VK_DEBUG(
      `Image memory requirements: size=${memRequirements.size}, alignment=${memRequirements.alignment}`,
    );

    // Find suitable memory type
    const memoryTypeIndex = VkImage.#findMemoryType(
      this.#physicalDevice,
      memRequirements.memoryTypeBits,
      VkMemoryPropertyFlagBits.DEVICE_LOCAL_BIT,
    );

    // Allocate memory
    const allocInfo = instantiate(vkMemoryAllocateInfo);
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = memoryTypeIndex;

    const memoryHolder = new BigUint64Array(1);
    const allocResult = VK.vkAllocateMemory(
      this.#device,
      ptr(getInstanceBuffer(allocInfo)),
      null,
      ptr(memoryHolder),
    );

    if (allocResult !== VkResult.SUCCESS) {
      VK.vkDestroyImage(this.#device, this.#instance, null);
      throw new DynamicLibError(getResultMessage(allocResult), 'Vulkan');
    }

    const memory = Number(memoryHolder[0]!) as Pointer;

    // Bind memory to image
    const bindResult = VK.vkBindImageMemory(
      this.#device,
      this.#instance,
      memory,
      0n,
    );

    if (bindResult !== VkResult.SUCCESS) {
      VK.vkFreeMemory(this.#device, memory, null);
      VK.vkDestroyImage(this.#device, this.#instance, null);
      throw new DynamicLibError(getResultMessage(bindResult), 'Vulkan');
    }

    VK_DEBUG(`Image memory allocated and bound: 0x${memory.toString(16)}`);

    return memory;
  }
}
