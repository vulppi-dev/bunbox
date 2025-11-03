import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  VK,
  Vk_CommandBufferLevel,
  Vk_Result,
  Vk_StructureType,
  Vk_SubpassContents,
  VkCommandBufferAllocateInfo,
  VkCommandBufferBeginInfo,
  VkRenderPassBeginInfo,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { type Color } from '../../math';
import { VK_DEBUG } from '../../singleton/logger';
import type { CommandPool } from './CommandPool';

export class CommandBuffer implements Disposable {
  #vkLogicalDevice: Pointer;
  #commandPool: CommandPool;
  #commandBuffer: Pointer | null = null;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(vkLogicalDevice: Pointer, commandPool: CommandPool) {
    this.#vkLogicalDevice = vkLogicalDevice;
    this.#commandPool = commandPool;
    this.#ptr_aux = new BigUint64Array(1);

    this.#allocateCommandBuffer();
  }

  get buffer(): Pointer {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }
    return this.#commandBuffer;
  }

  dispose(): void | Promise<void> {
    this.#freeCommandBuffer();
  }

  /**
   * Begin recording commands into the command buffer
   */
  begin(): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    const beginInfo = instantiate(VkCommandBufferBeginInfo);
    beginInfo.sType = Vk_StructureType.COMMAND_BUFFER_BEGIN_INFO;
    beginInfo.flags = 0;
    beginInfo.pInheritanceInfo = 0n;

    const result = VK.vkBeginCommandBuffer(
      this.#commandBuffer,
      ptr(getInstanceBuffer(beginInfo)),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to begin command buffer. VkResult: ${result}`,
        'Vulkan',
      );
    }
  }

  /**
   * End recording commands into the command buffer
   */
  end(): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    const result = VK.vkEndCommandBuffer(this.#commandBuffer);

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to end command buffer. VkResult: ${result}`,
        'Vulkan',
      );
    }
  }

  /**
   * Begin a render pass
   */
  beginRenderPass(
    renderPass: Pointer,
    framebuffer: Pointer,
    width: number,
    height: number,
    clearColor: Color,
  ): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    const clearValues = new Float32Array([
      clearColor.r,
      clearColor.g,
      clearColor.b,
      clearColor.a,
    ]);

    const renderPassBeginInfo = instantiate(VkRenderPassBeginInfo);
    renderPassBeginInfo.sType = Vk_StructureType.RENDER_PASS_BEGIN_INFO;
    renderPassBeginInfo.renderPass = BigInt(renderPass as number);
    renderPassBeginInfo.framebuffer = BigInt(framebuffer as number);
    renderPassBeginInfo.renderArea.offset.x = 0;
    renderPassBeginInfo.renderArea.offset.y = 0;
    renderPassBeginInfo.renderArea.extent.width = width;
    renderPassBeginInfo.renderArea.extent.height = height;
    renderPassBeginInfo.clearValueCount = 1;
    renderPassBeginInfo.pClearValues = BigInt(ptr(clearValues));

    VK.vkCmdBeginRenderPass(
      this.#commandBuffer,
      ptr(getInstanceBuffer(renderPassBeginInfo)),
      Vk_SubpassContents.INLINE,
    );
  }

  /**
   * End the current render pass
   */
  endRenderPass(): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    VK.vkCmdEndRenderPass(this.#commandBuffer);
  }

  #allocateCommandBuffer(): void {
    VK_DEBUG('Allocating command buffer');

    const allocInfo = instantiate(VkCommandBufferAllocateInfo);
    allocInfo.sType = Vk_StructureType.COMMAND_BUFFER_ALLOCATE_INFO;
    allocInfo.commandPool = BigInt(this.#commandPool.pool as number);
    allocInfo.level = Vk_CommandBufferLevel.PRIMARY;
    allocInfo.commandBufferCount = 1;

    const result = VK.vkAllocateCommandBuffers(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(allocInfo)),
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to allocate command buffer. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#commandBuffer = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Command buffer allocated: 0x${this.#commandBuffer.toString(16)}`);
  }

  #freeCommandBuffer(): void {
    if (!this.#commandBuffer) {
      return;
    }

    VK_DEBUG(`Freeing command buffer: 0x${this.#commandBuffer.toString(16)}`);

    const commandBufferArray = new BigUint64Array([
      BigInt(this.#commandBuffer as number),
    ]);

    VK.vkFreeCommandBuffers(
      this.#vkLogicalDevice,
      this.#commandPool.pool,
      1,
      ptr(commandBufferArray),
    );

    this.#commandBuffer = null;
    VK_DEBUG('Command buffer freed');
  }
}
