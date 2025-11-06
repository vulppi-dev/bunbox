import { AbstractRenderer } from '../AbstractRenderer';

export class VkRenderer extends AbstractRenderer {
  override render(meshes: any[], delta: number): void {
    // throw new Error("Method not implemented.");
  }
  protected override _systemType(): string {
    return 'vulkan';
  }
  protected override _isSystemLoaded(): boolean {
    return true;
  }
  protected override _rebuildSwapChain(width: number, height: number): void {
    // throw new Error("Method not implemented.");
  }
  protected override _initiateSystem(): void {
    // throw new Error("Method not implemented.");
  }
  protected override _releaseSystem(): void {
    // throw new Error("Method not implemented.");
  }
}
