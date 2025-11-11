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
import { ptr, type Pointer } from 'bun:ffi';
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
import { Color } from '../../math/Color';
import { Rect } from '../../math/Rect';
import { Cube } from '../../math';

export class VkRenderer extends AbstractRenderer {
  private __device: VkDevice | null = null;

  private __swapchain: VkSwapchain | null = null;
  private __swapchainViews: VkImageView[] = [];

  private __pipeline: VkRenderPipeline | null = null;

  private __sync: VkSync | null = null;
  private __commandPool: VkCommandPool | null = null;
  private __commandBuffers: VkCommandBuffer[] = [];

  private __swapCount: number = 0;
  private __frameCount: number = 0;
  private __currentFrameIndex: number = 0;

  private __msaa: SampleCount = 1;

  constructor(window: Pointer, options?: RendererOptions) {
    super(window, options);
    this.__msaa = options?.msaa ?? 1;

    const [nWindow, display] = getNativeWindow(this._getWindow());
    this.__device = new VkDevice(nWindow, display);
    const family = this.__device.findQueueFamily();
    this.__commandPool = new VkCommandPool(this.__device.logicalDevice, family);
  }

  override dispose(): void | Promise<void> {
    this.__pipeline?.dispose();
    this.__pipeline = null;
    this.__swapchainViews.forEach((view) => view.dispose());
    this.__swapchainViews = [];
    this.__swapchain?.dispose();
    this.__swapchain = null;
    this.__commandPool?.dispose();
    this.__commandPool = null;
    this.__commandBuffers.forEach((buffer) => buffer.dispose());
    this.__commandBuffers = [];
    this.__sync?.dispose();
    this.__sync = null;
    this.__swapCount = 0;
    this.__frameCount = 0;
    this.__currentFrameIndex = 0;
    this.__device?.dispose();
    this.__device = null;
  }

  private __recordCommandBuffer(
    commandBuffer: VkCommandBuffer,
    imageIndex: number,
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
  ): void {
    commandBuffer.begin();
    commandBuffer.setViewport(
      new Cube(
        0,
        0,
        0,
        this.__swapchain ? this.__swapchain.width : 0,
        this.__swapchain ? this.__swapchain.height : 0,
        1.0,
      ),
    );
    commandBuffer.setScissor(
      new Rect(
        0,
        0,
        this.__swapchain ? this.__swapchain.width : 0,
        this.__swapchain ? this.__swapchain.height : 0,
      ),
    );

    // TODO: Implement actual recording logic
    // For now, render clear screen directly to swapchain
    if (this.__pipeline?.finalCompositeStage && this.__swapchain) {
      const stage = this.__pipeline.finalCompositeStage;
      const framebuffer = stage.framebuffers[imageIndex];

      if (framebuffer) {
        const renderArea = new Rect(
          0,
          0,
          this.__swapchain.width,
          this.__swapchain.height,
        );

        // Render with clear color directly to swapchain
        commandBuffer.beginRenderPass(
          stage.renderPass.instance,
          framebuffer.framebuffer,
          renderArea,
          [this._clearColor],
        );

        // TODO: Record actual render commands here
        // - Bind pipeline
        // - Bind vertex/index buffers
        // - Draw meshes

        commandBuffer.endRenderPass();
      }
    }

    commandBuffer.end();
  }

  override render(
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
    delta: number,
  ): void {
    if (
      !this.__device ||
      !this.__swapchain ||
      !this.__pipeline ||
      !this.__sync
    ) {
      return;
    }

    this.__sync.waitForFence(this.__currentFrameIndex);

    const imageIndexHolder = new Uint32Array(1);
    const acquireResult = VK.vkAcquireNextImageKHR(
      this.__device.logicalDevice,
      this.__swapchain.swapchain,
      VK_WHOLE_SIZE,
      this.__sync.getImageAvailableSemaphore(this.__currentFrameIndex),
      0,
      ptr(imageIndexHolder),
    );

    if (
      acquireResult === VkResult.ERROR_OUT_OF_DATE_KHR ||
      acquireResult === VkResult.SUBOPTIMAL_KHR
    ) {
      this.rebuildFrame();
      return;
    }

    if (acquireResult !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(acquireResult), 'Vulkan');
    }

