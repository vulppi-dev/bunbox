import { getNativeWindow } from '@bunbox/glfw';
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
    this.#device?.dispose();
    this.#device = null;
  }

  override render(
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
    delta: number,
  ): void {
    if (!this.#device || !this.#swapchain || !this.#pipeline) return;
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
