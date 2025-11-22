import type { VkCommandBuffer, VkDevice, VkSwapchain } from '../vulkan';
import type { AssetsStorage } from './AssetsStorage';
import type { World } from './World';

export class RenderLogic {
  render(
    device: VkDevice,
    commandBuffer: VkCommandBuffer,
    swapchain: VkSwapchain,
    imageIndex: number,
    assetsStorage: AssetsStorage,
    world?: World,
  ): void {
    // TODO: implement actual rendering process
  }

  releaseSwapchainResources(window: bigint): void {}

  clear(): void {}
}