    const imageIndex = imageIndexHolder[0]!;

    this.__sync.waitIfImageInFlight(imageIndex);
    this.__sync.tagImageWithFrameFence(imageIndex, this.__currentFrameIndex);

    this.__sync.resetFence(this.__currentFrameIndex);

    const commandBuffer = this.__commandBuffers[imageIndex]!;

    this.__recordCommandBuffer(
      commandBuffer,
      imageIndex,
      cameras,
      meshes,
      lights,
    );

    const waitSemaphores = new BigUint64Array([
      BigInt(this.__sync.getImageAvailableSemaphore(this.__currentFrameIndex)),
    ]);
    const waitStages = new Uint32Array([0x00000100]);
    const signalSemaphores = new BigUint64Array([
      BigInt(this.__sync.getRenderFinishedSemaphore(this.__currentFrameIndex)),
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
      this.__device.familyQueue,
      1,
      ptr(getInstanceBuffer(submitInfo)),
      this.__sync.getInFlightFence(this.__currentFrameIndex),
    );

    if (submitResult !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(submitResult), 'Vulkan');
    }

    const swapchains = new BigUint64Array([
      BigInt(this.__swapchain.swapchain),
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
      this.__device.familyQueue,
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

    this.__currentFrameIndex =
      (this.__currentFrameIndex + 1) % this.__sync.maxFramesInFlight;
    this.__frameCount++;
  }

  /**
   * Set MSAA sample count (1 = disabled)
   */
  setMSAA(sampleCount: SampleCount): void {
    this.__msaa = sampleCount;
    this.__pipeline?.setMSAA(sampleCount > 1, sampleCount);
  }

  /**
   * Add a custom post-process stage
   */
  addCustomPostProcess(config: CustomPostProcessConfig): void {
    this.__pipeline?.addCustomPostProcess(config);
  }

  /**
   * Remove a custom post-process stage by name
   */
  removeCustomPostProcess(name: string): boolean {
    return this.__pipeline?.removeCustomPostProcess(name) ?? false;
  }

  /**
   * Clear all custom post-process stages
   */
  clearCustomPostProcess(): void {
    this.__pipeline?.clearCustomPostProcess();
  }

  override rebuildFrame(): void {
    super.rebuildFrame();
    if (!this.__device) {
      return;
    }
    const width = this.width;
    const height = this.height;

    if (this.__swapchain) {
      this.__swapchainViews.forEach((view) => view.dispose());
      this.__swapchainViews = [];
      this.__swapchain?.dispose();
      this.__swapchain = null;
    }

    if (width === 0 || height === 0) {
      return;
    }

    this.__swapchain = new VkSwapchain(this.__device, width, height);

    this.__swapCount = this.__swapchain.images.length;
    this.__frameCount = Math.max(this.__swapCount - 1, 2);

    this.__swapchainViews = this.__swapchain.images.map(
      (image) =>
        new VkImageView({
          device: this.__device!.logicalDevice,
          format: this.__swapchain!.format,
          image: image as any,
          mask: ['color'],
        }),
    );

    if (!this.__pipeline) {
      this.__pipeline = new VkRenderPipeline(
        this.__device,
        width,
        height,
        this.__swapchain.format,
        this.__swapchain.images,
        this.__swapchainViews,
      );

      if (this.__msaa > 1) {
        this.__pipeline.setMSAA(true, this.__msaa);
      }
    } else {
      this.__pipeline.updateSwapchain(
        this.__swapchain.images,
        this.__swapchainViews,
      );
      this.__pipeline.rebuild(width, height);
    }

    if (!this.__sync) {
      this.__sync = new VkSync(
        this.__device.logicalDevice,
        this.__swapCount,
        this.__frameCount,
      );
    } else {
      this.__sync.initPerSwapchainImages(this.__swapCount);
    }

    if (this.__frameCount === this.__commandBuffers.length) {
      return;
    }

    this.__commandBuffers.forEach((buffer) => buffer.dispose());
    this.__commandBuffers = [];

    for (let i = 0; i < this.__swapCount; i++) {
      const commandBuffer = new VkCommandBuffer(
        this.__device.logicalDevice,
        this.__commandPool!.instance,
      );
      this.__commandBuffers.push(commandBuffer);
    }
  }
}
