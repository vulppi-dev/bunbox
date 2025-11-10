import { getNativeWindow } from '@bunbox/glfw';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';
import { VkCommandPool } from './VkCommandPool';
import { createSimpleMaterial, RenderPassPresets } from '../../builders';
import { VkRenderPass } from './VkRenderPass';
import { VkSwapchain } from './VkSwapchain';
import { VkImageView } from './VkImageView';
import { TextureImage } from '../../resources';
import { VkImage } from './VkImage';
import { VkCommandBuffer } from './VkCommandBuffer';
import { VkSync } from './VkSync';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;

  #swapchain: VkSwapchain | null = null;
  #depthStencilTexture: TextureImage | null = null;
  #depthStencilImages: VkImage[] = [];
  #swapchainViews: VkImageView[] = [];
  #depthStencilImageViews: VkImageView[] = [];

  #sync: VkSync | null = null;
  #commandPool: VkCommandPool | null = null;
  #commandBuffers: VkCommandBuffer[] = [];

  #swapCount: number = 0;
  #frameCount: number = 0;

  override dispose(): void | Promise<void> {
    this.#depthStencilImageViews.forEach((view) => view.dispose());
    this.#depthStencilImageViews = [];
    this.#depthStencilImages.forEach((image) => image.dispose());
    this.#depthStencilImages = [];
    this.#depthStencilTexture = null;
    this.#swapchainViews.forEach((view) => view.dispose());
    this.#swapchainViews = [];
    this.#swapchain?.dispose();
    this.#swapchain = null;
    this.#commandPool?.dispose();
    this.#commandPool = null;
    this.#commandBuffers.forEach((buffer) => buffer.dispose());
    this.#commandBuffers = [];
    this.#swapCount = 0;
    this.#frameCount = 0;
    this.#device?.dispose();
    this.#device = null;
  }

  override render(meshes: any[], delta: number): void {
    if (!this.#device || !this.#swapchain) {
      return;
    }
  }

  protected override _prepare(): void | Promise<void> {
    const [nWindow, display] = getNativeWindow(this._getWindow());
    this.#device = new VkDevice(nWindow, display);
    const indices = this.#device.findQueueFamilies();
    this.#commandPool = new VkCommandPool(
      this.#device.logicalDevice,
      indices.graphicsFamily,
    );

    this.#depthStencilTexture = new TextureImage({
      label: 'Depth/Stencil Texture',
      width: 1,
      height: 1,
      sampleCount: 1,
      format: 'depth32float-stencil8',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });
    this.#depthStencilTexture.markAsDirty();
  }

  protected override _rebuildSwapChain(width: number, height: number): void {
    if (!this.#device || !this.#depthStencilTexture) {
      return;
    }
    if (this.#swapchain) {
      this.#depthStencilImageViews.forEach((view) => view.dispose());
      this.#depthStencilImageViews = [];
      this.#depthStencilImages.forEach((image) => image.dispose());
      this.#depthStencilImages = [];
      this.#swapchainViews.forEach((view) => view.dispose());
      this.#swapchainViews = [];
      this.#swapchain.dispose();
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

    this.#depthStencilTexture.width = this.#swapchain.width;
    this.#depthStencilTexture.height = this.#swapchain.height;

    for (let i = 0; i < this.#swapCount; i++) {
      const depthStencilImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        this.#depthStencilTexture,
      );
      this.#depthStencilImages.push(depthStencilImage);
      const depthStencilImageView = new VkImageView({
        device: this.#device.logicalDevice,
        format: depthStencilImage.format,
        image: depthStencilImage.instance,
        mask: ['depth', 'stencil'],
      });
      this.#depthStencilImageViews.push(depthStencilImageView);
    }
    this.#depthStencilTexture.markAsClean();

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
