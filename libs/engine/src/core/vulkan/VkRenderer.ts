import { getNativeWindow } from '@bunbox/glfw';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;

  override dispose(): void | Promise<void> {
    this.#device?.dispose();
  }

  override render(meshes: any[], delta: number): void {}

  protected override _prepare(): void | Promise<void> {
    const [nWindow, display] = getNativeWindow(this._getWindow());
    this.#device = new VkDevice(nWindow, display);
  }

  protected override _rebuildSwapChain(width: number, height: number): void {}
}
