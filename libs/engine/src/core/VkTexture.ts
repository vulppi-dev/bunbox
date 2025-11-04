import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  VK,
  Vk_ImageLayout,
  Vk_ImageTiling,
  Vk_ImageType,
  Vk_ImageViewType,
  Vk_MemoryPropertyFlagBits,
  Vk_Result,
  Vk_SampleCountFlagBits,
  Vk_SharingMode,
  Vk_StructureType,
  VkImageCreateInfo,
  VkImageViewCreateInfo,
  VkMemoryAllocateInfo,
  VkMemoryRequirements,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import type { TextureImage } from '../elements';
import { VK_DEBUG } from '../singleton/logger';
import {
  getImageAspectFlags,
  textureFormatToVulkan,
  textureUsageToVulkan,
} from './helpers/texture-format-mapping';

/**
 * VkTexture - Vulkan-specific texture implementation
 *
 * This class is the internal Vulkan representation of a texture.
 * It does NOT extend TextureImage (elements API).
 * Instead, it receives a TextureImage as input and creates Vulkan resources.
 *
 * The Renderer is responsible for converting TextureImage → VkTexture.
 */
export class VkTexture implements Disposable {
  // Reference to source TextureImage
  #sourceTexture: TextureImage;

  #vkLogicalDevice: Pointer;
  #vkPhysicalDevice: Pointer;

  // Vulkan resources
  #vkImage: Pointer | null = null;
  #vkImageView: Pointer | null = null;
  #vkMemory: Pointer | null = null;

