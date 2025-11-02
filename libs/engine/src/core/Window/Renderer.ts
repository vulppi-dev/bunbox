import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  cstr,
  GLFW,
  GLFW_GeneralMacro,
  VK,
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_CommandBufferLevel,
  Vk_CommandPoolCreateFlagBits,
  Vk_ComponentSwizzle,
  Vk_CompositeAlphaFlagBitsKHR,
  Vk_FenceCreateFlagBits,
  Vk_ImageAspectFlagBits,
  Vk_ImageLayout,
  Vk_ImageUsageFlagBits,
  Vk_ImageViewType,
  Vk_Result,
  Vk_SampleCountFlagBits,
  Vk_SharingMode,
  Vk_StructureType,
  vkGetSurfaceCapabilities,
  vkGetSurfaceFormats,
  vkSelectPresentMode,
  VkAttachmentDescription,
  VkAttachmentReference,
  VkCommandBufferAllocateInfo,
  VkCommandPoolCreateInfo,
  VkDeviceCreateInfo,
  VkDeviceQueueCreateInfo,
  VkFenceCreateInfo,
  VkFramebufferCreateInfo,
  VkImageViewCreateInfo,
  VkRenderPassCreateInfo,
  VkSemaphoreCreateInfo,
  VkSubpassDescription,
  VkSwapchainCreateInfoKHR,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { Vector2 } from '../../math';
import type { Node3D } from '../../nodes';
import { VK_DEBUG } from '../../singleton/logger';
import { getInstanceBuffer, instantiate, instanceToJSON } from '@bunbox/struct';

export class Renderer implements Disposable {
  static getNativeWindowHandler(window: Pointer): Pointer | null {
    switch (process.platform) {
      case 'win32':
        return GLFW.glfwGetWin32Window(window);
      case 'linux':
        const p = GLFW.glfwGetPlatform();

        return GLFW_GeneralMacro.PLATFORM_WAYLAND === p
          ? GLFW.glfwGetWaylandWindow(window)
          : GLFW.glfwGetX11Window(window);
      case 'darwin':
        return GLFW.glfwGetCocoaWindow(window);
      default:
        throw new DynamicLibError(
          `Unsupported platform: ${process.platform}`,
          'GLFW',
        );
    }
  }

  #windowPtr: Pointer;
  #vkInstance: Pointer;
  #vkPhysicalDevice: Pointer;
  #vkLogicalDevice: Pointer | null = null;
  #vkSurface: Pointer;

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

  // Render pass
  #renderPass: Pointer | null = null;

  // Command buffers
  #commandPool: Pointer | null = null;
  #commandBuffers: Pointer[] = [];

  // Synchronization objects (for MAX_FRAMES_IN_FLIGHT frames)
  #imageAvailableSemaphores: Pointer[] = [];
  #renderFinishedSemaphores: Pointer[] = [];
  #inFlightFences: Pointer[] = [];
  #currentFrame: number = 0;

  static readonly #MAX_FRAMES_IN_FLIGHT = 2;

