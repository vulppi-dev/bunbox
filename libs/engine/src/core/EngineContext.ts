import { Root } from '@bunbox/tree';
import type { Color } from '../math';
import { VkDevice } from './vulkan/VkDevice';
import { VkSwapchain } from './vulkan/VkSwapchain';
import { VkSync } from './vulkan/VkSync';
import { VkCommandPool } from './vulkan/VkCommandPool';
import { VkCommandBuffer } from './vulkan/VkCommandBuffer';

type WindowPack = {
  device: VkDevice;
  swapchain?: VkSwapchain;
  commandPool?: VkCommandPool;
  commandBuffers?: VkCommandBuffer[];
  sync?: VkSync;
};

export class EngineContext extends Root {
  private __keepAliveWindows: Map<bigint, WindowPack> = new Map();

  disposeWindow(window: bigint): void {
    const pack = this.__keepAliveWindows.get(window);
    if (pack) {
      pack.sync?.waitDeviceIdle();

      // TODO: dispose other resources associated with swapchain

      pack.swapchain?.dispose();
      pack.sync?.dispose();
      pack.commandBuffers?.forEach((cmdBuf) => cmdBuf.dispose());
      pack.commandPool?.dispose();
      pack.device.dispose();
      this.__keepAliveWindows.delete(window);
    }
  }

  rebuildSwapchain(
    window: bigint,
    display: bigint,
    width: number,
    height: number,
  ): void {
    let pack = this.__keepAliveWindows.get(window);
    if (!pack) {
      pack = {
        device: new VkDevice(window, display),
      };
    }

    // clear old swapchain if exists
    if (pack.swapchain) {
      pack.swapchain.dispose();
      pack.swapchain = undefined;
    }
    if (width <= 0 || height <= 0) {
      return;
    }
    pack.swapchain = new VkSwapchain(pack.device, width, height);

    const imageCount = pack.swapchain.imageCount;
    const frameCount = pack.swapchain.frameCount;

    if (
      pack.sync &&
      pack.swapchain.frameCount !== pack.sync.maxFramesInFlight
    ) {
      pack.sync.dispose();
      pack.sync = undefined;
    }

    if (!pack.sync) {
      pack.sync = new VkSync(pack.device.logicalDevice, frameCount, imageCount);
    } else if (pack.sync.maxImagesInFlight !== imageCount) {
      pack.sync.updateImagesCount(imageCount);
    }

    if (!pack.commandPool) {
      pack.commandPool = new VkCommandPool(
        pack.device.logicalDevice,
        pack.device.findQueueFamily(),
      );
    }

    if (!pack.commandBuffers || pack.commandBuffers.length !== frameCount) {
      pack.commandBuffers?.forEach((cmdBuf) => cmdBuf.dispose());
      const newCmdBuffers: VkCommandBuffer[] = [];
      for (let i = 0; i < frameCount; i++) {
        const cmdBuf = new VkCommandBuffer(
          pack.device.logicalDevice,
          pack.commandPool.instance,
        );
        newCmdBuffers.push(cmdBuf);
      }
      pack.commandBuffers = newCmdBuffers;
    }
  }

  renderFrame(window: bigint, bgColor: Color, delta: number): void {}
}
