import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  VK,
  Vk_ComponentSwizzle,
  Vk_CompositeAlphaFlagBitsKHR,
  Vk_FenceCreateFlagBits,
  Vk_ImageAspectFlagBits,
  Vk_ImageUsageFlagBits,
  Vk_ImageViewType,
  Vk_PipelineStageFlagBits,
  Vk_Result,
  Vk_SharingMode,
  Vk_StructureType,
  vkGetSurfaceCapabilities,
  vkGetSurfaceFormats,
  vkSelectPresentMode,
  VkFenceCreateInfo,
  VkFramebufferCreateInfo,
  VkImageViewCreateInfo,
  VkPresentInfoKHR,
  VkSemaphoreCreateInfo,
  VkSubmitInfo,
  VkSwapchainCreateInfoKHR,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { CommandBuffer } from './CommandBuffer';
import type { CommandPool } from './CommandPool';

export type SwapchainFrame = {
  imageIndex: number;
  imageView: Pointer;
  framebuffer: Pointer;
  commandBuffer: CommandBuffer;
  imageAvailableSemaphore: Pointer;
  renderFinishedSemaphore: Pointer;
  fence: Pointer;
};

export class Swapchain implements Disposable {
  static readonly #MAX_FRAMES_IN_FLIGHT = 2;
  static readonly #TIMEOUT = 1000_000_000n; // 1 second in nanoseconds

  #vkPhysicalDevice: Pointer;
  #vkLogicalDevice: Pointer;
  #vkSurface: Pointer;
  #vkRenderPass: Pointer;
  #commandPool: CommandPool;

  // Surface capabilities and configuration
  #surfaceCapabilities: any = null;
  #surfaceFormats: any[] = [];
  #selectedPresentMode: number | null = null;

  // Swapchain resources
  #swapchain: Pointer | null = null;
  #swapchainImages: Pointer[] = [];
  #swapchainImageCount: number = 0;
  #swapchainImageViews: Pointer[] = [];
  #swapchainFramebuffers: Pointer[] = [];

  // Command buffers
  #commandBuffers: CommandBuffer[] = [];

  // Synchronization objects (for MAX_FRAMES_IN_FLIGHT frames)
  #imageAvailableSemaphores: Pointer[] = [];
  #renderFinishedSemaphores: Pointer[] = [];
  #inFlightFences: Pointer[] = [];
  #imagesInFlight: Map<number, Pointer> = new Map(); // Track which fence is using which image
  #currentFrame: number = 0;

  // Auxiliary data
  #ptr_aux: BigUint64Array;
  #fence_aux: BigUint64Array; // Reusable buffer for fence operations

  constructor(
    vkPhysicalDevice: Pointer,
    vkLogicalDevice: Pointer,
    vkSurface: Pointer,
    vkRenderPass: Pointer,
    commandPool: CommandPool,
    width: number,
    height: number,
  ) {
    this.#vkPhysicalDevice = vkPhysicalDevice;
    this.#vkLogicalDevice = vkLogicalDevice;
    this.#vkSurface = vkSurface;
    this.#vkRenderPass = vkRenderPass;
    this.#commandPool = commandPool;

    this.#ptr_aux = new BigUint64Array(1);
    this.#fence_aux = new BigUint64Array(1);

    // Initialize swapchain configuration
    this.#querySurfaceCapabilities();
    this.#querySurfaceFormats();
    this.#selectPresentMode();

    // Create synchronization objects
    this.#createSyncObjects();

    // Create swapchain and related resources
    if (width > 0 && height > 0) {
      this.#createSwapchain(width, height);
    }
  }

  get imageCount(): number {
    return this.#swapchainImageCount;
  }

