import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  GLFW,
  GLFW_GeneralMacro,
  VK,
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_CommandPoolCreateFlagBits,
  Vk_ImageLayout,
  Vk_Result,
  Vk_SampleCountFlagBits,
  Vk_StructureType,
  vkGetSurfaceFormats,
  VkAttachmentDescription,
  VkAttachmentReference,
  VkCommandPoolCreateInfo,
  VkRenderPassCreateInfo,
  VkSubpassDescription,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { Vector2 } from '../../math';
import type { Node3D } from '../../nodes';
import { VK_DEBUG } from '../../singleton/logger';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { Swapchain } from './Swapchain';
import { LogicalDevice } from './LogicalDevice';

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
  #vkSurface: Pointer;

  // Logical device
  #logicalDevice: LogicalDevice | null = null;

  // Render pass
  #renderPass: Pointer | null = null;

  // Command pool
  #commandPool: Pointer | null = null;

  // Swapchain
  #swapchain: Swapchain | null = null;

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

    // Create logical device with required extensions
    this.#logicalDevice = new LogicalDevice(this.#vkPhysicalDevice, [
      'VK_KHR_swapchain',
    ]);

    this.#createRenderPass();
    this.#createCommandPool();

    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Renderer resources');

    // Destroy swapchain
    this.#swapchain?.dispose();
    this.#swapchain = null;

    // Destroy command pool
    this.#destroyCommandPool();

    // Destroy render pass
    this.#destroyRenderPass();

    // Destroy logical device
    this.#logicalDevice?.dispose();
    this.#logicalDevice = null;

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

    if (!this.#logicalDevice || !this.#renderPass || !this.#commandPool) {
      VK_DEBUG('Required Vulkan resources not created yet');
      return;
    }

    // Create or rebuild swapchain
    if (this.#swapchain) {
      this.#swapchain.rebuild(width, height);
    } else {
      this.#swapchain = new Swapchain(
        this.#vkPhysicalDevice,
        this.#logicalDevice.device,
        this.#vkSurface,
        this.#renderPass,
        this.#commandPool,
        width,
        height,
      );
    }

    VK_DEBUG('=== Frame Rebuild Complete ===');
  }

  render(_nodes: Node3D[]): void {
    if (!this.#logicalDevice || !this.#swapchain) {
      return;
    }

    const frame = this.#swapchain.next();
    if (!frame) {
      if (this.#width[0] === 0 || this.#height[0] === 0) {
        VK_DEBUG('Window minimized (0x0), skipping render');
        return;
      }
      this.#swapchain.rebuild(this.#width[0]!, this.#height[0]!);
      return;
    }

    // TODO: Record command buffer with actual rendering commands
    // For now, just present the frame

    this.#swapchain.present(
      frame.imageIndex,
      this.#logicalDevice.graphicsQueue,
    );
  }

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

  #createRenderPass(): void {
    if (!this.#logicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    VK_DEBUG('Creating render pass');

    // Query surface formats to get the format
    const surfaceFormats = vkGetSurfaceFormats(
      this.#vkPhysicalDevice,
      this.#vkSurface,
    );
    const format = surfaceFormats[0]?.format;
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
      this.#logicalDevice.device,
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
    if (!this.#logicalDevice || !this.#renderPass) {
      return;
    }

    VK_DEBUG(`Destroying render pass: 0x${this.#renderPass.toString(16)}`);
    VK.vkDestroyRenderPass(this.#logicalDevice.device, this.#renderPass, null);
    this.#renderPass = null;
    VK_DEBUG('Render pass destroyed');
  }

  #createCommandPool(): void {
    if (!this.#logicalDevice) {
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }

    VK_DEBUG('Creating command pool');

    const createInfo = instantiate(VkCommandPoolCreateInfo);
    createInfo.sType = Vk_StructureType.COMMAND_POOL_CREATE_INFO;
    createInfo.flags = Vk_CommandPoolCreateFlagBits.RESET_COMMAND_BUFFER_BIT;
    createInfo.queueFamilyIndex = 0; // Using first queue family

    const result = VK.vkCreateCommandPool(
      this.#logicalDevice.device,
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
    if (!this.#logicalDevice || !this.#commandPool) {
      return;
    }

    VK_DEBUG(`Destroying command pool: 0x${this.#commandPool.toString(16)}`);
    VK.vkDestroyCommandPool(
      this.#logicalDevice.device,
      this.#commandPool,
      null,
    );
    this.#commandPool = null;
    VK_DEBUG('Command pool destroyed');
  }
}
