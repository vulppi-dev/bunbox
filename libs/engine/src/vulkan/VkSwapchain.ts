import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VK_NULL_HANDLE,
  VK_TRUE,
  VkColorSpaceKHR,
  VkCompositeAlphaFlagBitsKHR,
  VkFormat,
  VkImageUsageFlagBits,
  VkPresentModeKHR,
  VkResult,
  VkSharingMode,
  vkSwapchainCreateInfoKHR,
} from '@bunbox/vk';
import { clamp } from '@vulppi/toolbelt/math';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import type { VkDevice } from './VkDevice';
import { VkImageView } from './VkImageView';

export class VkSwapchain implements Disposable {
  private __device: VkDevice;

  private __instance: Pointer;
  private __width: number = -1;
  private __height: number = -1;
  private __format: number = -1;

  // Holders
  private __swapchainImages: BigUint64Array;
  private __imageViews: VkImageView[];

  constructor(device: VkDevice, width: number, height: number) {
    this.__device = device;
    this.__width = width;
    this.__height = height;

    VK_DEBUG(`Creating swapchain: ${width}x${height}`);

    if (width <= 0 || height <= 0) {
      throw new DynamicLibError(
        'Swap chain dimensions must be greater than zero.',
        'Vulkan',
      );
    }

    const swapchain = this.__createSwapChain();
    this.__instance = swapchain.swapchain;
    this.__width = swapchain.width;
    this.__height = swapchain.height;
    this.__format = swapchain.format;
    this.__swapchainImages = swapchain.swapImages;
    this.__imageViews = swapchain.imageViews;

    VK_DEBUG(
      `Swapchain created: 0x${this.__instance.toString(16)}, ${this.__width}x${this.__height}, ${this.__swapchainImages.length} images`,
    );
  }

  get instance() {
    return this.__instance;
  }

  get width() {
    return this.__width;
  }

  get height() {
    return this.__height;
  }

  get format() {
    return this.__format;
  }

  get images() {
    const imgs: bigint[] = [];
    for (let i = 0; i < this.__swapchainImages.length; i++) {
      imgs.push(this.__swapchainImages[i]!);
    }
    return imgs;
  }

  get imageViews() {
    return this.__imageViews;
  }

  get imageCount() {
    return this.__swapchainImages.length;
  }

  get frameCount() {
    return Math.max(this.imageCount - 1, 2);
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying swapchain: 0x${this.__instance.toString(16)}`);
    VK.vkDestroySwapchainKHR(
      this.__device.logicalDevice,
      this.__instance,
      null,
    );
    VK_DEBUG('Swapchain destroyed');
  }

  private __createSwapChain() {
    VK_DEBUG('Configuring swapchain properties');
    const details = this.__device.getSwapChainSupport();

    const selectedFormat =
      details.formats.find(
        (format) =>
          format.format === VkFormat.B8G8R8A8_SRGB &&
          format.colorSpace === VkColorSpaceKHR.SRGB_NONLINEAR_KHR,
      ) || details.formats[0]!;
    const selectedPresentMode = details.presentModes.includes(
      VkPresentModeKHR.MAILBOX_KHR,
    )
      ? VkPresentModeKHR.MAILBOX_KHR
      : VkPresentModeKHR.FIFO_KHR!;

    VK_DEBUG(
      `Swapchain format: ${selectedFormat.format}, present mode: ${selectedPresentMode}`,
    );

    const extHeight = clamp(
      this.__height,
      details.capabilities.minImageExtent.height,
      details.capabilities.maxImageExtent.height,
    );
    const extWidth = clamp(
      this.__width,
      details.capabilities.minImageExtent.width,
      details.capabilities.maxImageExtent.width,
    );

    let imageCount = Math.max(
      selectedPresentMode === VkPresentModeKHR.MAILBOX_KHR ? 4 : 2,
      details.capabilities.minImageCount + 1,
    );
    if (
      details.capabilities.maxImageCount > 0 &&
      imageCount > details.capabilities.maxImageCount
    ) {
      imageCount = details.capabilities.maxImageCount;
    }

    const createInfo = instantiate(vkSwapchainCreateInfoKHR);
    createInfo.surface = BigInt(this.__device.surface);
    createInfo.minImageCount = imageCount;
    createInfo.imageFormat = selectedFormat.format;
    createInfo.imageColorSpace = selectedFormat.colorSpace;
    createInfo.imageExtent.width = extWidth;
    createInfo.imageExtent.height = extHeight;
    createInfo.imageArrayLayers = 1;
    createInfo.imageUsage = VkImageUsageFlagBits.COLOR_ATTACHMENT_BIT;

    createInfo.imageSharingMode = VkSharingMode.EXCLUSIVE;
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.preTransform = details.capabilities.currentTransform;

    createInfo.compositeAlpha = VkCompositeAlphaFlagBitsKHR.OPAQUE_BIT_KHR;
    createInfo.presentMode = selectedPresentMode;
    createInfo.clipped = VK_TRUE;
    createInfo.oldSwapchain = VK_NULL_HANDLE;

    VK_DEBUG('Creating Vulkan swapchain');
    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateSwapchainKHR(
      this.__device.logicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );
    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    const swapchain = Number(pointerHolder[0]) as Pointer;
    const swapImages = new BigUint64Array(imageCount);

    VK_DEBUG(`Getting ${imageCount} swapchain images`);
    VK.vkGetSwapchainImagesKHR(
      this.__device.logicalDevice,
      swapchain,
      ptr(new Uint32Array([imageCount])),
      ptr(swapImages),
    );

    const imageViews: VkImageView[] = [];

    for (let i = 0; i < imageCount; i++) {
      const img = swapImages[i]!;
      const view = new VkImageView({
        device: this.__device.logicalDevice,
        image: img,
        format: selectedFormat.format,
        mask: ['color'],
      });
      imageViews.push(view);
    }

    return {
      swapchain,
      height: extHeight,
      width: extWidth,
      format: selectedFormat.format,
      swapImages,
      imageViews,
    };
  }
}
