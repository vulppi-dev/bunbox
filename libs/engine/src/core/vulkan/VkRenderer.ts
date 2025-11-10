import { getNativeWindow } from '@bunbox/glfw';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  getResultMessage,
  VK,
  VkResult,
  vkPresentInfoKHR,
  vkSubmitInfo,
  VK_WHOLE_SIZE,
} from '@bunbox/vk';
import { ptr } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { AbstractRenderer, type RendererOptions } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';
import { VkCommandPool } from './VkCommandPool';
import { VkSwapchain } from './VkSwapchain';
import { VkImageView } from './VkImageView';
import { VkCommandBuffer } from './VkCommandBuffer';
import { VkSync } from './VkSync';
import {
  VkRenderPipeline,
  type CustomPostProcessConfig,
} from './VkRenderPipeline';
import type { SampleCount } from '../../resources/types';
import type { AbstractCamera, Light, Mesh } from '../../nodes';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;

  #swapchain: VkSwapchain | null = null;
  #swapchainViews: VkImageView[] = [];

  #pipeline: VkRenderPipeline | null = null;

  #sync: VkSync | null = null;
  #commandPool: VkCommandPool | null = null;
  #commandBuffers: VkCommandBuffer[] = [];

  #swapCount: number = 0;
  #frameCount: number = 0;
  #currentFrameIndex: number = 0;

  #msaa: SampleCount = 1;

  override dispose(): void | Promise<void> {
    this.#pipeline?.dispose();
    this.#pipeline = null;
    this.#swapchainViews.forEach((view) => view.dispose());
    this.#swapchainViews = [];
    this.#swapchain?.dispose();
    this.#swapchain = null;
    this.#commandPool?.dispose();
    this.#commandPool = null;
    this.#commandBuffers.forEach((buffer) => buffer.dispose());
    this.#commandBuffers = [];
    this.#sync?.dispose();
    this.#sync = null;
    this.#swapCount = 0;
    this.#frameCount = 0;
    this.#currentFrameIndex = 0;
    this.#device?.dispose();
    this.#device = null;
  }

  #recordCommandBuffer(
    commandBuffer: VkCommandBuffer,
    imageIndex: number,
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
  ): void {
    // TODO: Implement actual recording logic
    // This is a placeholder that will be implemented when
    // we add mesh rendering, materials, and shaders
    commandBuffer.begin();

    // TODO: Record render pass commands here
    // - Begin render pass for each stage
    // - Bind pipeline
    // - Bind vertex/index buffers
    // - Draw meshes
    // - End render pass

    commandBuffer.end();
  }

  override render(
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
    delta: number,
  ): void {
    if (!this.#device || !this.#swapchain || !this.#pipeline || !this.#sync) {
      return;
    }

    this.#sync.waitForFence(this.#currentFrameIndex);

    const imageIndexHolder = new Uint32Array(1);
    const acquireResult = VK.vkAcquireNextImageKHR(
      this.#device.logicalDevice,
      this.#swapchain.swapchain,
      VK_WHOLE_SIZE,
      this.#sync.getImageAvailableSemaphore(this.#currentFrameIndex),
      0 as any,
      ptr(imageIndexHolder),
    );

    if (acquireResult === VkResult.ERROR_OUT_OF_DATE_KHR) {
      return;
    }

    if (
      acquireResult !== VkResult.SUCCESS &&
      acquireResult !== VkResult.SUBOPTIMAL_KHR
    ) {
      throw new DynamicLibError(getResultMessage(acquireResult), 'Vulkan');
    }

    const imageIndex = imageIndexHolder[0]!;

    this.#sync.waitIfImageInFlight(imageIndex);
    this.#sync.tagImageWithFrameFence(imageIndex, this.#currentFrameIndex);

    this.#sync.resetFence(this.#currentFrameIndex);

    const commandBuffer = this.#commandBuffers[imageIndex]!;

    this.#recordCommandBuffer(
      commandBuffer,
      imageIndex,
      cameras,
      meshes,
      lights,
    );

    const waitSemaphores = new BigUint64Array([
      BigInt(this.#sync.getImageAvailableSemaphore(this.#currentFrameIndex)),
    ]);
    const waitStages = new Uint32Array([0x00000100]);
    const signalSemaphores = new BigUint64Array([
      BigInt(this.#sync.getRenderFinishedSemaphore(this.#currentFrameIndex)),
    ]);
    const commandBufferArray = new BigUint64Array([
      BigInt(commandBuffer.instance),
    ]);

    const submitInfo = instantiate(vkSubmitInfo);
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = BigInt(ptr(waitSemaphores));
    submitInfo.pWaitDstStageMask = BigInt(ptr(waitStages));
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = BigInt(ptr(commandBufferArray));
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = BigInt(ptr(signalSemaphores));

    const submitResult = VK.vkQueueSubmit(
      this.#device.graphicsQueue,
      1,
      ptr(getInstanceBuffer(submitInfo)),
      this.#sync.getInFlightFence(this.#currentFrameIndex),
    );

    if (submitResult !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(submitResult), 'Vulkan');
    }

    const swapchains = new BigUint64Array([
      BigInt(this.#swapchain.swapchain),
    ]);
    const imageIndices = new Uint32Array([imageIndex]);

    const presentInfo = instantiate(vkPresentInfoKHR);
    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = BigInt(ptr(signalSemaphores));
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = BigInt(ptr(swapchains));
    presentInfo.pImageIndices = BigInt(ptr(imageIndices));
    presentInfo.pResults = 0n;

    const presentResult = VK.vkQueuePresentKHR(
      this.#device.presentQueue,
      ptr(getInstanceBuffer(presentInfo)),
    );

    if (
      presentResult === VkResult.ERROR_OUT_OF_DATE_KHR ||
      presentResult === VkResult.SUBOPTIMAL_KHR
    ) {
      return;
    }

    if (presentResult !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(presentResult), 'Vulkan');
    }

    this.#currentFrameIndex =
      (this.#currentFrameIndex + 1) % this.#sync.maxFramesInFlight;
    this.#frameCount++;
  }

  /**
   * Set MSAA sample count (1 = disabled)
   */
  setMSAA(sampleCount: SampleCount): void {
    this.#msaa = sampleCount;
    this.#pipeline?.setMSAA(sampleCount > 1, sampleCount);
  }

  /**
   * Add a custom post-process stage
   */
  addCustomPostProcess(config: CustomPostProcessConfig): void {
    this.#pipeline?.addCustomPostProcess(config);
  }

  /**
   * Remove a custom post-process stage by name
   */
  removeCustomPostProcess(name: string): boolean {
    return this.#pipeline?.removeCustomPostProcess(name) ?? false;
  }

  /**
   * Clear all custom post-process stages
   */
  clearCustomPostProcess(): void {
    this.#pipeline?.clearCustomPostProcess();
  }

  protected override _prepare(options?: RendererOptions): void | Promise<void> {
    this.#msaa = options?.msaa ?? 1;

    const [nWindow, display] = getNativeWindow(this._getWindow());
    this.#device = new VkDevice(nWindow, display);
    const indices = this.#device.findQueueFamilies();
    this.#commandPool = new VkCommandPool(
      this.#device.logicalDevice,
      indices.graphicsFamily,
    );
  }

  protected override _rebuildSwapChain(width: number, height: number): void {
    if (!this.#device) {
      return;
    }

    if (this.#pipeline) {
      this.#swapchainViews.forEach((view) => view.dispose());
      this.#swapchainViews = [];
      this.#swapchain?.dispose();
      this.#swapchain = null;
    }

    if (width === 0 || height === 0) {
      return;
    }

    this.#swapchain = new VkSwapchain(this.#device, width, height);

    this.#swapCount = this.#swapchain.images.length;
    this.#frameCount = Math.max(this.#swapCount - 1, 2);

    this.#swapchainViews = this.#swapchain.images.map(
      (image) =>
        new VkImageView({
          device: this.#device!.logicalDevice,
          format: this.#swapchain!.format,
          image: image as any,
          mask: ['color'],
        }),
    );

    if (!this.#pipeline) {
      this.#pipeline = new VkRenderPipeline(
        this.#device,
        width,
        height,
        this.#swapchain.format,
        this.#swapchain.images,
        this.#swapchainViews,
      );

      if (this.#msaa > 1) {
        this.#pipeline.setMSAA(true, this.#msaa);
      }
    } else {
      this.#pipeline.updateSwapchain(
        this.#swapchain.images,
        this.#swapchainViews,
      );
      this.#pipeline.rebuild(width, height);
    }

    if (this.#frameCount === this.#commandBuffers.length) {
      if (!this.#sync) {
        this.#sync = new VkSync(
          this.#device.logicalDevice,
          this.#swapCount,
          this.#frameCount,
        );
      } else {
        this.#sync.initPerSwapchainImages(this.#swapCount);
      }
      return;
    }

    this.#commandBuffers.forEach((buffer) => buffer.dispose());
    this.#commandBuffers = [];

    for (let i = 0; i < this.#swapCount; i++) {
      const commandBuffer = new VkCommandBuffer(
        this.#device.logicalDevice,
        this.#commandPool!.instance,
      );
      this.#commandBuffers.push(commandBuffer);
    }
  }
}
