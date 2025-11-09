import { getNativeWindow } from '@bunbox/glfw';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';
import { VkCommandPool } from './VkCommandPool';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;
  #commandPool: VkCommandPool | null = null;

  override dispose(): void | Promise<void> {
    this.#commandPool?.dispose();
    this.#device?.dispose();
  }

  override render(meshes: any[], delta: number): void {}

  protected override _prepare(): void | Promise<void> {
    const [nWindow, display] = getNativeWindow(this._getWindow());
    this.#device = new VkDevice(nWindow, display);
    const indices = this.#device.findQueueFamilies();
    this.#commandPool = new VkCommandPool(
      this.#device.logicalDevice,
      indices.graphicsFamily,
    );
  }

  protected override _rebuildSwapChain(width: number, height: number): void {}
}
