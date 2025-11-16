import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkCommandBufferAllocateInfo,
  vkCommandBufferBeginInfo,
  VkCommandBufferLevel,
  VkIndexType,
  VkPipelineBindPoint,
  vkRect2D,
  vkRenderPassBeginInfo,
  VkResult,
  VkSubpassContents,
  vkViewport,
  vkClearValue,
  VkCommandBufferUsageFlagBits,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { Color } from '../../math/Color';
import { Rect } from '../../math/Rect';
import { VK_DEBUG } from '../../singleton/logger';
import type { VkBuffer } from './VkBuffer';
import type { Cube } from '../../math';

/**
 * Wrapper for Vulkan VkCommandBuffer
 * Records GPU commands for rendering and compute operations
 */
export class VkCommandBuffer implements Disposable {
  private __device: Pointer;
  private __commandPool: Pointer;
  private __instance: Pointer;
  private __isRecording: boolean = false;
  private __clearValuesBuffer: Uint8Array | null = null;

  constructor(device: Pointer, commandPool: Pointer) {
    this.__device = device;
    this.__commandPool = commandPool;

    VK_DEBUG('Allocating command buffer');

    this.__instance = this.__allocateCommandBuffer();

    VK_DEBUG(`Command buffer allocated: 0x${this.__instance.toString(16)}`);
  }

  get instance() {
    return this.__instance;
  }

  get isRecording() {
    return this.__isRecording;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Freeing command buffer: 0x${this.__instance.toString(16)}`);
    VK.vkFreeCommandBuffers(
      this.__device,
      this.__commandPool,
      1,
      ptr(new BigUint64Array([BigInt(this.__instance)])),
    );
    VK_DEBUG('Command buffer freed');
  }

  /**
   * Reset the command buffer to initial state
   */
  reset(): void {
    if (this.__isRecording) {
      throw new DynamicLibError(
        'Cannot reset command buffer while recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Resetting command buffer: 0x${this.__instance.toString(16)}`);

