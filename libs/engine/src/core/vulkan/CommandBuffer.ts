import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  VK,
  Vk_CommandBufferLevel,
  Vk_ImageLayout,
  Vk_PipelineStageFlagBits,
  Vk_Result,
  Vk_StructureType,
  Vk_SubpassContents,
  VkCommandBufferAllocateInfo,
  VkCommandBufferBeginInfo,
  VkImageMemoryBarrier,
  VkRenderPassBeginInfo,
} from '../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { type Color } from '../../math';
import { VK_DEBUG } from '../../singleton/logger';
import type { CommandPool } from './CommandPool';
import type { Framebuffer } from './Framebuffer';
import type { VkTexture } from './VkTexture';
import { getImageAspectFlags } from './helpers/texture-format-mapping';

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
   * @param renderPass - VkRenderPass pointer
   * @param framebuffer - Either a Framebuffer instance or VkFramebuffer pointer
   * @param width - Render area width
   * @param height - Render area height
   * @param clearColor - Clear color values
   */
  beginRenderPass(
    renderPass: Pointer,
    framebuffer: Framebuffer | Pointer,
    width: number,
    height: number,
    clearColor: Color,
  ): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    // Extract VkFramebuffer pointer from Framebuffer instance or use directly
    const vkFramebuffer =
      framebuffer &&
      typeof framebuffer === 'object' &&
      'framebuffer' in framebuffer
        ? framebuffer.framebuffer
        : framebuffer;

    const clearValues = new Float32Array([
      clearColor.r,
      clearColor.g,
      clearColor.b,
      clearColor.a,
    ]);

    const renderPassBeginInfo = instantiate(VkRenderPassBeginInfo);
    renderPassBeginInfo.sType = Vk_StructureType.RENDER_PASS_BEGIN_INFO;
    renderPassBeginInfo.renderPass = BigInt(renderPass as number);
    renderPassBeginInfo.framebuffer = BigInt(vkFramebuffer as number);
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

  /**
   * Transition image layout using pipeline barrier
   * @param texture - VkTexture to transition
   * @param oldLayout - Current layout
   * @param newLayout - Target layout
   * @param srcStage - Source pipeline stage
   * @param dstStage - Destination pipeline stage
   */
  transitionImageLayout(
    texture: VkTexture,
    oldLayout: Vk_ImageLayout,
    newLayout: Vk_ImageLayout,
    srcStage: Vk_PipelineStageFlagBits = Vk_PipelineStageFlagBits.TOP_OF_PIPE_BIT,
    dstStage: Vk_PipelineStageFlagBits = Vk_PipelineStageFlagBits.FRAGMENT_SHADER_BIT,
  ): void {
    if (!this.#commandBuffer) {
      throw new DynamicLibError('Command buffer not allocated', 'Vulkan');
    }

    const barrier = instantiate(VkImageMemoryBarrier);
    barrier.sType = Vk_StructureType.IMAGE_MEMORY_BARRIER;
    barrier.oldLayout = oldLayout;
    barrier.newLayout = newLayout;
    barrier.srcQueueFamilyIndex = ~0; // VK_QUEUE_FAMILY_IGNORED
    barrier.dstQueueFamilyIndex = ~0; // VK_QUEUE_FAMILY_IGNORED
    barrier.image = BigInt(texture.image as number);
    barrier.subresourceRange.aspectMask = getImageAspectFlags(
      texture.sourceTexture.format,
    );
    barrier.subresourceRange.baseMipLevel = 0;
    barrier.subresourceRange.levelCount = 1; // TODO: Support mipmaps
    barrier.subresourceRange.baseArrayLayer = 0;
    barrier.subresourceRange.layerCount = 1;

    // Configure access masks based on layouts
    if (
      oldLayout === Vk_ImageLayout.UNDEFINED &&
      newLayout === Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL
    ) {
      barrier.srcAccessMask = 0;
      barrier.dstAccessMask = 0x00000002; // VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT
    } else if (
      oldLayout === Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL &&
      newLayout === Vk_ImageLayout.SHADER_READ_ONLY_OPTIMAL
    ) {
      barrier.srcAccessMask = 0x00000002; // VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT
      barrier.dstAccessMask = 0x00000020; // VK_ACCESS_SHADER_READ_BIT
    } else if (
      oldLayout === Vk_ImageLayout.UNDEFINED &&
      newLayout === Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL
    ) {
      barrier.srcAccessMask = 0;
      barrier.dstAccessMask = 0x00000200 | 0x00000400; // DEPTH_STENCIL_ATTACHMENT_READ_BIT | WRITE_BIT
    } else {
      // Generic transition
      barrier.srcAccessMask = 0;
      barrier.dstAccessMask = 0;
    }

    VK.vkCmdPipelineBarrier(
      this.#commandBuffer,
      srcStage,
      dstStage,
      0, // dependencyFlags
      0, // memoryBarrierCount
      null, // pMemoryBarriers
      0, // bufferMemoryBarrierCount
      null, // pBufferMemoryBarriers
      1, // imageMemoryBarrierCount
      ptr(getInstanceBuffer(barrier)),
    );

    // Update texture layout
    texture.currentLayout = newLayout;
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
