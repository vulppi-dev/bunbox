import { getNativeWindow } from '@bunbox/glfw';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';
import { VkCommandPool } from './VkCommandPool';
import { createSimpleMaterial, RenderPassPresets } from '../../builders';
import { VkRenderPass } from './VkRenderPass';
import { VkSwapchain } from './VkSwapchain';
import { VkImageView } from './VkImageView';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;
  #swapchain: VkSwapchain | null = null;
  #commandPool: VkCommandPool | null = null;
  #swapchainView: VkImageView | null = null;

  override dispose(): void | Promise<void> {
    this.#commandPool?.dispose();
    this.#swapchain?.dispose();
    this.#device?.dispose();
  }

  override render(meshes: any[], delta: number): void {
    if (!this.#device || !this.#swapchain) {
      return;
    }

    // const renderPassBase = RenderPassPresets.forward();
    // const renderPass = new VkRenderPass(
    //   this.#device.logicalDevice,
    //   renderPassBase,
    // );
    // const material = createSimpleMaterial();
  }

  protected override _prepare(): void | Promise<void> {
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
    if (this.#swapchain) {
      this.#swapchainView?.dispose();
      this.#swapchainView = null;
      this.#swapchain.dispose();
      this.#swapchain = null;
    }

    if (width === 0 || height === 0) {
      return;
    }

    this.#swapchain = new VkSwapchain(this.#device, width, height);
    this.#swapchainView = new VkImageView({
      device: this.#device.logicalDevice,
      format: this.#swapchain.format,
      image: this.#swapchain.images as any,
      mask: ['color'],
    });
  }
}
