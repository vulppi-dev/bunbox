import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { type Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkFenceCreateInfo,
  vkSemaphoreCreateInfo,
  VkResult,
  VK_WHOLE_SIZE,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

const VK_FENCE_CREATE_SIGNALED_BIT = 0x00000001;
const MAX_FRAMES_IN_FLIGHT = 2;

/**
 * Manages Vulkan synchronization primitives for rendering.
 *
 * Handles semaphores for GPU-GPU synchronization and fences for CPU-GPU synchronization.
 * Implements frame-in-flight management to allow multiple frames to be processed simultaneously.
 */
export class VkSync implements Disposable {
  private __device: Pointer;

  private __imageAvailableSemaphores: BigUint64Array;
  private __renderFinishedSemaphores: BigUint64Array;
  private __inFlightFences: BigUint64Array;

  // NOVO: por imagem do swapchain (tamanho S)
  private __imageInFlightFences: BigUint64Array;

  constructor(
    device: Pointer,
    maxFramesInFlight: number = MAX_FRAMES_IN_FLIGHT,
    maxSwapchainImages: number = MAX_FRAMES_IN_FLIGHT,
  ) {
    this.__device = device;

    VK_DEBUG(`Creating sync objects for ${maxFramesInFlight} frames in flight`);

    this.__imageAvailableSemaphores = new BigUint64Array(maxFramesInFlight);
    this.__renderFinishedSemaphores = new BigUint64Array(maxFramesInFlight);
    this.__inFlightFences = new BigUint64Array(maxFramesInFlight);
    this.__imageInFlightFences = new BigUint64Array(maxSwapchainImages);

    for (let i = 0; i < maxFramesInFlight; i++) {
      this.__createSemaphore(this.__imageAvailableSemaphores, i);
      this.__createSemaphore(this.__renderFinishedSemaphores, i);
      this.__createFence(this.__inFlightFences, i, true);
    }

    VK_DEBUG('Sync objects created successfully');
  }

  get imageAvailableSemaphores(): BigUint64Array {
    return this.__imageAvailableSemaphores;
  }

  get renderFinishedSemaphores(): BigUint64Array {
    return this.__renderFinishedSemaphores;
  }

  get inFlightFences(): BigUint64Array {
    return this.__inFlightFences;
  }

  get maxFramesInFlight(): number {
    return this.__inFlightFences.length;
  }

  /**
   * Initializes per-swapchain-image fences to track which images are currently in flight.
   */
  initPerSwapchainImages(swapchainImageCount: number): void {
    this.__imageInFlightFences = new BigUint64Array(swapchainImageCount); // zera (0n)
  }

  /**
   * Gets semaphore handle for image availability at specified frame index.
   */
  getImageAvailableSemaphore(frameIndex: number): Pointer {
    return Number(this.__imageAvailableSemaphores[frameIndex]) as Pointer;
  }

  /**
   * Gets semaphore handle for render completion at specified frame index.
   */
  getRenderFinishedSemaphore(frameIndex: number): Pointer {
    return Number(this.__renderFinishedSemaphores[frameIndex]) as Pointer;
  }

  /**
   * Gets fence handle for frame in-flight tracking at specified frame index.
   */
  getInFlightFence(frameIndex: number): Pointer {
    return Number(this.__inFlightFences[frameIndex]) as Pointer;
  }

  /**
   * Waits for fence at specified frame index to be signaled.
   */
  waitForFence(frameIndex: number, timeout: bigint = VK_WHOLE_SIZE): void {
    const fence = this.getInFlightFence(frameIndex);
    const fenceArray = new BigUint64Array([BigInt(fence)]);

    const result = VK.vkWaitForFences(
      this.__device,
      1,
      ptr(fenceArray),
      1,
      timeout,
    );

    if (result !== VkResult.SUCCESS && result !== VkResult.TIMEOUT) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
  }

  /**
   * Resets fence at specified frame index to unsignaled state.
   */
  resetFence(frameIndex: number): void {
    const fence = this.getInFlightFence(frameIndex);
    const fenceArray = new BigUint64Array([BigInt(fence)]);

    const result = VK.vkResetFences(this.__device, 1, ptr(fenceArray));

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
  }

  /**
   * Waits if the image at the given index is currently in flight.
   */
  waitIfImageInFlight(
    imageIndex: number,
    timeout: bigint = VK_WHOLE_SIZE,
  ): void {
    if (imageIndex < 0 || imageIndex >= this.__imageInFlightFences.length)
      return;
    const fenceHandle = Number(
      this.__imageInFlightFences[imageIndex],
    ) as Pointer;
    if (fenceHandle) {
      const arr = new BigUint64Array([BigInt(fenceHandle)]);
      const res = VK.vkWaitForFences(this.__device, 1, ptr(arr), 1, timeout);
      if (res !== VkResult.SUCCESS) {
        throw new DynamicLibError(getResultMessage(res), 'Vulkan');
      }
      this.__imageInFlightFences[imageIndex] = 0n;
    }
  }

  tagImageWithFrameFence(imageIndex: number, frameIndex: number): void {
    if (imageIndex < 0 || imageIndex >= this.__imageInFlightFences.length)
      return;
    const fence = this.getInFlightFence(frameIndex);
    this.__imageInFlightFences[imageIndex] = BigInt(fence);
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Destroying sync objects');

    for (let i = 0; i < this.__inFlightFences.length; i++) {
      const fence = Number(this.__inFlightFences[i]) as Pointer;
      if (fence) {
        VK.vkDestroyFence(this.__device, fence, null);
      }
    }

    for (let i = 0; i < this.__renderFinishedSemaphores.length; i++) {
      const semaphore = Number(this.__renderFinishedSemaphores[i]) as Pointer;
      if (semaphore) {
        VK.vkDestroySemaphore(this.__device, semaphore, null);
      }
    }

    for (let i = 0; i < this.__imageAvailableSemaphores.length; i++) {
      const semaphore = Number(this.__imageAvailableSemaphores[i]) as Pointer;
      if (semaphore) {
        VK.vkDestroySemaphore(this.__device, semaphore, null);
      }
    }

    VK_DEBUG('Sync objects destroyed');
  }

  private __createSemaphore(target: BigUint64Array, index: number): void {
    const pointerHolder = new BigUint64Array(1);
    const createInfo = instantiate(vkSemaphoreCreateInfo);
    createInfo.flags = 0;

    const result = VK.vkCreateSemaphore(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    const semaphoreHandle = pointerHolder[0];
    if (semaphoreHandle === undefined) {
      throw new DynamicLibError('Failed to create semaphore', 'Vulkan');
    }

    target[index] = semaphoreHandle;
    VK_DEBUG(`Semaphore ${index} created: 0x${semaphoreHandle.toString(16)}`);
  }

  private __createFence(
    target: BigUint64Array,
    index: number,
    signaled: boolean = false,
  ): void {
    const pointerHolder = new BigUint64Array(1);
    const createInfo = instantiate(vkFenceCreateInfo);
    createInfo.flags = signaled ? VK_FENCE_CREATE_SIGNALED_BIT : 0;

    const result = VK.vkCreateFence(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    const fenceHandle = pointerHolder[0];
    if (fenceHandle === undefined) {
      throw new DynamicLibError('Failed to create fence', 'Vulkan');
    }

    target[index] = fenceHandle;
    VK_DEBUG(`Fence ${index} created: 0x${fenceHandle.toString(16)}`);
  }
}
