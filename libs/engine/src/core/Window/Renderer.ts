import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  GLFW,
  GLFW_GeneralMacro,
  VK,
  Vk_Result,
  vkGetSurfaceFormats,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { type Color, Vector2 } from '../../math';
import type { Node3D } from '../../nodes';
import { VK_DEBUG } from '../../singleton/logger';
import {
  DISPOSE_FUNC_SYM,
  PREPARE_FUNC_SYM,
  REBUILD_FUNC_SYM,
  RELEASE_FUNC_SYM,
} from '../symbols/Resources';
import type { CommandBuffer } from './CommandBuffer';
import { CommandPool } from './CommandPool';
import { LogicalDevice } from './LogicalDevice';
import type { AbstractRenderPass } from './RenderPass/AbstractRenderPass';
import { ClearScreenRenderPass } from './RenderPass/ClearScreenRenderPass';
import { Swapchain } from './Swapchain';

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

  // Render passes
  #clearScreenPass: ClearScreenRenderPass;
  #additionalPasses: AbstractRenderPass[] = [];
  #currentSurfaceFormat: number | null = null;

  // Command pool
  #commandPool: CommandPool | null = null;

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

    // Create clear screen render pass (always present)
    this.#clearScreenPass = new ClearScreenRenderPass();

    // Prepare render pass with logical device and surface format
    this.#currentSurfaceFormat = this.#querySurfaceFormat();
    this.#clearScreenPass[PREPARE_FUNC_SYM](
      this.#logicalDevice.device,
      this.#currentSurfaceFormat,
    );

    // Create command pool
    this.#commandPool = new CommandPool(this.#logicalDevice.device);

    this.rebuildFrame();
  }

  get logicalDevice(): Pointer {
    if (!this.#logicalDevice) {
      throw new DynamicLibError('Logical device not initialized', 'Vulkan');
    }
    return this.#logicalDevice.device;
  }

  get allRenderPasses(): readonly AbstractRenderPass[] {
    return Object.freeze([this.#clearScreenPass, ...this.#additionalPasses]);
  }

  get clearColor(): Color {
    return this.#clearScreenPass.clearColor;
  }

  set clearColor(color: Color) {
    this.#clearScreenPass.clearColor = color;
  }

  addRenderPass(renderPass: AbstractRenderPass): void {
    if (!this.#currentSurfaceFormat) {
      throw new DynamicLibError('Renderer not initialized', 'Vulkan');
    }

    VK_DEBUG('Adding render pass to renderer');

    if (!renderPass.isPrepared) {
      renderPass[PREPARE_FUNC_SYM](
        this.logicalDevice,
        this.#currentSurfaceFormat,
      );
    }

    this.#additionalPasses.push(renderPass);
  }

  removeRenderPass(renderPass: AbstractRenderPass): boolean {
    const index = this.#additionalPasses.indexOf(renderPass);
    if (index === -1) {
      VK_DEBUG('RenderPass not found in renderer');
      return false;
    }

    VK_DEBUG('Removing render pass from renderer');
    this.#additionalPasses.splice(index, 1);
    renderPass[RELEASE_FUNC_SYM]();

    return true;
  }

  clearAdditionalPasses(): void {
    VK_DEBUG(
      `Clearing ${this.#additionalPasses.length} additional render passes`,
    );

    for (const pass of this.#additionalPasses) {
      pass[RELEASE_FUNC_SYM]();
    }

    this.#additionalPasses = [];
  }

  replaceRenderPass(
    oldPass: AbstractRenderPass,
    newPass: AbstractRenderPass,
  ): boolean {
    const index = this.#additionalPasses.indexOf(oldPass);
    if (index === -1) {
      VK_DEBUG('Old render pass not found');
      return false;
    }

    VK_DEBUG('Replacing render pass');

    if (!newPass.isPrepared && this.#currentSurfaceFormat) {
      newPass[PREPARE_FUNC_SYM](this.logicalDevice, this.#currentSurfaceFormat);
    }

    this.#additionalPasses[index] = newPass;
    oldPass[RELEASE_FUNC_SYM]();

    return true;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Renderer resources');

    // Dispose swapchain
    this.#swapchain?.dispose();
    this.#swapchain = null;

    // Dispose command pool
    this.#commandPool?.dispose();
    this.#commandPool = null;

    // Dispose all render passes
    this.#clearScreenPass[DISPOSE_FUNC_SYM]();
    for (const pass of this.#additionalPasses) {
      pass[DISPOSE_FUNC_SYM]();
    }
    this.#additionalPasses = [];

    // Dispose logical device
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

    if (!this.#logicalDevice || !this.#commandPool) {
      VK_DEBUG('Required Vulkan resources not created yet');
      return;
    }

    // Check if surface format changed
    const newFormat = this.#querySurfaceFormat();
    const formatChanged = newFormat !== this.#currentSurfaceFormat;
    this.#currentSurfaceFormat = newFormat;

    // Rebuild all render passes if format changed
    if (formatChanged) {
      VK_DEBUG('Surface format changed, rebuilding render passes');
      this.#clearScreenPass[REBUILD_FUNC_SYM](newFormat);

      for (const pass of this.#additionalPasses) {
        pass[REBUILD_FUNC_SYM](newFormat);
      }
    }

    // Create or rebuild swapchain
    if (this.#swapchain) {
      this.#swapchain.rebuild(width, height);
    } else {
      this.#swapchain = new Swapchain(
        this.#vkPhysicalDevice,
        this.#logicalDevice.device,
        this.#vkSurface,
        this.#clearScreenPass.renderPass,
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

    // Record command buffer
    this.#recordCommandBuffer(frame.commandBuffer, frame.framebuffer);

    // Submit and present
    this.#swapchain.present(
      frame.imageIndex,
      this.#logicalDevice.graphicsQueue,
    );
  }

  #recordCommandBuffer(
    commandBuffer: CommandBuffer,
    framebuffer: Pointer,
  ): void {
    // Begin command buffer recording
    commandBuffer.begin();

    // Begin render pass with clear color
    commandBuffer.beginRenderPass(
      this.#clearScreenPass.renderPass,
      framebuffer,
      this.#width[0]!,
      this.#height[0]!,
      this.#clearScreenPass.clearColor,
    );

    // TODO: Record actual rendering commands here

    // End render pass
    commandBuffer.endRenderPass();

    // End command buffer recording
    commandBuffer.end();
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

  #querySurfaceFormat(): number {
    const surfaceFormats = vkGetSurfaceFormats(
      this.#vkPhysicalDevice,
      this.#vkSurface,
    );
    const format = surfaceFormats[0]?.format;
    if (format === undefined) {
      throw new DynamicLibError('No surface format available', 'Vulkan');
    }
    return format;
  }
}