  // Current image layout
  #currentLayout: Vk_ImageLayout = Vk_ImageLayout.UNDEFINED;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(
    vkLogicalDevice: Pointer,
    vkPhysicalDevice: Pointer,
    sourceTexture: TextureImage,
  ) {
    this.#sourceTexture = sourceTexture;
    this.#vkLogicalDevice = vkLogicalDevice;
    this.#vkPhysicalDevice = vkPhysicalDevice;
    this.#ptr_aux = new BigUint64Array(1);

    this.#createImage();
    this.#allocateMemory();
    this.#createImageView();
  }

  /**
   * Get the source TextureImage that this VkTexture was created from
   */
  get sourceTexture(): TextureImage {
    return this.#sourceTexture;
  }

  get image(): Pointer {
    if (!this.#vkImage) {
      throw new DynamicLibError('VkImage not created', 'Vulkan');
    }
    return this.#vkImage;
  }

  get imageView(): Pointer {
    if (!this.#vkImageView) {
      throw new DynamicLibError('VkImageView not created', 'Vulkan');
    }
    return this.#vkImageView;
  }

  get currentLayout(): Vk_ImageLayout {
    return this.#currentLayout;
  }

  set currentLayout(layout: Vk_ImageLayout) {
    this.#currentLayout = layout;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(
      `Disposing VkTexture: ${this.#sourceTexture.label || this.#sourceTexture.id}`,
    );

    // Destroy image view
    if (this.#vkImageView) {
      VK_DEBUG(`Destroying image view: 0x${this.#vkImageView.toString(16)}`);
      VK.vkDestroyImageView(this.#vkLogicalDevice, this.#vkImageView, null);
      this.#vkImageView = null;
    }

    // Destroy image
    if (this.#vkImage) {
      VK_DEBUG(`Destroying image: 0x${this.#vkImage.toString(16)}`);
      VK.vkDestroyImage(this.#vkLogicalDevice, this.#vkImage, null);
      this.#vkImage = null;
    }

    // Free memory
    if (this.#vkMemory) {
      VK_DEBUG(`Freeing memory: 0x${this.#vkMemory.toString(16)}`);
      VK.vkFreeMemory(this.#vkLogicalDevice, this.#vkMemory, null);
      this.#vkMemory = null;
    }

    VK_DEBUG('VkTexture disposed');
  }

  #createImage(): void {
    VK_DEBUG(
      `Creating VkImage: ${this.#sourceTexture.width}x${this.#sourceTexture.height}, format=${this.#sourceTexture.format}, mips=${this.#sourceTexture.mipLevels}`,
    );

    const vkFormat = textureFormatToVulkan(this.#sourceTexture.format);
    const usage = textureUsageToVulkan(Array.from(this.#sourceTexture.usage));

    const createInfo = instantiate(VkImageCreateInfo);
    createInfo.sType = Vk_StructureType.IMAGE_CREATE_INFO;
    createInfo.imageType = Vk_ImageType.TYPE_2D;
    createInfo.format = vkFormat;
    createInfo.extent.width = this.#sourceTexture.width;
    createInfo.extent.height = this.#sourceTexture.height;
    createInfo.extent.depth = 1;
    createInfo.mipLevels = this.#sourceTexture.mipLevels;
    createInfo.arrayLayers = 1;
    createInfo.samples = this.#sampleCountToVulkan(
      this.#sourceTexture.sampleCount,
    );
    createInfo.tiling = Vk_ImageTiling.OPTIMAL;
    createInfo.usage = usage;
    createInfo.sharingMode = Vk_SharingMode.EXCLUSIVE;
    createInfo.initialLayout = Vk_ImageLayout.UNDEFINED;

    const result = VK.vkCreateImage(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create VkImage. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkImage = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`VkImage created: 0x${this.#vkImage.toString(16)}`);
  }

  #allocateMemory(): void {
    if (!this.#vkImage) {
      throw new DynamicLibError(
        'Cannot allocate memory without VkImage',
        'Vulkan',
      );
    }

    VK_DEBUG('Allocating memory for VkImage');

    // Get memory requirements
    const memRequirements = instantiate(VkMemoryRequirements);
    VK.vkGetImageMemoryRequirements(
      this.#vkLogicalDevice,
      this.#vkImage,
      ptr(getInstanceBuffer(memRequirements)),
    );

    // Find suitable memory type
    const memoryTypeIndex = this.#findMemoryType(
      Number(memRequirements.memoryTypeBits),
      Vk_MemoryPropertyFlagBits.DEVICE_LOCAL_BIT,
    );

    // Allocate memory
    const allocInfo = instantiate(VkMemoryAllocateInfo);
    allocInfo.sType = Vk_StructureType.MEMORY_ALLOCATE_INFO;
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = memoryTypeIndex;

    const result = VK.vkAllocateMemory(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(allocInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to allocate image memory. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkMemory = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Memory allocated: 0x${this.#vkMemory.toString(16)}`);

    // Bind image memory
    const bindResult = VK.vkBindImageMemory(
      this.#vkLogicalDevice,
      this.#vkImage,
      this.#vkMemory,
      0n, // offset
    );

    if (bindResult !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to bind image memory. VkResult: ${bindResult}`,
        'Vulkan',
      );
    }

    VK_DEBUG('Image memory bound');
  }

  #createImageView(): void {
    if (!this.#vkImage) {
      throw new DynamicLibError(
        'Cannot create image view without VkImage',
        'Vulkan',
      );
    }

    VK_DEBUG('Creating VkImageView');

    const vkFormat = textureFormatToVulkan(this.#sourceTexture.format);
    const aspectMask = getImageAspectFlags(this.#sourceTexture.format);

    const createInfo = instantiate(VkImageViewCreateInfo);
    createInfo.sType = Vk_StructureType.IMAGE_VIEW_CREATE_INFO;
    createInfo.image = BigInt(this.#vkImage as number);
    createInfo.viewType = Vk_ImageViewType.TYPE_2D;
    createInfo.format = vkFormat;
    createInfo.subresourceRange.aspectMask = aspectMask;
    createInfo.subresourceRange.baseMipLevel = 0;
    createInfo.subresourceRange.levelCount = this.#sourceTexture.mipLevels;
    createInfo.subresourceRange.baseArrayLayer = 0;
    createInfo.subresourceRange.layerCount = 1;

    const result = VK.vkCreateImageView(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create image view. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkImageView = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`VkImageView created: 0x${this.#vkImageView.toString(16)}`);
  }

  #findMemoryType(typeFilter: number, properties: number): number {
    // Get physical device memory properties
    const memProperties = new Uint8Array(1024); // VkPhysicalDeviceMemoryProperties size
    VK.vkGetPhysicalDeviceMemoryProperties(
      this.#vkPhysicalDevice,
      ptr(memProperties),
    );

    // Parse memory properties
    const view = new DataView(memProperties.buffer);
    const memoryTypeCount = view.getUint32(0, true);

    for (let i = 0; i < memoryTypeCount; i++) {
      const memoryTypeOffset = 4 + i * 8; // Skip count + previous types
      const propertyFlags = view.getUint32(memoryTypeOffset + 4, true);

      if (
        typeFilter & (1 << i) &&
        (propertyFlags & properties) === properties
      ) {
        return i;
      }
    }

    throw new DynamicLibError(
      'Failed to find suitable memory type for image',
      'Vulkan',
    );
  }

  #sampleCountToVulkan(count: number): number {
    switch (count) {
      case 1:
        return Vk_SampleCountFlagBits.COUNT_1_BIT;
      case 2:
        return Vk_SampleCountFlagBits.COUNT_2_BIT;
      case 4:
        return Vk_SampleCountFlagBits.COUNT_4_BIT;
      case 8:
        return Vk_SampleCountFlagBits.COUNT_8_BIT;
      default:
        return Vk_SampleCountFlagBits.COUNT_1_BIT;
    }
  }
}
