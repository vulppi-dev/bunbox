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
  #device: VkDevice;

  #swapchain: Pointer;
  #width: number = -1;
  #height: number = -1;
  #format: number = -1;

  // Holders
  #swapchainImages: BigUint64Array;

  constructor(device: VkDevice, width: number, height: number) {
    this.#device = device;
    this.#width = width;
    this.#height = height;

    VK_DEBUG(`Creating swapchain: ${width}x${height}`);

    if (width <= 0 || height <= 0) {
      throw new DynamicLibError(
        'Swap chain dimensions must be greater than zero.',
        'Vulkan',
      );
    }

    const swapchain = this.#createSwapChain();
    this.#swapchain = swapchain.swapchain;
    this.#width = swapchain.width;
    this.#height = swapchain.height;
    this.#format = swapchain.format;
    this.#swapchainImages = swapchain.swapImages;

    VK_DEBUG(
      `Swapchain created: 0x${this.#swapchain.toString(16)}, ${this.#width}x${this.#height}, ${this.#swapchainImages.length} images`,
    );
  }

  get swapchain() {
    return this.#swapchain;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get format() {
    return this.#format;
  }

  get images() {
    const imgs: Pointer[] = [];
    for (let i = 0; i < this.#swapchainImages.length; i++) {
      imgs.push(Number(this.#swapchainImages[i]) as Pointer);
    }
    return imgs;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying swapchain: 0x${this.#swapchain.toString(16)}`);
    for (let i = 0; i < this.#swapchainImages.length; i++) {
      VK.vkDestroyImage(
        this.#device.logicalDevice,
        Number(this.#swapchainImages[i]) as Pointer,
        null,
      );
    }
    VK.vkDestroySwapchainKHR(this.#device.logicalDevice, this.#swapchain, null);
    VK_DEBUG('Swapchain destroyed');
  }

  #createSwapChain() {
    VK_DEBUG('Configuring swapchain properties');
    const details = this.#device.getSwapChainSupport();

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
      this.#height,
      details.capabilities.minImageExtent.height,
      details.capabilities.maxImageExtent.height,
    );
    const extWidth = clamp(
      this.#width,
      details.capabilities.minImageExtent.width,
      details.capabilities.maxImageExtent.width,
    );

    let imageCount = details.capabilities.minImageCount + 1;
    if (
      details.capabilities.maxImageCount > 0 &&
      imageCount > details.capabilities.maxImageCount
    ) {
      imageCount = details.capabilities.maxImageCount;
    }

    const createInfo = instantiate(vkSwapchainCreateInfoKHR);
    createInfo.surface = BigInt(this.#device.surface);
    createInfo.minImageCount = imageCount;
    createInfo.imageFormat = selectedFormat.format;
    createInfo.imageColorSpace = selectedFormat.colorSpace;
    createInfo.imageExtent.width = extWidth;
    createInfo.imageExtent.height = extHeight;
    createInfo.imageArrayLayers = 1;
    createInfo.imageUsage = VkImageUsageFlagBits.COLOR_ATTACHMENT_BIT;

    const indices = this.#device.findQueueFamilies();
    if (indices.graphicsFamily !== indices.presentFamily) {
      createInfo.imageSharingMode = VkSharingMode.CONCURRENT;
      createInfo.queueFamilyIndexCount = 2;
      createInfo.pQueueFamilyIndices = BigInt(
        ptr(
          new BigUint64Array([
            BigInt(indices.graphicsFamily!),
            BigInt(indices.presentFamily!),
          ]),
        ),
      );
    } else {
      createInfo.imageSharingMode = VkSharingMode.EXCLUSIVE;
      createInfo.queueFamilyIndexCount = 0;
      createInfo.pQueueFamilyIndices = 0n;
    }
    createInfo.preTransform = details.capabilities.currentTransform;
    createInfo.compositeAlpha = VkCompositeAlphaFlagBitsKHR.INHERIT_BIT_KHR;
    createInfo.presentMode = selectedPresentMode;
    createInfo.clipped = 1;
    createInfo.oldSwapchain = VK_NULL_HANDLE;

    VK_DEBUG('Creating Vulkan swapchain');
    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateSwapchainKHR(
      this.#device.logicalDevice,
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
      this.#device.logicalDevice,
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
