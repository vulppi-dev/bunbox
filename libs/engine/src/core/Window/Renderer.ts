import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  GLFW,
  GLFW_GeneralMacro,
  VK,
  Vk_ImageLayout,
  Vk_PipelineStageFlagBits,
  Vk_Result,
  vkGetSurfaceFormats,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { Vector2, type Color } from '../../math';
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
import { VkRenderPass } from './VkRenderPass';
import type { RenderPass } from '../../elements/RenderPass';
import { ClearScreenRenderPass } from '../../elements/ClearScreenRenderPass';
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

  // Render passes - Public API (elements)
  #publicClearScreenPass: ClearScreenRenderPass;
  #publicAdditionalPasses: RenderPass[] = [];

  // Render passes - Vulkan implementation (internal)
  #vkClearScreenPass: VkRenderPass;
  #vkAdditionalPasses: VkRenderPass[] = [];

  // Cache: RenderPass (public API) → VkRenderPass (Vulkan)
  #renderPassCache: Map<RenderPass, VkRenderPass> = new Map();

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

    // Create clear screen render pass (PUBLIC API)
    this.#publicClearScreenPass = new ClearScreenRenderPass();

    // Create Vulkan implementation of clear screen render pass (GENERIC)
    this.#vkClearScreenPass = new VkRenderPass();
    this.#vkClearScreenPass.setSourceRenderPass(this.#publicClearScreenPass);

    // Cache the conversion
    this.#renderPassCache.set(
      this.#publicClearScreenPass,
      this.#vkClearScreenPass,
    );

    // Prepare render pass with logical device and surface format
    this.#currentSurfaceFormat = this.#querySurfaceFormat();
    this.#vkClearScreenPass[PREPARE_FUNC_SYM](
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

  get allRenderPasses(): readonly VkRenderPass[] {
    return Object.freeze([
      this.#vkClearScreenPass,
      ...this.#vkAdditionalPasses,
    ]);
  }

  get clearColor(): Color {
    return this.#publicClearScreenPass.clearColor;
  }

  set clearColor(color: Color) {
    this.#publicClearScreenPass.clearColor = color;
  }

  /**
   * Add a public RenderPass (elements API)
   * Renderer will convert it to VkRenderPass internally
   */
  addRenderPass(renderPass: RenderPass): void {
    if (!this.#currentSurfaceFormat) {
      throw new DynamicLibError('Renderer not initialized', 'Vulkan');
    }

    VK_DEBUG('Adding render pass to renderer');

    // Check if already cached
    let vkRenderPass = this.#renderPassCache.get(renderPass);

    if (!vkRenderPass) {
      // Create Vulkan implementation based on the public RenderPass type
      vkRenderPass = this.#createVkRenderPass(renderPass);
      vkRenderPass.setSourceRenderPass(renderPass);
      this.#renderPassCache.set(renderPass, vkRenderPass);
    }

    if (!vkRenderPass.isPrepared) {
      vkRenderPass[PREPARE_FUNC_SYM](
        this.logicalDevice,
        this.#currentSurfaceFormat,
      );
    }

    this.#publicAdditionalPasses.push(renderPass);
    this.#vkAdditionalPasses.push(vkRenderPass);

    // Sync render targets from public API to Vulkan
    if (renderPass.hasRenderTargets && renderPass.renderTargets) {
      vkRenderPass.updateRenderTargets([...renderPass.renderTargets]);
    }
  }

  /**
   * Remove a public RenderPass
   */
  removeRenderPass(renderPass: RenderPass): boolean {
    const index = this.#publicAdditionalPasses.indexOf(renderPass);
    if (index === -1) {
      VK_DEBUG('RenderPass not found in renderer');
      return false;
    }

    VK_DEBUG('Removing render pass from renderer');

    const vkRenderPass = this.#renderPassCache.get(renderPass);
    if (vkRenderPass) {
      vkRenderPass[RELEASE_FUNC_SYM]();
      this.#renderPassCache.delete(renderPass);
    }

    this.#publicAdditionalPasses.splice(index, 1);
    this.#vkAdditionalPasses.splice(index, 1);

    return true;
  }

  clearAdditionalPasses(): void {
    VK_DEBUG(
      `Clearing ${this.#publicAdditionalPasses.length} additional render passes`,
    );

    for (const vkPass of this.#vkAdditionalPasses) {
      vkPass[RELEASE_FUNC_SYM]();
    }

    this.#renderPassCache.clear();
    // Re-add clear screen pass to cache
    this.#renderPassCache.set(
      this.#publicClearScreenPass,
      this.#vkClearScreenPass,
    );

    this.#publicAdditionalPasses = [];
    this.#vkAdditionalPasses = [];
  }

  /**
   * Replace a public RenderPass with another
   */
  replaceRenderPass(oldPass: RenderPass, newPass: RenderPass): boolean {
    const index = this.#publicAdditionalPasses.indexOf(oldPass);
    if (index === -1) {
      VK_DEBUG('Old render pass not found');
      return false;
    }

    VK_DEBUG('Replacing render pass');

    // Get or create Vulkan implementation for new pass
    let vkNewPass = this.#renderPassCache.get(newPass);
    if (!vkNewPass) {
      vkNewPass = this.#createVkRenderPass(newPass);
      vkNewPass.setSourceRenderPass(newPass);
      this.#renderPassCache.set(newPass, vkNewPass);
    }

    if (!vkNewPass.isPrepared && this.#currentSurfaceFormat) {
      vkNewPass[PREPARE_FUNC_SYM](
        this.logicalDevice,
        this.#currentSurfaceFormat,
      );
    }

    // Release old pass
    const vkOldPass = this.#renderPassCache.get(oldPass);
    if (vkOldPass) {
      vkOldPass[RELEASE_FUNC_SYM]();
      this.#renderPassCache.delete(oldPass);
    }

    this.#publicAdditionalPasses[index] = newPass;
    this.#vkAdditionalPasses[index] = vkNewPass;

    return true;
  }

  /**
   * Create VkRenderPass from public RenderPass
   * VkRenderPass is a single generic class that works for all RenderPass types
   * @internal
   */
  #createVkRenderPass(_renderPass: RenderPass): VkRenderPass {
    // Create a generic VkRenderPass instance
    // It will read configuration from the source RenderPass
    return new VkRenderPass();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Renderer resources');

    // Dispose swapchain
    this.#swapchain?.dispose();
    this.#swapchain = null;

    // Dispose command pool
    this.#commandPool?.dispose();
    this.#commandPool = null;

    // Dispose all Vulkan render passes
    this.#vkClearScreenPass[DISPOSE_FUNC_SYM]();
    for (const vkPass of this.#vkAdditionalPasses) {
      vkPass[DISPOSE_FUNC_SYM]();
    }
    this.#vkAdditionalPasses = [];
    this.#publicAdditionalPasses = [];
    this.#renderPassCache.clear();

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

    // Rebuild all Vulkan render passes if format changed
    if (formatChanged) {
      VK_DEBUG('Surface format changed, rebuilding render passes');
      this.#vkClearScreenPass[REBUILD_FUNC_SYM](newFormat);

      for (const vkPass of this.#vkAdditionalPasses) {
        vkPass[REBUILD_FUNC_SYM](newFormat);
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
        this.#vkClearScreenPass.vkRenderPass,
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

    // Begin command buffer recording
    frame.commandBuffer.begin();

    // Render to custom targets first (if any additional passes have custom targets)
    for (let i = 0; i < this.#publicAdditionalPasses.length; i++) {
      const publicPass = this.#publicAdditionalPasses[i]!;
      const vkPass = this.#vkAdditionalPasses[i]!;

      if (publicPass.hasRenderTargets && vkPass.vkCustomFramebuffer) {
        this.#renderToCustomTarget(frame.commandBuffer, vkPass, publicPass);
      }
    }

    // Then render to swapchain (main screen)
    frame.commandBuffer.beginRenderPass(
      this.#vkClearScreenPass.vkRenderPass,
      frame.framebuffer,
      this.#width[0]!,
      this.#height[0]!,
      this.#publicClearScreenPass.clearColor,
    );

    // TODO: Record actual rendering commands here for main pass

    frame.commandBuffer.endRenderPass();

    // End command buffer recording
    frame.commandBuffer.end();

    // Submit and present
    this.#swapchain.present(
      frame.imageIndex,
      this.#logicalDevice.graphicsQueue,
    );
  }

  /**
   * Render a pass to its custom target (offscreen texture)
   */
  #renderToCustomTarget(
    commandBuffer: CommandBuffer,
    vkPass: VkRenderPass,
    publicPass: RenderPass,
  ): void {
    if (!vkPass.vkCustomFramebuffer) {
      return;
    }

    const fb = vkPass.vkCustomFramebuffer;

    VK_DEBUG(
      `Rendering to custom target: ${fb.width}x${fb.height}, ${fb.attachments.length} attachments`,
    );

    // Transition attachments to COLOR_ATTACHMENT_OPTIMAL layout
    for (const attachment of fb.attachments) {
      commandBuffer.transitionImageLayout(
        attachment,
        attachment.currentLayout,
        Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        Vk_PipelineStageFlagBits.TOP_OF_PIPE_BIT,
        Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
      );
    }

    // Begin render pass with custom framebuffer
    commandBuffer.beginRenderPass(
      vkPass.vkRenderPass,
      fb,
      fb.width,
      fb.height,
      publicPass.clearColor,
    );

    // TODO: Record rendering commands for this pass

    commandBuffer.endRenderPass();

    // Transition attachments to SHADER_READ_ONLY_OPTIMAL for sampling
    for (const attachment of fb.attachments) {
      commandBuffer.transitionImageLayout(
        attachment,
        attachment.currentLayout,
        Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL,
        Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
        Vk_PipelineStageFlagBits.FRAGMENT_SHADER_BIT,
      );
    }
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