  // Cached window framebuffer size
  #width: Int32Array;
  #height: Int32Array;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(window: Pointer, vkInstance: Pointer, vkPhysicalDevice: Pointer) {
    // Prepare auxiliary buffers
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);

    this.#ptr_aux = new BigUint64Array(1);

    // Initialize window
    this.#windowPtr = window;
    this.#vkInstance = vkInstance;
    this.#vkPhysicalDevice = vkPhysicalDevice;

    // Create Vulkan surface using GLFW
    const result = GLFW.glfwCreateWindowSurface(
      this.#vkInstance,
      this.#windowPtr,
      null, // allocator (null uses default)
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create Vulkan surface. VkResult: ${result}`,
        'GLFW',
      );
    }

    const surfaceHandle = Number(this.#ptr_aux[0]) as Pointer;
    if (!surfaceHandle) {
      throw new DynamicLibError(
        'Failed to retrieve Vulkan surface handle',
        'GLFW',
      );
    }
    VK_DEBUG(`Vulkan surface created: 0x${surfaceHandle.toString(16)}`);
    this.#vkSurface = surfaceHandle;

    this.#createLogicalDevice();
    this.#querySurfaceCapabilities();
    this.#querySurfaceFormats();
    this.#selectPresentMode();
    this.#createRenderPass();
    this.#createCommandPool();
    this.#createSyncObjects();

    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Renderer resources');

    // Wait for device to finish before cleanup
    if (this.#vkLogicalDevice) {
      VK.vkDeviceWaitIdle(this.#vkLogicalDevice);
    }

    // Destroy synchronization objects
    this.#destroySyncObjects();

    // Destroy command buffers and pool
    this.#freeCommandBuffers();
    this.#destroyCommandPool();

    // Destroy swapchain and related resources
    this.#destroySwapchain();

    // Destroy render pass
    this.#destroyRenderPass();

    // Destroy logical device
    if (this.#vkLogicalDevice) {
      VK_DEBUG(
        `Destroying logical device: 0x${this.#vkLogicalDevice.toString(16)}`,
      );
      VK.vkDestroyDevice(this.#vkLogicalDevice, null);
      this.#vkLogicalDevice = null;
    }

    // Destroy surface
    if (this.#vkSurface) {
      VK_DEBUG(`Destroying surface: 0x${this.#vkSurface.toString(16)}`);
      VK.vkDestroySurfaceKHR(this.#vkInstance, this.#vkSurface, null);
    }

    VK_DEBUG('Renderer resources disposed');
  }

  rebuildFrame(): void {
    this.#loadFramebufferSize();

    const width = this.#width[0]!;
    const height = this.#height[0]!;

    VK_DEBUG(`=== Rebuilding Frame: ${width}x${height} ===`);

    // Don't create swapchain if window is minimized (0x0)
    if (width === 0 || height === 0) {
      VK_DEBUG('Window minimized (0x0), skipping swapchain creation');
      return;
    }

    // Store previous image count to detect changes
    const previousImageCount = this.#swapchainImageCount;

    // If we already have a swapchain and its current extent matches the
    // requested size, skip recreation. Otherwise recreate using the
    // old swapchain as `oldSwapchain` to allow driver to transition gracefully.
    const currentExtent = this.#surfaceCapabilities?.currentExtent;
    const needsRecreate =
      !this.#swapchain ||
      !currentExtent ||
      currentExtent.width !== width ||
      currentExtent.height !== height;

    if (needsRecreate) {
      const old = this.#swapchain ?? undefined;
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

    VK_DEBUG('=== Frame Rebuild Complete ===');
  }

  render(_nodes: Node3D[]): void {}

  #loadFramebufferSize() {
    if (!this.#windowPtr) {
      return new Vector2();
    }
    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#width),
      ptr(this.#height),
    );
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

  #destroySwapchain(): void {
    if (!this.#swapchain) return;
    if (!this.#vkLogicalDevice) {
      VK_DEBUG('Cannot destroy swapchain: no logical device');
      return;
    }

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

  #createSwapchain(
    width: number,
    height: number,
    oldSwapchain?: Pointer,
  ): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    if (!this.#surfaceCapabilities || !this.#selectedPresentMode) {
      throw new DynamicLibError(
        'Surface capabilities or present mode not queried',
        'Vulkan',
      );
    }

    VK_DEBUG(`Creating swapchain for ${width}x${height}`);

    // Re-query surface capabilities to ensure they're up to date
    this.#querySurfaceCapabilities();

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

    // Select the first available format (TODO: implement better selection)
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
    createInfo.clipped = true; // VK_TRUE
    createInfo.oldSwapchain = oldSwapchain ? BigInt(oldSwapchain) : 0n;

    VK_DEBUG(`Swapchain config: ${JSON.stringify(instanceToJSON(createInfo))}`);

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
      // Destroy newly created swapchain to avoid leak
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
      // Destroy newly created swapchain to avoid leak
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

    // If there was a previous swapchain, destroy it now that the new one is ready
    if (oldSwapchain) {
      VK_DEBUG(`Destroying old swapchain: 0x${oldSwapchain.toString(16)}`);
      // wait for device idle to be safe
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

  #createLogicalDevice(): void {
    VK_DEBUG('Creating logical device');

    // Create a simple device queue create info
    const queueCreateInfo = instantiate(VkDeviceQueueCreateInfo);
    queueCreateInfo.sType = Vk_StructureType.DEVICE_QUEUE_CREATE_INFO;
    queueCreateInfo.queueFamilyIndex = 0; // Using first queue family
    queueCreateInfo.queueCount = 1;
    queueCreateInfo.pQueuePriorities = BigInt(ptr(new Float32Array([1.0])));

    // Get required extensions (VK_KHR_swapchain)
    const extensionNames = ['VK_KHR_swapchain'];
    const extensionPointers = extensionNames.map((name) =>
      BigInt(ptr(cstr(name))),
    );
    const extensionPointersBuffer = new BigUint64Array(extensionPointers);

    // Create device create info
    const deviceCreateInfo = instantiate(VkDeviceCreateInfo);
    deviceCreateInfo.sType = Vk_StructureType.DEVICE_CREATE_INFO;
    deviceCreateInfo.queueCreateInfoCount = 1;
    deviceCreateInfo.pQueueCreateInfos = BigInt(
      ptr(getInstanceBuffer(queueCreateInfo)),
    );
    deviceCreateInfo.enabledExtensionCount = extensionNames.length;
    deviceCreateInfo.ppEnabledExtensionNames = BigInt(
      ptr(extensionPointersBuffer),
    );
    deviceCreateInfo.pEnabledFeatures = 0n;

    VK_DEBUG(
      `Device config: ${JSON.stringify(instanceToJSON(deviceCreateInfo))}`,
    );

    // Create logical device
    const result = VK.vkCreateDevice(
      this.#vkPhysicalDevice,
      ptr(getInstanceBuffer(deviceCreateInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create logical device. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkLogicalDevice = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Logical device created: 0x${this.#vkLogicalDevice.toString(16)}`);
  }

  #createImageViews(): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

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
    if (!this.#vkLogicalDevice || this.#swapchainImageViews.length === 0) {
      return;
    }

    VK_DEBUG(`Destroying ${this.#swapchainImageViews.length} image views`);

    for (const imageView of this.#swapchainImageViews) {
      VK.vkDestroyImageView(this.#vkLogicalDevice, imageView, null);
    }

    this.#swapchainImageViews = [];
    VK_DEBUG('Image views destroyed');
  }

  #createRenderPass(): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    VK_DEBUG('Creating render pass');

    const format = this.#surfaceFormats[0]?.format;
    if (format === undefined) {
      throw new DynamicLibError('No surface format available', 'Vulkan');
    }

    // Color attachment description
    const colorAttachment = instantiate(VkAttachmentDescription);
    colorAttachment.flags = 0;
    colorAttachment.format = format;
    colorAttachment.samples = Vk_SampleCountFlagBits.COUNT_1_BIT;
    colorAttachment.loadOp = Vk_AttachmentLoadOp.CLEAR;
    colorAttachment.storeOp = Vk_AttachmentStoreOp.STORE;
    colorAttachment.stencilLoadOp = Vk_AttachmentLoadOp.DONT_CARE;
    colorAttachment.stencilStoreOp = Vk_AttachmentStoreOp.DONT_CARE;
    colorAttachment.initialLayout = Vk_ImageLayout.UNDEFINED;
    colorAttachment.finalLayout = Vk_ImageLayout.PRESENT_SRC_KHR;

    // Color attachment reference
    const colorAttachmentRef = instantiate(VkAttachmentReference);
    colorAttachmentRef.attachment = 0;
    colorAttachmentRef.layout = Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL;

    // Subpass description
    const subpass = instantiate(VkSubpassDescription);
    subpass.flags = 0;
    subpass.pipelineBindPoint = 0; // VK_PIPELINE_BIND_POINT_GRAPHICS
    subpass.inputAttachmentCount = 0;
    subpass.pInputAttachments = 0n;
    subpass.colorAttachmentCount = 1;
    subpass.pColorAttachments = BigInt(
      ptr(getInstanceBuffer(colorAttachmentRef)),
    );
    subpass.pResolveAttachments = 0n;
    subpass.pDepthStencilAttachment = 0n;
    subpass.preserveAttachmentCount = 0;
    subpass.pPreserveAttachments = 0n;

    // Render pass create info
    const createInfo = instantiate(VkRenderPassCreateInfo);
    createInfo.sType = Vk_StructureType.RENDER_PASS_CREATE_INFO;
    createInfo.attachmentCount = 1;
    createInfo.pAttachments = BigInt(ptr(getInstanceBuffer(colorAttachment)));
    createInfo.subpassCount = 1;
    createInfo.pSubpasses = BigInt(ptr(getInstanceBuffer(subpass)));
    createInfo.dependencyCount = 0;
    createInfo.pDependencies = 0n;

    const result = VK.vkCreateRenderPass(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create render pass. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#renderPass = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Render pass created: 0x${this.#renderPass.toString(16)}`);
  }

  #destroyRenderPass(): void {
    if (!this.#vkLogicalDevice || !this.#renderPass) {
      return;
    }

    VK_DEBUG(`Destroying render pass: 0x${this.#renderPass.toString(16)}`);
    VK.vkDestroyRenderPass(this.#vkLogicalDevice, this.#renderPass, null);
    this.#renderPass = null;
    VK_DEBUG('Render pass destroyed');
  }

  #createFramebuffers(width: number, height: number): void {
    if (!this.#vkLogicalDevice || !this.#renderPass) {
      throw new DynamicLibError(
        'Logical device or render pass not created',
        'Vulkan',
      );
    }

    VK_DEBUG(`Creating ${this.#swapchainImageViews.length} framebuffers`);

    this.#swapchainFramebuffers = [];

    for (let i = 0; i < this.#swapchainImageViews.length; i++) {
      const attachments = new BigUint64Array([
        BigInt(this.#swapchainImageViews[i] as number),
      ]);

      const createInfo = instantiate(VkFramebufferCreateInfo);
      createInfo.sType = Vk_StructureType.FRAMEBUFFER_CREATE_INFO;
      createInfo.renderPass = BigInt(this.#renderPass as number);
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
    if (!this.#vkLogicalDevice || this.#swapchainFramebuffers.length === 0) {
      return;
    }

    VK_DEBUG(`Destroying ${this.#swapchainFramebuffers.length} framebuffers`);

    for (const framebuffer of this.#swapchainFramebuffers) {
      VK.vkDestroyFramebuffer(this.#vkLogicalDevice, framebuffer, null);
    }

    this.#swapchainFramebuffers = [];
    VK_DEBUG('Framebuffers destroyed');
  }

  #createCommandPool(): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    VK_DEBUG('Creating command pool');

    const createInfo = instantiate(VkCommandPoolCreateInfo);
    createInfo.sType = Vk_StructureType.COMMAND_POOL_CREATE_INFO;
    createInfo.flags = Vk_CommandPoolCreateFlagBits.RESET_COMMAND_BUFFER_BIT;
    createInfo.queueFamilyIndex = 0; // Using first queue family

    const result = VK.vkCreateCommandPool(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create command pool. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#commandPool = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Command pool created: 0x${this.#commandPool.toString(16)}`);
  }

  #destroyCommandPool(): void {
    if (!this.#vkLogicalDevice || !this.#commandPool) {
      return;
    }

    VK_DEBUG(`Destroying command pool: 0x${this.#commandPool.toString(16)}`);
    VK.vkDestroyCommandPool(this.#vkLogicalDevice, this.#commandPool, null);
    this.#commandPool = null;
    VK_DEBUG('Command pool destroyed');
  }

  #allocateCommandBuffers(): void {
    if (!this.#vkLogicalDevice || !this.#commandPool) {
      throw new DynamicLibError(
        'Logical device or command pool not created',
        'Vulkan',
      );
    }

    const bufferCount = this.#swapchainImageCount;
    VK_DEBUG(`Allocating ${bufferCount} command buffers`);

    const allocInfo = instantiate(VkCommandBufferAllocateInfo);
    allocInfo.sType = Vk_StructureType.COMMAND_BUFFER_ALLOCATE_INFO;
    allocInfo.commandPool = BigInt(this.#commandPool as number);
    allocInfo.level = Vk_CommandBufferLevel.PRIMARY;
    allocInfo.commandBufferCount = bufferCount;

    const commandBuffers = new BigUint64Array(bufferCount);

    const result = VK.vkAllocateCommandBuffers(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(allocInfo)),
      ptr(commandBuffers),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to allocate command buffers. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#commandBuffers = Array.from(commandBuffers).map(
      (cb) => Number(cb) as Pointer,
    );
    VK_DEBUG(
      `Command buffers allocated: ${this.#commandBuffers.map((cb) => `0x${cb.toString(16)}`).join(', ')}`,
    );
  }

  #freeCommandBuffers(): void {
    if (
      !this.#vkLogicalDevice ||
      !this.#commandPool ||
      this.#commandBuffers.length === 0
    ) {
      return;
    }

    VK_DEBUG(`Freeing ${this.#commandBuffers.length} command buffers`);

    const buffers = new BigUint64Array(
      this.#commandBuffers.map((cb) => BigInt(cb as number)),
    );

    VK.vkFreeCommandBuffers(
      this.#vkLogicalDevice,
      this.#commandPool,
      this.#commandBuffers.length,
      ptr(buffers),
    );

    this.#commandBuffers = [];
    VK_DEBUG('Command buffers freed');
  }

  #createSyncObjects(): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    VK_DEBUG(
      `Creating synchronization objects for ${Renderer.#MAX_FRAMES_IN_FLIGHT} frames`,
    );

    const semaphoreInfo = instantiate(VkSemaphoreCreateInfo);
    semaphoreInfo.sType = Vk_StructureType.SEMAPHORE_CREATE_INFO;

    const fenceInfo = instantiate(VkFenceCreateInfo);
    fenceInfo.sType = Vk_StructureType.FENCE_CREATE_INFO;
    fenceInfo.flags = Vk_FenceCreateFlagBits.SIGNALED_BIT; // Start signaled

    for (let i = 0; i < Renderer.#MAX_FRAMES_IN_FLIGHT; i++) {
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
    if (!this.#vkLogicalDevice) {
      return;
    }

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