  dispose(): void {
    VK_DEBUG('Disposing Swapchain resources');

    // Wait for device to finish before cleanup
    VK.vkDeviceWaitIdle(this.#vkLogicalDevice);

    // Destroy synchronization objects
    this.#destroySyncObjects();

    // Destroy command buffers
    this.#freeCommandBuffers();

    // Destroy swapchain and related resources
    this.#destroySwapchain();

    VK_DEBUG('Swapchain resources disposed');
  }

  rebuild(width: number, height: number): void {
    VK_DEBUG(`=== Rebuilding Swapchain: ${width}x${height} ===`);

    // Don't create swapchain if window is minimized (0x0)
    if (width === 0 || height === 0) {
      VK_DEBUG('Window minimized (0x0), skipping swapchain creation');
      return;
    }

    // Store previous image count to detect changes
    const previousImageCount = this.#swapchainImageCount;

    // Re-query surface capabilities to ensure they're up to date
    this.#querySurfaceCapabilities();

    // Check if swapchain needs recreation
    const currentExtent = this.#surfaceCapabilities?.currentExtent;
    const needsRecreate =
      !this.#swapchain ||
      !currentExtent ||
      currentExtent.width !== width ||
      currentExtent.height !== height;

    if (needsRecreate) {
      const old = this.#swapchain ?? undefined;
      // Clear images in flight tracking when recreating swapchain
      this.#imagesInFlight.clear();
      this.#createSwapchain(width, height, old);
    } else {
      VK_DEBUG('Swapchain size unchanged, skipping recreation');
    }

    // Check if image count changed and recreate command buffers if needed
    if (
      previousImageCount > 0 &&
      this.#swapchainImageCount !== previousImageCount
    ) {
      VK_DEBUG(
        `Swapchain image count changed from ${previousImageCount} to ${this.#swapchainImageCount}, command buffers reallocated`,
      );
    }

    VK_DEBUG('=== Swapchain Rebuild Complete ===');
  }

  next(): SwapchainFrame | null {
    if (
      !this.#swapchain ||
      this.#swapchainImageCount === 0 ||
      this.#commandBuffers.length === 0
    ) {
      VK_DEBUG('Cannot acquire next frame: swapchain not ready');
      return null;
    }

    VK_DEBUG(`Acquiring next frame (current frame: ${this.#currentFrame})`);

    // Wait for the current frame's fence to be signaled
    const fence = this.#inFlightFences[this.#currentFrame]!;
    this.#fence_aux[0] = BigInt(fence);
    VK_DEBUG(`Waiting for fence: 0x${fence.toString(16)}`);
    VK.vkWaitForFences(
      this.#vkLogicalDevice,
      1,
      ptr(this.#fence_aux),
      1, // VK_TRUE
      Swapchain.#TIMEOUT,
    );
    VK_DEBUG('Fence signaled');

    // Acquire next image
    const imageIndexBuffer = new Uint32Array(1);
    const imageAvailableSemaphore =
      this.#imageAvailableSemaphores[this.#currentFrame]!;

    VK_DEBUG('Acquiring swapchain image...');
    const result = VK.vkAcquireNextImageKHR(
      this.#vkLogicalDevice,
      this.#swapchain,
      Swapchain.#TIMEOUT,
      imageAvailableSemaphore,
      null, // null fence
      ptr(imageIndexBuffer),
    );

    if (result === Vk_Result.ERROR_OUT_OF_DATE_KHR) {
      VK_DEBUG('Swapchain out of date, needs rebuild');
      return null;
    }

    if (result !== Vk_Result.SUCCESS && result !== Vk_Result.SUBOPTIMAL_KHR) {
      throw new DynamicLibError(
        `Failed to acquire swapchain image. VkResult: ${result}`,
        'Vulkan',
      );
    }

    const imageIndex = imageIndexBuffer[0]!;
    VK_DEBUG(`Acquired image index: ${imageIndex}`);

    // Check if this image is already in use by another frame
    const imageInUseFence = this.#imagesInFlight.get(imageIndex);
    if (imageInUseFence !== undefined) {
      VK_DEBUG(
        `Image ${imageIndex} in use by fence 0x${imageInUseFence.toString(16)}, waiting...`,
      );
      this.#fence_aux[0] = BigInt(imageInUseFence);
      VK.vkWaitForFences(
        this.#vkLogicalDevice,
        1,
        ptr(this.#fence_aux),
        1, // VK_TRUE
        Swapchain.#TIMEOUT,
      );
      VK_DEBUG(`Image ${imageIndex} now available`);
    }

    // Mark this image as now being in use by this frame
    this.#imagesInFlight.set(imageIndex, fence);
    VK_DEBUG(
      `Image ${imageIndex} now tracked by fence 0x${fence.toString(16)}`,
    );

    // Reset the fence only after we've confirmed we're using it
    this.#fence_aux[0] = BigInt(fence);
    VK.vkResetFences(this.#vkLogicalDevice, 1, ptr(this.#fence_aux));
    VK_DEBUG(`Fence 0x${fence.toString(16)} reset`);

    VK_DEBUG(
      `Frame ${this.#currentFrame} ready: image=${imageIndex}, cmd=0x${this.#commandBuffers[imageIndex]!.buffer.toString(16)}`,
    );

    return {
      imageIndex,
      imageView: this.#swapchainImageViews[imageIndex]!,
      framebuffer: this.#swapchainFramebuffers[imageIndex]!,
      commandBuffer: this.#commandBuffers[imageIndex]!,
      imageAvailableSemaphore,
      renderFinishedSemaphore:
        this.#renderFinishedSemaphores[this.#currentFrame]!,
      fence,
    };
  }

  present(imageIndex: number, vkGraphicsQueue: Pointer): boolean {
    if (!this.#swapchain) {
      VK_DEBUG('Cannot present: swapchain not available');
      return false;
    }

    const currentFrame = this.#currentFrame;
    const commandBuffer = this.#commandBuffers[imageIndex]!.buffer;
    const imageAvailableSemaphore =
      this.#imageAvailableSemaphores[currentFrame]!;
    const renderFinishedSemaphore =
      this.#renderFinishedSemaphores[currentFrame]!;
    const fence = this.#inFlightFences[currentFrame]!;

    VK_DEBUG(
      `Presenting frame ${currentFrame}, image ${imageIndex}, cmd=0x${commandBuffer.toString(16)}`,
    );

    // Submit command buffer
    const waitStages = new Uint32Array([
      Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
    ]);
    const commandBuffers = new BigUint64Array([BigInt(commandBuffer)]);
    const waitSemaphores = new BigUint64Array([
      BigInt(imageAvailableSemaphore),
    ]);
    const signalSemaphores = new BigUint64Array([
      BigInt(renderFinishedSemaphore),
    ]);

    const submitInfo = instantiate(VkSubmitInfo);
    submitInfo.sType = Vk_StructureType.SUBMIT_INFO;
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = BigInt(ptr(waitSemaphores));
    submitInfo.pWaitDstStageMask = BigInt(ptr(waitStages));
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = BigInt(ptr(commandBuffers));
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = BigInt(ptr(signalSemaphores));

    VK_DEBUG('Submitting command buffer to graphics queue');
    let result = VK.vkQueueSubmit(
      vkGraphicsQueue,
      1,
      ptr(getInstanceBuffer(submitInfo)),
      fence,
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to submit command buffer. VkResult: ${result}`,
        'Vulkan',
      );
    }
    VK_DEBUG('Command buffer submitted successfully');

    // Present image
    const swapchains = new BigUint64Array([BigInt(this.#swapchain)]);
    const indices = new Uint32Array([imageIndex]);
    const signalSemaphoresPresent = new BigUint64Array([
      BigInt(renderFinishedSemaphore),
    ]);

    const presentInfo = instantiate(VkPresentInfoKHR);
    presentInfo.sType = Vk_StructureType.PRESENT_INFO_KHR;
    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = BigInt(ptr(signalSemaphoresPresent));
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = BigInt(ptr(swapchains));
    presentInfo.pImageIndices = BigInt(ptr(indices));

    VK_DEBUG('Presenting image to screen');
    result = VK.vkQueuePresentKHR(
      vkGraphicsQueue,
      ptr(getInstanceBuffer(presentInfo)),
    );

    // Advance to next frame
    this.#currentFrame =
      (this.#currentFrame + 1) % Swapchain.#MAX_FRAMES_IN_FLIGHT;

    if (
      result === Vk_Result.ERROR_OUT_OF_DATE_KHR ||
      result === Vk_Result.SUBOPTIMAL_KHR
    ) {
      VK_DEBUG('Swapchain suboptimal or out of date after present');
      return false;
    }

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to present swapchain image. VkResult: ${result}`,
        'Vulkan',
      );
    }

    VK_DEBUG('Frame presented successfully');
    return true;
  }

  #querySurfaceCapabilities(): void {
    this.#surfaceCapabilities = vkGetSurfaceCapabilities(
      this.#vkPhysicalDevice,
      this.#vkSurface,
    );
  }

  #querySurfaceFormats(): void {
    this.#surfaceFormats = vkGetSurfaceFormats(
      this.#vkPhysicalDevice,
      this.#vkSurface,
    );
  }

  #selectPresentMode(): void {
    this.#selectedPresentMode = vkSelectPresentMode(
      this.#vkPhysicalDevice,
      this.#vkSurface,
    );
  }

  #createSwapchain(
    width: number,
    height: number,
    oldSwapchain?: Pointer,
  ): void {
    if (!this.#surfaceCapabilities || !this.#selectedPresentMode) {
      throw new DynamicLibError(
        'Surface capabilities or present mode not queried',
        'Vulkan',
      );
    }

    VK_DEBUG(`Creating swapchain for ${width}x${height}`);

    const capabilities = this.#surfaceCapabilities;

    // Determine image count (prefer triple buffering if available)
    let imageCount = capabilities.minImageCount + 1;
    if (
      capabilities.maxImageCount > 0 &&
      imageCount > capabilities.maxImageCount
    ) {
      imageCount = capabilities.maxImageCount;
    }

    VK_DEBUG(
      `Image count: ${imageCount} (min: ${capabilities.minImageCount}, max: ${capabilities.maxImageCount})`,
    );

    // Select the first available format
    if (this.#surfaceFormats.length === 0) {
      throw new DynamicLibError('No surface formats available', 'Vulkan');
    }
    const selectedFormat = this.#surfaceFormats[0];
    VK_DEBUG(
      `Selected format: ${selectedFormat.format}, colorSpace: ${selectedFormat.colorSpace}`,
    );

    // Create swapchain info
    const createInfo = instantiate(VkSwapchainCreateInfoKHR);
    createInfo.sType = Vk_StructureType.SWAPCHAIN_CREATE_INFO_KHR;
    createInfo.surface = BigInt(this.#vkSurface);
    createInfo.minImageCount = imageCount;
    createInfo.imageFormat = selectedFormat.format;
    createInfo.imageColorSpace = selectedFormat.colorSpace;
    createInfo.imageExtent.width = width;
    createInfo.imageExtent.height = height;
    createInfo.imageArrayLayers = 1;
    createInfo.imageUsage = Vk_ImageUsageFlagBits.COLOR_ATTACHMENT_BIT;
    createInfo.imageSharingMode = Vk_SharingMode.EXCLUSIVE;
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.preTransform = capabilities.currentTransform;
    createInfo.compositeAlpha = Vk_CompositeAlphaFlagBitsKHR.OPAQUE_BIT_KHR;
    createInfo.presentMode = this.#selectedPresentMode!;
    createInfo.clipped = true;
    createInfo.oldSwapchain = oldSwapchain ? BigInt(oldSwapchain) : 0n;

    // Create swapchain
    let result = VK.vkCreateSwapchainKHR(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS && result !== Vk_Result.SUBOPTIMAL_KHR) {
      throw new DynamicLibError(
        `Failed to create swapchain. VkResult: ${result}`,
        'Vulkan',
      );
    }

    const newSwapchain = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Swapchain created: 0x${newSwapchain.toString(16)}`);

    // Get swapchain images
    const countAux = new Uint32Array(1);
    result = VK.vkGetSwapchainImagesKHR(
      this.#vkLogicalDevice,
      newSwapchain,
      ptr(countAux),
      null,
    );

    if (result !== Vk_Result.SUCCESS) {
      VK.vkDestroySwapchainKHR(this.#vkLogicalDevice, newSwapchain, null);
      throw new DynamicLibError(
        `Failed to get swapchain image count. VkResult: ${result}`,
        'Vulkan',
      );
    }

    const newImageCount = countAux[0]!;
    VK_DEBUG(`Swapchain has ${newImageCount} images`);

    const imagesBuffer = new BigUint64Array(newImageCount);

    result = VK.vkGetSwapchainImagesKHR(
      this.#vkLogicalDevice,
      newSwapchain,
      ptr(countAux),
      ptr(imagesBuffer),
    );

    if (result !== Vk_Result.SUCCESS) {
      VK.vkDestroySwapchainKHR(this.#vkLogicalDevice, newSwapchain, null);
      throw new DynamicLibError(
        `Failed to get swapchain images. VkResult: ${result}`,
        'Vulkan',
      );
    }

    const newImages = Array.from(imagesBuffer).map(
      (img) => Number(img) as Pointer,
    );
    VK_DEBUG(
      `Retrieved ${newImages.length} swapchain images: ${newImages.map((img) => `0x${img.toString(16)}`).join(', ')}`,
    );

    // If there was a previous swapchain, destroy it now
    if (oldSwapchain) {
      VK_DEBUG(`Destroying old swapchain: 0x${oldSwapchain.toString(16)}`);
      VK.vkDeviceWaitIdle(this.#vkLogicalDevice);
      VK.vkDestroySwapchainKHR(this.#vkLogicalDevice, oldSwapchain, null);
      VK_DEBUG('Old swapchain destroyed');
    }

    // Replace current swapchain with new one
    this.#swapchain = newSwapchain;
    this.#swapchainImages = newImages;
    this.#swapchainImageCount = newImages.length;

    // Create image views for the swapchain images
    this.#createImageViews();

    // Create framebuffers for each image view
    this.#createFramebuffers(width, height);

    // Allocate command buffers (or reallocate if count changed)
    if (this.#commandBuffers.length !== newImages.length) {
      this.#freeCommandBuffers();
      this.#allocateCommandBuffers();
    }
  }

  #destroySwapchain(): void {
    if (!this.#swapchain) return;

    VK_DEBUG(`Destroying swapchain: 0x${this.#swapchain.toString(16)}`);

    // Wait for device to be idle before destroying
    VK_DEBUG('Waiting for device to be idle...');
    VK.vkDeviceWaitIdle(this.#vkLogicalDevice);

    // Destroy framebuffers
    this.#destroyFramebuffers();

    // Destroy image views
    this.#destroyImageViews();

    // Destroy swapchain
    VK.vkDestroySwapchainKHR(this.#vkLogicalDevice, this.#swapchain, null);
    VK_DEBUG('Swapchain destroyed');

    // Clear swapchain data
    this.#swapchain = null;
    this.#swapchainImages = [];
    this.#swapchainImageCount = 0;
  }

  #createImageViews(): void {
    VK_DEBUG(`Creating ${this.#swapchainImageCount} image views`);

    this.#swapchainImageViews = [];

    const format = this.#surfaceFormats[0]?.format;
    if (format === undefined) {
      throw new DynamicLibError('No surface format available', 'Vulkan');
    }

    for (let i = 0; i < this.#swapchainImageCount; i++) {
      const createInfo = instantiate(VkImageViewCreateInfo);
      createInfo.sType = Vk_StructureType.IMAGE_VIEW_CREATE_INFO;
      createInfo.image = BigInt(this.#swapchainImages[i] as number);
      createInfo.viewType = Vk_ImageViewType.TYPE_2D;
      createInfo.format = format;

      // Identity component mapping
      createInfo.components.r = Vk_ComponentSwizzle.IDENTITY;
      createInfo.components.g = Vk_ComponentSwizzle.IDENTITY;
      createInfo.components.b = Vk_ComponentSwizzle.IDENTITY;
      createInfo.components.a = Vk_ComponentSwizzle.IDENTITY;

      // Subresource range
      createInfo.subresourceRange.aspectMask = Vk_ImageAspectFlagBits.COLOR_BIT;
      createInfo.subresourceRange.baseMipLevel = 0;
      createInfo.subresourceRange.levelCount = 1;
      createInfo.subresourceRange.baseArrayLayer = 0;
      createInfo.subresourceRange.layerCount = 1;

      const result = VK.vkCreateImageView(
        this.#vkLogicalDevice,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(this.#ptr_aux),
      );

      if (result !== Vk_Result.SUCCESS) {
        // Clean up already created image views before throwing
        for (const view of this.#swapchainImageViews) {
          VK.vkDestroyImageView(this.#vkLogicalDevice, view, null);
        }
        this.#swapchainImageViews = [];
        throw new DynamicLibError(
          `Failed to create image view ${i}. VkResult: ${result}`,
          'Vulkan',
        );
      }

      const imageView = Number(this.#ptr_aux[0]) as Pointer;
      this.#swapchainImageViews.push(imageView);
      VK_DEBUG(`Image view ${i} created: 0x${imageView.toString(16)}`);
    }

    VK_DEBUG(`All ${this.#swapchainImageCount} image views created`);
  }

  #destroyImageViews(): void {
    if (this.#swapchainImageViews.length === 0) {
      return;
    }

    VK_DEBUG(`Destroying ${this.#swapchainImageViews.length} image views`);

    for (const imageView of this.#swapchainImageViews) {
      VK.vkDestroyImageView(this.#vkLogicalDevice, imageView, null);
    }

    this.#swapchainImageViews = [];
    VK_DEBUG('Image views destroyed');
  }

  #createFramebuffers(width: number, height: number): void {
    VK_DEBUG(`Creating ${this.#swapchainImageViews.length} framebuffers`);

    this.#swapchainFramebuffers = [];

    for (let i = 0; i < this.#swapchainImageViews.length; i++) {
      const attachments = new BigUint64Array([
        BigInt(this.#swapchainImageViews[i] as number),
      ]);

      const createInfo = instantiate(VkFramebufferCreateInfo);
      createInfo.sType = Vk_StructureType.FRAMEBUFFER_CREATE_INFO;
      createInfo.renderPass = BigInt(this.#vkRenderPass as number);
      createInfo.attachmentCount = 1;
      createInfo.pAttachments = BigInt(ptr(attachments));
      createInfo.width = width;
      createInfo.height = height;
      createInfo.layers = 1;

      const result = VK.vkCreateFramebuffer(
        this.#vkLogicalDevice,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(this.#ptr_aux),
      );

      if (result !== Vk_Result.SUCCESS) {
        // Clean up already created framebuffers
        for (const fb of this.#swapchainFramebuffers) {
          VK.vkDestroyFramebuffer(this.#vkLogicalDevice, fb, null);
        }
        this.#swapchainFramebuffers = [];
        throw new DynamicLibError(
          `Failed to create framebuffer ${i}. VkResult: ${result}`,
          'Vulkan',
        );
      }

      const framebuffer = Number(this.#ptr_aux[0]) as Pointer;
      this.#swapchainFramebuffers.push(framebuffer);
      VK_DEBUG(`Framebuffer ${i} created: 0x${framebuffer.toString(16)}`);
    }

    VK_DEBUG(`All ${this.#swapchainFramebuffers.length} framebuffers created`);
  }

  #destroyFramebuffers(): void {
    if (this.#swapchainFramebuffers.length === 0) {
      return;
    }

    VK_DEBUG(`Destroying ${this.#swapchainFramebuffers.length} framebuffers`);

    for (const framebuffer of this.#swapchainFramebuffers) {
      VK.vkDestroyFramebuffer(this.#vkLogicalDevice, framebuffer, null);
    }

    this.#swapchainFramebuffers = [];
    VK_DEBUG('Framebuffers destroyed');
  }

  #allocateCommandBuffers(): void {
    const bufferCount = this.#swapchainImageCount;
    VK_DEBUG(`Allocating ${bufferCount} command buffers`);

    this.#commandBuffers = [];
    for (let i = 0; i < bufferCount; i++) {
      const commandBuffer = new CommandBuffer(
        this.#vkLogicalDevice,
        this.#commandPool,
      );
      this.#commandBuffers.push(commandBuffer);
    }

    VK_DEBUG(
      `Command buffers allocated: ${this.#commandBuffers.map((cb) => `0x${cb.buffer.toString(16)}`).join(', ')}`,
    );
  }

  #freeCommandBuffers(): void {
    if (this.#commandBuffers.length === 0) {
      return;
    }

    VK_DEBUG(`Freeing ${this.#commandBuffers.length} command buffers`);

    for (const commandBuffer of this.#commandBuffers) {
      commandBuffer.dispose();
    }

    this.#commandBuffers = [];
    VK_DEBUG('Command buffers freed');
  }

  #createSyncObjects(): void {
    VK_DEBUG(
      `Creating synchronization objects for ${Swapchain.#MAX_FRAMES_IN_FLIGHT} frames`,
    );

    const semaphoreInfo = instantiate(VkSemaphoreCreateInfo);
    semaphoreInfo.sType = Vk_StructureType.SEMAPHORE_CREATE_INFO;

    const fenceInfo = instantiate(VkFenceCreateInfo);
    fenceInfo.sType = Vk_StructureType.FENCE_CREATE_INFO;
    fenceInfo.flags = Vk_FenceCreateFlagBits.SIGNALED_BIT; // Start signaled

    for (let i = 0; i < Swapchain.#MAX_FRAMES_IN_FLIGHT; i++) {
      // Create image available semaphore
      let result = VK.vkCreateSemaphore(
        this.#vkLogicalDevice,
        ptr(getInstanceBuffer(semaphoreInfo)),
        null,
        ptr(this.#ptr_aux),
      );

      if (result !== Vk_Result.SUCCESS) {
        this.#destroySyncObjects(); // Clean up any created so far
        throw new DynamicLibError(
          `Failed to create imageAvailable semaphore ${i}. VkResult: ${result}`,
          'Vulkan',
        );
      }

      const imageAvailable = Number(this.#ptr_aux[0]) as Pointer;
      this.#imageAvailableSemaphores.push(imageAvailable);
      VK_DEBUG(
        `Image available semaphore ${i} created: 0x${imageAvailable.toString(16)}`,
      );

      // Create render finished semaphore
      result = VK.vkCreateSemaphore(
        this.#vkLogicalDevice,
        ptr(getInstanceBuffer(semaphoreInfo)),
        null,
        ptr(this.#ptr_aux),
      );

      if (result !== Vk_Result.SUCCESS) {
        this.#destroySyncObjects();
        throw new DynamicLibError(
          `Failed to create renderFinished semaphore ${i}. VkResult: ${result}`,
          'Vulkan',
        );
      }

      const renderFinished = Number(this.#ptr_aux[0]) as Pointer;
      this.#renderFinishedSemaphores.push(renderFinished);
      VK_DEBUG(
        `Render finished semaphore ${i} created: 0x${renderFinished.toString(16)}`,
      );

      // Create fence
      result = VK.vkCreateFence(
        this.#vkLogicalDevice,
        ptr(getInstanceBuffer(fenceInfo)),
        null,
        ptr(this.#ptr_aux),
      );

      if (result !== Vk_Result.SUCCESS) {
        this.#destroySyncObjects();
        throw new DynamicLibError(
          `Failed to create fence ${i}. VkResult: ${result}`,
          'Vulkan',
        );
      }

      const fence = Number(this.#ptr_aux[0]) as Pointer;
      this.#inFlightFences.push(fence);
      VK_DEBUG(`Fence ${i} created: 0x${fence.toString(16)}`);
    }

    VK_DEBUG('All synchronization objects created');
  }

  #destroySyncObjects(): void {
    VK_DEBUG('Destroying synchronization objects');

    for (const semaphore of this.#imageAvailableSemaphores) {
      VK.vkDestroySemaphore(this.#vkLogicalDevice, semaphore, null);
    }
    this.#imageAvailableSemaphores = [];

    for (const semaphore of this.#renderFinishedSemaphores) {
      VK.vkDestroySemaphore(this.#vkLogicalDevice, semaphore, null);
    }
    this.#renderFinishedSemaphores = [];

    for (const fence of this.#inFlightFences) {
      VK.vkDestroyFence(this.#vkLogicalDevice, fence, null);
    }
    this.#inFlightFences = [];

    VK_DEBUG('Synchronization objects destroyed');
  }
}
