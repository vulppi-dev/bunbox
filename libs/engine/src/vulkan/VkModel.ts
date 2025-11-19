import type { Disposable } from '@bunbox/utils';
import { VK_DEBUG } from '../singleton/logger';
import type { VkCommandBuffer } from './VkCommandBuffer';
import type { VkGeometry } from './VkGeometry';

/**
 * Wrapper for model rendering with Vulkan
 * Binds geometry buffers and executes draw commands
 */
export class VkModel implements Disposable {
  private __geometry: VkGeometry;

  constructor(geometry: VkGeometry) {
    this.__geometry = geometry;
    VK_DEBUG(`VkModel created with geometry`);
  }

  get geometry(): VkGeometry {
    return this.__geometry;
  }

  /**
   * Bind vertex and index buffers to command buffer
   */
  bind(commandBuffer: VkCommandBuffer): void {
    VK_DEBUG('Binding VkModel vertex buffers to command buffer');

    const buffers = [];
    let binding = 0;

    // Bind vertex buffer (binding 0)
    if (this.__geometry.vertexBuffer) {
      buffers.push(this.__geometry.vertexBuffer);
      VK_DEBUG(`Binding vertex buffer at binding ${binding}`);
      binding++;
    }

    // Bind normal buffer (binding 1)
    if (this.__geometry.normalBuffer) {
      buffers.push(this.__geometry.normalBuffer);
      VK_DEBUG(`Binding normal buffer at binding ${binding}`);
      binding++;
    }

    // Bind UV buffers (bindings 2+)
    for (let i = 0; i < this.__geometry.uvBuffers.length; i++) {
      buffers.push(this.__geometry.uvBuffers[i]!);
      VK_DEBUG(`Binding UV buffer ${i} at binding ${binding}`);
      binding++;
    }

    // Bind all vertex attribute buffers at once
    if (buffers.length > 0) {
      commandBuffer.bindVertexBuffers(0, buffers);
    }

    // Bind index buffer if present
    if (this.__geometry.indexBuffer) {
      VK_DEBUG('Binding index buffer');
      commandBuffer.bindIndexBuffer(this.__geometry.indexBuffer);
    }

    VK_DEBUG('VkModel buffers bound');
  }

  /**
   * Execute draw commands based on geometry data
   */
  draw(commandBuffer: VkCommandBuffer, instanceCount: number = 1): void {
    const indexCount = this.__geometry.indexCount;
    const vertexCount = this.__geometry.vertexCount;

    if (indexCount > 0) {
      VK_DEBUG(`Drawing indexed model: ${indexCount} indices`);
      commandBuffer.drawIndexed(indexCount, instanceCount);
    } else if (vertexCount > 0) {
      VK_DEBUG(`Drawing model: ${vertexCount} vertices`);
      commandBuffer.draw(vertexCount, instanceCount);
    } else {
      VK_DEBUG('Warning: VkModel has no geometry data to draw');
    }
  }

  dispose(): void {
    VK_DEBUG('Disposing VkModel (geometry managed externally)');
    // VkModel doesn't own the geometry, so no cleanup needed
  }
}
