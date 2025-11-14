import { Root } from '@bunbox/tree';
import type { VkDevice } from './vulkan/VkDevice';
import type { VkSwapchain } from './vulkan/VkSwapchain';
import type { VkCommandBuffer } from './vulkan/VkCommandBuffer';
import { Cube, Rect } from '../math';
import type { AssetsStorage } from './AssetsStorage';

export class Scene extends Root {
  render(
    device: VkDevice,
    swapchain: VkSwapchain,
    commandBuffer: VkCommandBuffer,
    imageIndex: number,
    assetsStore: AssetsStorage,
    delta: number,
  ): void {
    commandBuffer.begin();
    const renderArea = new Rect(0, 0, swapchain.width, swapchain.height);

    commandBuffer.setViewport(
      new Cube(0, 0, 0, swapchain.width, swapchain.height, 1.0),
    );
    commandBuffer.setScissor(renderArea);

    // Render with clear color directly to swapchain
    // commandBuffer.beginRenderPass(
    //   stage.renderPass.instance,
    //   framebuffer.instance,
    //   renderArea,
    //   [this._clearColor],
    // );

    // commandBuffer.endRenderPass();

    commandBuffer.end();
  }
}
