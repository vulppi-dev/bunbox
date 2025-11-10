import { getInstanceBuffer, instantiate } from '@bunbox/struct';
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
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { Color } from '../../math/Color';
import { Rect } from '../../math/Rect';
import { VK_DEBUG } from '../../singleton/logger';
import type { VkBuffer } from './VkBuffer';

/**
 * Wrapper for Vulkan VkCommandBuffer
 * Records GPU commands for rendering and compute operations
 */
export class VkCommandBuffer implements Disposable {
  #device: Pointer;
  #commandPool: Pointer;
  #instance: Pointer;
  #isRecording: boolean = false;

  constructor(device: Pointer, commandPool: Pointer) {
    this.#device = device;
    this.#commandPool = commandPool;

    VK_DEBUG('Allocating command buffer');

    this.#instance = this.#allocateCommandBuffer();

    VK_DEBUG(`Command buffer allocated: 0x${this.#instance.toString(16)}`);
  }

  /**
   * Begin recording commands into the command buffer
   */
  begin(): void {
    if (this.#isRecording) {
      throw new DynamicLibError(
        'Command buffer is already recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Beginning command buffer: 0x${this.#instance.toString(16)}`);

    const beginInfo = instantiate(vkCommandBufferBeginInfo);
    beginInfo.flags = 0;
    beginInfo.pInheritanceInfo = 0n;

    const result = VK.vkBeginCommandBuffer(
      this.#instance,
      ptr(getInstanceBuffer(beginInfo)),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#isRecording = true;
    VK_DEBUG('Command buffer recording started');
  }

  /**
   * End recording commands into the command buffer
   */
  end(): void {
    if (!this.#isRecording) {
      throw new DynamicLibError('Command buffer is not recording', 'Vulkan');
    }

    VK_DEBUG(`Ending command buffer: 0x${this.#instance.toString(16)}`);

    const result = VK.vkEndCommandBuffer(this.#instance);

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#isRecording = false;
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
    if (!this.#isRecording) {
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
      // Create clear values array
      const clearValuesArray = new Float32Array(clearValues.length * 4);
      for (let i = 0; i < clearValues.length; i++) {
        const cv = clearValues[i]!;
        clearValuesArray[i * 4 + 0] = cv.r;
        clearValuesArray[i * 4 + 1] = cv.g;
        clearValuesArray[i * 4 + 2] = cv.b;
        clearValuesArray[i * 4 + 3] = cv.a;
      }
      renderPassInfo.clearValueCount = clearValues.length;
      renderPassInfo.pClearValues = BigInt(ptr(clearValuesArray));
    } else {
      renderPassInfo.clearValueCount = 0;
      renderPassInfo.pClearValues = 0n;
    }

    VK.vkCmdBeginRenderPass(
      this.#instance,
      ptr(getInstanceBuffer(renderPassInfo)),
      VkSubpassContents.INLINE,
    );

    VK_DEBUG('Render pass begun');
  }

  /**
   * End the current render pass
   */
  endRenderPass(): void {
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot end render pass: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG('Ending render pass');
    VK.vkCmdEndRenderPass(this.#instance);
    VK_DEBUG('Render pass ended');
  }

  /**
   * Bind a graphics pipeline
   */
  bindPipeline(pipeline: Pointer): void {
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot bind pipeline: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Binding pipeline: 0x${pipeline.toString(16)}`);
    VK.vkCmdBindPipeline(
      this.#instance,
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
    if (!this.#isRecording) {
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
      this.#instance,
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
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot bind index buffer: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Binding index buffer: 0x${buffer.instance.toString(16)}`);

    const vkIndexType =
      indexType === 'uint16' ? VkIndexType.UINT16 : VkIndexType.UINT32;

    VK.vkCmdBindIndexBuffer(
      this.#instance,
      buffer.instance,
      offset,
      vkIndexType,
    );

    VK_DEBUG('Index buffer bound');
  }

  /**
   * Set viewport dynamically
   */
  setViewport(
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number = 0.0,
    maxDepth: number = 1.0,
  ): void {
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot set viewport: command buffer is not recording',
        'Vulkan',
      );
    }

    const viewport = instantiate(vkViewport);
    viewport.x = x;
    viewport.y = y;
    viewport.width = width;
    viewport.height = height;
    viewport.minDepth = minDepth;
    viewport.maxDepth = maxDepth;

    VK.vkCmdSetViewport(this.#instance, 0, 1, ptr(getInstanceBuffer(viewport)));
  }

  /**
   * Set scissor rectangle dynamically
   */
  setScissor(rect: Rect): void {
    if (!this.#isRecording) {
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

    VK.vkCmdSetScissor(this.#instance, 0, 1, ptr(getInstanceBuffer(scissor)));
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
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot draw: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(`Drawing: ${vertexCount} vertices, ${instanceCount} instances`);
    VK.vkCmdDraw(
      this.#instance,
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
    if (!this.#isRecording) {
      throw new DynamicLibError(
        'Cannot draw indexed: command buffer is not recording',
        'Vulkan',
      );
    }

    VK_DEBUG(
      `Drawing indexed: ${indexCount} indices, ${instanceCount} instances`,
    );
    VK.vkCmdDrawIndexed(
      this.#instance,
      indexCount,
      instanceCount,
      firstIndex,
      vertexOffset,
      firstInstance,
    );
  }

  get instance() {
    return this.#instance;
  }

  get isRecording() {
    return this.#isRecording;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Freeing command buffer: 0x${this.#instance.toString(16)}`);
    VK.vkFreeCommandBuffers(
      this.#device,
      this.#commandPool,
      1,
      ptr(new BigUint64Array([BigInt(this.#instance)])),
    );
    VK_DEBUG('Command buffer freed');
  }

  #allocateCommandBuffer(): Pointer {
    const allocInfo = instantiate(vkCommandBufferAllocateInfo);
    allocInfo.commandPool = BigInt(this.#commandPool);
    allocInfo.level = VkCommandBufferLevel.PRIMARY;
    allocInfo.commandBufferCount = 1;

    const commandBuffers = new BigUint64Array(1);
    const result = VK.vkAllocateCommandBuffers(
      this.#device,
      ptr(getInstanceBuffer(allocInfo)),
      ptr(commandBuffers),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return Number(commandBuffers[0]!) as Pointer;
  }
}
