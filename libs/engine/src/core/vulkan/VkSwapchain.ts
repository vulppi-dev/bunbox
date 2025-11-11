import { ptr, type Pointer } from 'bun:ffi';
import type { Disposable } from '@bunbox/utils';
import { DynamicLibError } from '../../errors';
import type { VkDevice } from './VkDevice';
import {
  getResultMessage,
  VK,
  VK_NULL_HANDLE,
  VkColorSpaceKHR,
  VkCompositeAlphaFlagBitsKHR,
  VkFormat,
  VkImageAspectFlagBits,
  VkImageUsageFlagBits,
  vkImageViewCreateInfo,
  VkImageViewType,
  VkPresentModeKHR,
  VkResult,
  VkSharingMode,
  vkSwapchainCreateInfoKHR,
} from '@bunbox/vk';
import { clamp } from '@vulppi/toolbelt/math';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { VK_DEBUG } from '../../singleton/logger';

export class VkSwapchain implements Disposable {
  private __device: VkDevice;

  private __swapchain: Pointer;
  private __width: number = -1;
  private __height: number = -1;
  private __format: number = -1;

  // Holders
  private __swapchainImages: BigUint64Array;

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
    this.__swapchain = swapchain.swapchain;
    this.__width = swapchain.width;
    this.__height = swapchain.height;
    this.__format = swapchain.format;
    this.__swapchainImages = swapchain.swapImages;

    VK_DEBUG(
      `Swapchain created: 0x${this.__swapchain.toString(16)}, ${this.__width}x${this.__height}, ${this.__swapchainImages.length} images`,
    );
  }

  get swapchain() {
    return this.__swapchain;
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
    const imgs: Pointer[] = [];
    for (let i = 0; i < this.__swapchainImages.length; i++) {
      imgs.push(Number(this.__swapchainImages[i]) as Pointer);
    }
    return imgs;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying swapchain: 0x${this.__swapchain.toString(16)}`);
    for (let i = 0; i < this.__swapchainImages.length; i++) {
      VK.vkDestroyImage(
        this.__device.logicalDevice,
        Number(this.__swapchainImages[i]) as Pointer,
        null,
      );
    }
    VK.vkDestroySwapchainKHR(
      this.__device.logicalDevice,
      this.__swapchain,
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
          format.format === VkFormat.B8G8R8A8_UNORM &&
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

    const indices = this.__device.findQueueFamily();
    createInfo.imageSharingMode = VkSharingMode.EXCLUSIVE;
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.preTransform = details.capabilities.currentTransform;
    createInfo.compositeAlpha = VkCompositeAlphaFlagBitsKHR.INHERIT_BIT_KHR;
    createInfo.presentMode = selectedPresentMode;
    createInfo.clipped = 1;
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

    return {
      swapchain,
      height: extHeight,
      width: extWidth,
      format: selectedFormat.format,
      swapImages,
    };
  }
}