    const result = VK.vkResetCommandBuffer(this.__instance, 0);

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    VK_DEBUG('Command buffer reset');
  }

  /**
   * Begin recording commands into the command buffer
   */
  begin(): void {
    if (this.__isRecording) {
      throw new DynamicLibError(
        'Command buffer is already recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Beginning command buffer: 0x${this.__instance.toString(16)}`);

    const beginInfo = instantiate(vkCommandBufferBeginInfo);
    beginInfo.flags = VkCommandBufferUsageFlagBits.ONE_TIME_SUBMIT_BIT;
    beginInfo.pInheritanceInfo = 0n;

    const result = VK.vkBeginCommandBuffer(
      this.__instance,
      ptr(getInstanceBuffer(beginInfo)),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__isRecording = true;
    VK_DEBUG('Command buffer recording started');
  }

  /**
   * End recording commands into the command buffer
   */
  end(): void {
    if (!this.__isRecording) {
      throw new DynamicLibError('Command buffer is not recording', 'Vulkan');
    }

    VK_DEBUG(`Ending command buffer: 0x${this.__instance.toString(16)}`);

    const result = VK.vkEndCommandBuffer(this.__instance);

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__isRecording = false;
    VK_DEBUG('Command buffer recording ended');
  }

  /**
   * Begin a render pass
   */
  beginRenderPass(
    renderPass: Pointer,
    framebuffer: Pointer,
    renderArea: Rect,
    clearValues?: Color[],
  ): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot begin render pass: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(
      `Beginning render pass: renderPass=0x${renderPass.toString(16)}, framebuffer=0x${framebuffer.toString(16)}`,
    );

    const renderPassInfo = instantiate(vkRenderPassBeginInfo);
    renderPassInfo.renderPass = BigInt(renderPass);
    renderPassInfo.framebuffer = BigInt(framebuffer);
    renderPassInfo.renderArea.offset.x = Math.floor(renderArea.x);
    renderPassInfo.renderArea.offset.y = Math.floor(renderArea.y);
    renderPassInfo.renderArea.extent.width = Math.floor(renderArea.width);
    renderPassInfo.renderArea.extent.height = Math.floor(renderArea.height);

    if (clearValues && clearValues.length > 0) {
      const length = sizeOf(vkClearValue);
      this.__clearValuesBuffer = new Uint8Array(clearValues.length * length);
      const cv = instantiate(vkClearValue);
      for (let i = 0; i < clearValues.length; i++) {
        cv.color.float32 = clearValues[i]!.toArray();
        this.__clearValuesBuffer.set(
          new Uint8Array(getInstanceBuffer(cv)),
          i * length,
        );
      }
      renderPassInfo.clearValueCount = clearValues.length;
      renderPassInfo.pClearValues = BigInt(ptr(this.__clearValuesBuffer));
    } else {
      renderPassInfo.clearValueCount = 0;
      renderPassInfo.pClearValues = 0n;
      this.__clearValuesBuffer = null;
    }

    VK.vkCmdBeginRenderPass(
      this.__instance,
      ptr(getInstanceBuffer(renderPassInfo)),
      VkSubpassContents.INLINE,
    );

    VK_DEBUG('Render pass begun');
  }

  /**
   * End the current render pass
   */
  endRenderPass(): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot end render pass: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG('Ending render pass');
    VK.vkCmdEndRenderPass(this.__instance);
    VK_DEBUG('Render pass ended');
  }

  /**
   * Bind a graphics pipeline
   */
  bindPipeline(pipeline: Pointer): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot bind pipeline: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Binding pipeline: 0x${pipeline.toString(16)}`);
    VK.vkCmdBindPipeline(
      this.__instance,
      VkPipelineBindPoint.GRAPHICS,
      pipeline,
    );
  }

  /**
   * Bind vertex buffers
   */
  bindVertexBuffers(
    firstBinding: number,
    buffers: VkBuffer[],
    offsets?: bigint[],
  ): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot bind vertex buffers: command buffer is not recording',
        'Vulkan',
      );
    }

    if (buffers.length === 0) {
      return;
    }

    VK_DEBUG(`Binding ${buffers.length} vertex buffer(s)`);

    const bufferPointers = new BigUint64Array(buffers.length);
    for (let i = 0; i < buffers.length; i++) {
      bufferPointers[i] = BigInt(buffers[i]!.instance);
    }

    const offsetArray = offsets
      ? new BigUint64Array(offsets)
      : new BigUint64Array(buffers.length).fill(0n);

    VK.vkCmdBindVertexBuffers(
      this.__instance,
      firstBinding,
      buffers.length,
      ptr(bufferPointers),
      ptr(offsetArray),
    );

    VK_DEBUG('Vertex buffers bound');
  }

  /**
   * Bind an index buffer
   */
  bindIndexBuffer(
    buffer: VkBuffer,
    offset: bigint = 0n,
    indexType: 'uint16' | 'uint32' = 'uint32',
  ): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot bind index buffer: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Binding index buffer: 0x${buffer.instance.toString(16)}`);

    const vkIndexType =
      indexType === 'uint16' ? VkIndexType.UINT16 : VkIndexType.UINT32;

    VK.vkCmdBindIndexBuffer(
      this.__instance,
      buffer.instance,
      offset,
      vkIndexType,
    );

    VK_DEBUG('Index buffer bound');
  }

  /**
   * Set viewport dynamically
   */
  setViewport(viewport: Cube): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot set viewport: command buffer is not recording',
        'Vulkan',
      );
    }

    const viewportStr = instantiate(vkViewport);
    viewportStr.x = viewport.x;
    viewportStr.y = viewport.y;
    viewportStr.width = viewport.width;
    viewportStr.height = viewport.height;
    viewportStr.minDepth = viewport.z;
    viewportStr.maxDepth = viewport.z + viewport.depth;

    VK.vkCmdSetViewport(
      this.__instance,
      0,
      1,
      ptr(getInstanceBuffer(viewportStr)),
    );
  }

  /**
   * Set scissor rectangle dynamically
   */
  setScissor(rect: Rect): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot set scissor: command buffer is not recording',
        'Vulkan',
      );
    }

    const scissor = instantiate(vkRect2D);
    scissor.offset.x = Math.floor(rect.x);
    scissor.offset.y = Math.floor(rect.y);
    scissor.extent.width = Math.floor(rect.width);
    scissor.extent.height = Math.floor(rect.height);

    VK.vkCmdSetScissor(this.__instance, 0, 1, ptr(getInstanceBuffer(scissor)));
  }

  /**
   * Draw non-indexed primitives
   */
  draw(
    vertexCount: number,
    instanceCount: number = 1,
    firstVertex: number = 0,
    firstInstance: number = 0,
  ): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot draw: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Drawing: ${vertexCount} vertices, ${instanceCount} instances`);
    VK.vkCmdDraw(
      this.__instance,
      vertexCount,
      instanceCount,
      firstVertex,
      firstInstance,
    );
  }

  /**
   * Draw indexed primitives
   */
  drawIndexed(
    indexCount: number,
    instanceCount: number = 1,
    firstIndex: number = 0,
    vertexOffset: number = 0,
    firstInstance: number = 0,
  ): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot draw indexed: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(
      `Drawing indexed: ${indexCount} indices, ${instanceCount} instances`,
    );
    VK.vkCmdDrawIndexed(
      this.__instance,
      indexCount,
      instanceCount,
      firstIndex,
      vertexOffset,
      firstInstance,
    );
  }

  clearImage(image: bigint, layout: number, color: Color): void {
    if (!this.__isRecording) {
      throw new DynamicLibError(
        'Cannot clear: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Clearing with color: ${color.toString()}`);

    const clearValue = instantiate(vkClearValue);
    clearValue.color.float32 = color.toArray();

    VK.vkCmdClearColorImage(
      this.__instance,
      image,
      layout,
      ptr(getInstanceBuffer(clearValue)),
      0,
      null,
    );
  }

  private __allocateCommandBuffer(): Pointer {
    const allocInfo = instantiate(vkCommandBufferAllocateInfo);
    allocInfo.level = VkCommandBufferLevel.PRIMARY;
    allocInfo.commandPool = BigInt(this.__commandPool);
    allocInfo.commandBufferCount = 1;

    const commandBuffers = new BigUint64Array(1);
    const result = VK.vkAllocateCommandBuffers(
      this.__device,
      ptr(getInstanceBuffer(allocInfo)),
      ptr(commandBuffers),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return Number(commandBuffers[0]!) as Pointer;
  }
}
