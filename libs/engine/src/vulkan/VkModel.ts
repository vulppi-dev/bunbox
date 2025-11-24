import type { Disposable } from '@bunbox/utils';
import { VK_DEBUG } from '../singleton/logger';
import type { VkCommandBuffer } from './VkCommandBuffer';
import type { VkBuffer } from './VkBuffer';
import type { VkGeometry } from './VkGeometry';
import type { VertexBindingLayout } from './VkGraphicsPipeline';

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
  bind(
    commandBuffer: VkCommandBuffer,
    bindingLayout: readonly VertexBindingLayout[],
  ): void {
    VK_DEBUG('Binding VkModel vertex buffers to command buffer');

    if (!bindingLayout || bindingLayout.length === 0) {
      throw new Error(
        'VkModel.bind requires a vertex binding layout from shader reflection.',
      );
    }

    const buffers = this.__bindFromLayout(bindingLayout);

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

  private __bindFromLayout(
    layout: readonly VertexBindingLayout[],
  ): VkBuffer[] {
    const buffers: VkBuffer[] = [];

    for (const binding of layout) {
      const buffer = this.__getBufferForLayout(binding);
      buffers.push(buffer);
    }

    return buffers;
  }

  private __getBufferForLayout(layout: VertexBindingLayout): VkBuffer {
    switch (layout.kind) {
      case 'position':
        if (!this.__geometry.vertexBuffer) {
          throw new Error('Geometry does not provide position buffer.');
        }
        return this.__geometry.vertexBuffer;
      case 'normal':
        if (!this.__geometry.normalBuffer) {
          throw new Error('Geometry does not provide normal buffer.');
        }
        return this.__geometry.normalBuffer;
      case 'uv': {
        const buffer = this.__geometry.uvBuffers[layout.uvIndex];
        if (!buffer) {
          throw new Error(
            `Geometry does not provide UV buffer for layer ${layout.uvIndex}.`,
          );
        }
        return buffer;
      }
      case 'custom': {
        const buffer = this.__geometry.customAttributeBuffers.get(layout.name);
        if (!buffer) {
          throw new Error(
            `Geometry does not provide custom attribute buffer '${layout.name}'.`,
          );
        }
        return buffer;
      }
      default:
        throw new Error(`Unknown vertex binding kind ${(layout as any).kind}`);
    }
  }
}
