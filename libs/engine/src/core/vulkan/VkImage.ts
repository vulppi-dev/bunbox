import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
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
import { mapSampleCountToVk, mapTextureFormatToVk } from './remap';

/**
 * Wrapper for Vulkan VkImage
 * Creates GPU images for textures, depth buffers, stencil buffers, etc.
 * Handles memory allocation and binding automatically.
 */
export class VkImage implements Disposable {
  private static __mapUsage(usage: readonly TextureUsage[]): number {
    let usageFlags = 0;

    for (const u of usage) {
      switch (u) {
        case 'sampled':
          usageFlags |= VkImageUsageFlagBits.SAMPLED_BIT;
          break;
        case 'color-attachment':
          usageFlags |= VkImageUsageFlagBits.COLOR_ATTACHMENT_BIT;
          break;
        case 'depth-stencil-attachment':
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
    this.__format = mapTextureFormatToVk(texture.format);
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

  dispose(): void {
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
    createInfo.samples = mapSampleCountToVk(texture.sampleCount);
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
