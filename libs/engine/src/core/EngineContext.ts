import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  getResultMessage,
  VK,
  VK_WHOLE_SIZE,
  vkPresentInfoKHR,
  VkResult,
  vkSubmitInfo,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { RenderError } from '../errors';
import { VkCommandBuffer } from './vulkan/VkCommandBuffer';
import { VkCommandPool } from './vulkan/VkCommandPool';
import { VkDevice } from './vulkan/VkDevice';
import { VkSwapchain } from './vulkan/VkSwapchain';
import { VkSync } from './vulkan/VkSync';
import type { Scene } from './Scene';

type WindowPack = {
  device: VkDevice;
  swapchain?: VkSwapchain;
  commandPool?: VkCommandPool;
  commandBuffers?: VkCommandBuffer[];
  sync?: VkSync;
};

export class EngineContext {
  private __windowsPack: Map<bigint, WindowPack> = new Map();
  private __windowsFrameIndices: Map<bigint, number> = new Map();

  // Aux holders
  private __imageIndexHolder = new Uint32Array(1);

  disposeWindow(window: bigint): void {
    const pack = this.__windowsPack.get(window);
    if (pack) {
      pack.sync?.waitDeviceIdle();

      // TODO: dispose other resources associated with swapchain

      pack.swapchain?.dispose();
      pack.sync?.dispose();
      pack.commandBuffers?.forEach((cmdBuf) => cmdBuf.dispose());
      pack.commandPool?.dispose();
      pack.device.dispose();
      this.__windowsPack.delete(window);
    }
    this.__windowsFrameIndices.delete(window);
    this.__windowsPack.delete(window);
  }

  rebuildSwapchain(
    window: bigint,
    display: bigint,
    width: number,
    height: number,
  ): void {
    let pack = this.__windowsPack.get(window);
    if (!pack) {
      pack = {
        device: new VkDevice(window, display),
      };
      this.__windowsPack.set(window, pack);
      this.__windowsFrameIndices.set(window, 0);
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

  renderFrame(window: bigint, scene: Scene | null, delta: number): void {
    const pack = this.__windowsPack.get(window);
    if (
      !pack ||
      !pack.device ||
      !pack.swapchain ||
      !pack.sync ||
      !pack.commandBuffers ||
      !scene
    ) {
      return;
    }
    const frameIndex = this.__windowsFrameIndices.get(window)!;
    const acquireResult = VK.vkAcquireNextImageKHR(
      pack.device.logicalDevice,
      pack.swapchain.instance,
      VK_WHOLE_SIZE,
      pack.sync.getImageAvailableSemaphore(frameIndex),
      0,
      ptr(this.__imageIndexHolder),
    );

    if (acquireResult === VkResult.ERROR_OUT_OF_DATE_KHR) {
      return;
    }

    if (
      acquireResult !== VkResult.SUCCESS &&
      acquireResult !== VkResult.SUBOPTIMAL_KHR
    ) {
      throw new RenderError(getResultMessage(acquireResult), 'Vulkan');
    }

    const imageIndex = this.__imageIndexHolder[0]!;
    pack.sync.waitIfImageInFlight(imageIndex);
    pack.sync.tagImageWithFrameFence(imageIndex, frameIndex);
    pack.sync.resetFence(frameIndex);
    const commandBuffer = pack.commandBuffers[frameIndex]!;

    scene.render(pack.device, pack.swapchain, commandBuffer, imageIndex, delta);

    const signal = this.__submit(
      pack.sync,
      commandBuffer.instance,
      pack.device.familyQueue,
      frameIndex,
    );

    this.__present(
      pack.swapchain.instance,
      signal,
      pack.device.familyQueue,
      imageIndex,
    );

    this.__windowsFrameIndices.set(
      window,
      (frameIndex + 1) % pack.swapchain.frameCount,
    );
  }

  private __submit(
    sync: VkSync,
    cmd: Pointer,
    queue: Pointer,
    frameIndex: number,
  ) {
    const waitSemaphores = new BigUint64Array([
      BigInt(sync.getImageAvailableSemaphore(frameIndex)),
    ]);
    const waitStages = new Uint32Array([VkSync.DEFAULT_WAIT_STAGE]);
    const commandBufferArray = new BigUint64Array([
      BigInt(cmd),
    ]);
    const signalSemaphores = new BigUint64Array([
      BigInt(sync.getRenderFinishedSemaphore(frameIndex)),
    ]);
    const signal = BigInt(ptr(signalSemaphores));

    const submitInfo = instantiate(vkSubmitInfo);
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = BigInt(ptr(waitSemaphores));
    submitInfo.pWaitDstStageMask = BigInt(ptr(waitStages));
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = BigInt(ptr(commandBufferArray));
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = BigInt(ptr(signalSemaphores));

    const submitResult = VK.vkQueueSubmit(
      queue,
      1,
      ptr(getInstanceBuffer(submitInfo)),
      sync.getInFlightFence(frameIndex),
    );

    if (submitResult !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(submitResult), 'Vulkan');
    }

    return signal;
  }

  private __present(
    swapchain: Pointer,
    signal: bigint,
    queue: Pointer,
    imageIndex: number,
  ) {
    const swapchains = new BigUint64Array([
      BigInt(swapchain),
    ]);
    const imageIndices = new Uint32Array([imageIndex]);

    const presentInfo = instantiate(vkPresentInfoKHR);
    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = signal;
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = BigInt(ptr(swapchains));
    presentInfo.pImageIndices = BigInt(ptr(imageIndices));
    presentInfo.pResults = 0n;

    const presentResult = VK.vkQueuePresentKHR(
      queue,
      ptr(getInstanceBuffer(presentInfo)),
    );

    if (
      presentResult === VkResult.ERROR_OUT_OF_DATE_KHR ||
      presentResult === VkResult.SUBOPTIMAL_KHR
    ) {
      return;
    }

    if (presentResult !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(presentResult), 'Vulkan');
    }
  }
}
