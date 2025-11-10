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

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;
  #swapchain: VkSwapchain | null = null;
  #commandPool: VkCommandPool | null = null;
  #swapchainView: VkImageView | null = null;
  #depthStencilTexture: TextureImage | null = null;
  #depthStencilImage: VkImage | null = null;
  #depthStencilImageView: VkImageView | null = null;

  override dispose(): void | Promise<void> {
    this.#depthStencilImageView?.dispose();
    this.#depthStencilImageView = null;
    this.#depthStencilImage?.dispose();
    this.#depthStencilImage = null;
    this.#depthStencilTexture = null;
    this.#swapchainView?.dispose();
    this.#swapchainView = null;
    this.#commandPool?.dispose();
    this.#commandPool = null;
    this.#swapchain?.dispose();
    this.#swapchain = null;
    this.#device?.dispose();
    this.#device = null;
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

    if (
      this.#depthStencilTexture.width !== this.#swapchain.width ||
      this.#depthStencilTexture.height !== this.#swapchain.height
    ) {
      this.#depthStencilTexture.width = this.#swapchain.width;
      this.#depthStencilTexture.height = this.#swapchain.height;
    }

    if (this.#depthStencilTexture.isDirty) {
      this.#depthStencilImageView?.dispose();
      this.#depthStencilImage?.dispose();

      this.#depthStencilImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        this.#depthStencilTexture,
      );

      this.#depthStencilImageView = new VkImageView({
        device: this.#device.logicalDevice,
        format: this.#depthStencilImage.format,
        image: this.#depthStencilImage.instance,
        mask: ['depth', 'stencil'],
      });

      this.#depthStencilTexture.markAsClean();
    }
  }
}
