import { DynamicLibError } from '../../errors';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';

export class VkRenderer extends AbstractRenderer {
  #device: VkDevice | null = null;

  override dispose(): void | Promise<void> {}

  override render(meshes: any[], delta: number): void {}

  protected override _prepare(): void | Promise<void> {
    this.#device = new VkDevice(this._getWindow(), ...this._getNativeWindow());
  }

  protected override _rebuildSwapChain(width: number, height: number): void {}
}
