/**
 * Example: Using VkGeometry for rendering
 *
 * This file demonstrates how to use VkGeometry to render mesh data with Vulkan.
 */

import { Geometry } from '../../resources/Geometry';
import { VkGeometry } from './VkGeometry';
import { VkCommandBuffer } from './VkCommandBuffer';
import { Rect } from '../../math/Rect';
import { Color } from '../../math/Color';
import type { Pointer } from 'bun:ffi';

/**
 * Example: Creating and using VkGeometry
 */
export function exampleVkGeometryUsage(
  device: Pointer,
  physicalDevice: Pointer,
  commandBuffer: VkCommandBuffer,
  renderPass: Pointer,
  framebuffer: Pointer,
  pipeline: Pointer,
) {
  // 1. Create geometry data (CPU side)
  const geometry = new Geometry(4, 6, 1); // 4 vertices, 6 indices, 1 UV layer

  // Define a simple quad
  geometry.writeVertices([
    -1,
    -1,
    0, // vertex 0
    1,
    -1,
    0, // vertex 1
    1,
    1,
    0, // vertex 2
    -1,
    1,
    0, // vertex 3
  ]);

  geometry.writeNormals([
    0,
    0,
    1, // normal 0
    0,
    0,
    1, // normal 1
    0,
    0,
    1, // normal 2
    0,
    0,
    1, // normal 3
  ]);

  geometry.writeUVs(0, [
    0,
    0, // uv 0
    1,
    0, // uv 1
    1,
    1, // uv 2
    0,
    1, // uv 3
  ]);

  geometry.writeIndices([
    0,
    1,
    2, // triangle 1
    0,
    2,
    3, // triangle 2
  ]);

  // 2. Create VkGeometry (GPU buffers)
  const vkGeometry = new VkGeometry(device, physicalDevice, geometry);

  // 3. Upload data to GPU
  vkGeometry.update();

  // 4. Record rendering commands
  commandBuffer.begin();

  commandBuffer.beginRenderPass(
    renderPass,
    framebuffer,
    new Rect(0, 0, 800, 600),
    [new Color(0, 0, 0, 1)],
  );

  // Bind pipeline
  commandBuffer.bindPipeline(pipeline);

  // Set dynamic states
  commandBuffer.setViewport(0, 0, 800, 600);
  commandBuffer.setScissor(new Rect(0, 0, 800, 600));

  // Bind vertex buffers
  // Binding 0: positions
  // Binding 1: normals
  // Binding 2: UV layer 0 (if exists)
  const vertexBuffers = [];
  if (vkGeometry.vertexBuffer) vertexBuffers.push(vkGeometry.vertexBuffer);
  if (vkGeometry.normalBuffer) vertexBuffers.push(vkGeometry.normalBuffer);
  if (vkGeometry.uvBuffers.length > 0)
    vertexBuffers.push(vkGeometry.uvBuffers[0]!);

  commandBuffer.bindVertexBuffers(0, vertexBuffers);

  // Bind index buffer and draw
  if (vkGeometry.indexBuffer) {
    commandBuffer.bindIndexBuffer(vkGeometry.indexBuffer);
    commandBuffer.drawIndexed(vkGeometry.indexCount);
  } else {
    commandBuffer.draw(vkGeometry.vertexCount);
  }

  commandBuffer.endRenderPass();
  commandBuffer.end();

  // 5. Later, if geometry data changes:
  geometry.setVertex(0, -2, -2, 0);
  geometry.markAsDirty();

  // Update GPU buffers
  vkGeometry.update();

  // 6. Cleanup when done
  vkGeometry.dispose();
}

/**
 * Example: Managing multiple geometries
 */
export class GeometryManager {
  #device: Pointer;
  #physicalDevice: Pointer;
  #geometries = new Map<string, VkGeometry>();

  constructor(device: Pointer, physicalDevice: Pointer) {
    this.#device = device;
    this.#physicalDevice = physicalDevice;
  }

  /**
   * Get or create VkGeometry for a Geometry instance
   */
  getVkGeometry(id: string, geometry: Geometry): VkGeometry {
    let vkGeometry = this.#geometries.get(id);

    if (!vkGeometry) {
      vkGeometry = new VkGeometry(this.#device, this.#physicalDevice, geometry);
      this.#geometries.set(id, vkGeometry);
    }

    // Update if dirty
    vkGeometry.update();

    return vkGeometry;
  }

  /**
   * Update all dirty geometries
   */
  updateAll(): void {
    for (const vkGeometry of this.#geometries.values()) {
      vkGeometry.update();
    }
  }

  /**
   * Cleanup all geometries
   */
  dispose(): void {
    for (const vkGeometry of this.#geometries.values()) {
      vkGeometry.dispose();
    }
    this.#geometries.clear();
  }
}
