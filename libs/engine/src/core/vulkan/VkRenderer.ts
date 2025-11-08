import { DynamicLibError } from '../../errors';
import { AbstractRenderer } from '../AbstractRenderer';
import { VkDevice } from './VkDevice';

export class VkRenderer extends AbstractRenderer {
  static #device: VkDevice | null = null;

  override render(meshes: any[], delta: number): void {
    // throw new Error("Method not implemented.");
  }

  protected override _systemType(): string {
    return 'vulkan';
  }

  protected override _isSystemLoaded(): boolean {
    return !!VkRenderer.#device;
  }

  protected override _rebuildSwapChain(width: number, height: number): void {
    // throw new Error("Method not implemented.");
  }

  protected override _initiateSystem(): void {
    const [window, display] = this._getNativeWindow();
    if (!window) {
      throw new DynamicLibError('Failed to get native window handle', 'Vulkan');
    }
    VkRenderer.#device = new VkDevice(window);
  }

  protected override _releaseSystem(): void {
    // throw new Error("Method not implemented.");
  }
}
