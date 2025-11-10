import type { Disposable } from '@bunbox/utils';
import type { Pointer } from 'bun:ffi';
import type { Geometry } from '../../resources/Geometry';
import { VK_DEBUG } from '../../singleton/logger';
import { VkBuffer } from './VkBuffer';

/**
 * Vulkan geometry wrapper
 * Manages GPU buffers for vertex data, indices, and UV coordinates
 */
export class VkGeometry implements Disposable {
  #device: Pointer;
  #physicalDevice: Pointer;
  #geometry: Geometry;

  #vertexBuffer: VkBuffer | null = null;
  #normalBuffer: VkBuffer | null = null;
  #indexBuffer: VkBuffer | null = null;
  #uvBuffers: VkBuffer[] = [];

  #isDirty: boolean = true;

  constructor(device: Pointer, physicalDevice: Pointer, geometry: Geometry) {
    this.#device = device;
    this.#physicalDevice = physicalDevice;
    this.#geometry = geometry;

    VK_DEBUG(
      `Creating VkGeometry: ${geometry.vertexCount} vertices, ${geometry.indexCount} indices, ${geometry.uvLayerCount} UV layers`,
    );

    this.#createBuffers();
  }

  get vertexBuffer(): VkBuffer | null {
    return this.#vertexBuffer;
  }

  get normalBuffer(): VkBuffer | null {
    return this.#normalBuffer;
  }

  get indexBuffer(): VkBuffer | null {
    return this.#indexBuffer;
  }

  get uvBuffers(): readonly VkBuffer[] {
    return this.#uvBuffers;
  }

  get geometry(): Geometry {
    return this.#geometry;
  }

  get vertexCount(): number {
    return this.#geometry.vertexCount;
  }

  get indexCount(): number {
    return this.#geometry.indexCount;
  }

  /**
   * Update GPU buffers if geometry data has changed
   */
  update(): void {
    if (!this.#geometry.isDirty && !this.#isDirty) {
      return;
    }

    VK_DEBUG('Updating VkGeometry buffers');

    // Upload vertex data
    if (this.#vertexBuffer) {
      this.#vertexBuffer.upload(this.#geometry.vertex);
    }

    // Upload normal data
    if (this.#normalBuffer) {
      this.#normalBuffer.upload(this.#geometry.normal);
    }

    // Upload index data
    if (this.#indexBuffer) {
      this.#indexBuffer.upload(this.#geometry.indices);
    }

    // Upload UV data
    const uvs = this.#geometry.uvs;
    for (let i = 0; i < uvs.length; i++) {
      const uvBuffer = this.#uvBuffers[i];
      const uvData = uvs[i];
      if (uvBuffer && uvData) {
        uvBuffer.upload(uvData);
      }
    }

    this.#geometry.markAsClean();
    this.#isDirty = false;

    VK_DEBUG('VkGeometry buffers updated');
  }

  /**
   * Rebuild buffers if geometry structure changed
   */
  rebuild(): void {
    VK_DEBUG('Rebuilding VkGeometry buffers');

    this.#releaseBuffers();
    this.#createBuffers();
    this.#isDirty = true;
    this.update();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing VkGeometry');
    this.#releaseBuffers();
  }

  #createBuffers(): void {
    const vertexCount = this.#geometry.vertexCount;
    const indexCount = this.#geometry.indexCount;
    const uvLayerCount = this.#geometry.uvLayerCount;

    // Create vertex buffer (3 floats per vertex: x, y, z)
    if (vertexCount > 0) {
      const vertexSize = vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
      this.#vertexBuffer = new VkBuffer(
        this.#device,
        this.#physicalDevice,
        vertexSize,
        'vertex',
      );
      VK_DEBUG(`Created vertex buffer: ${vertexSize} bytes`);
    }

    // Create normal buffer (3 floats per vertex: x, y, z)
    if (vertexCount > 0) {
      const normalSize = vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
      this.#normalBuffer = new VkBuffer(
        this.#device,
        this.#physicalDevice,
        normalSize,
        'vertex',
      );
      VK_DEBUG(`Created normal buffer: ${normalSize} bytes`);
    }

    // Create index buffer
    if (indexCount > 0) {
      const indexSize = indexCount * Uint32Array.BYTES_PER_ELEMENT;
      this.#indexBuffer = new VkBuffer(
        this.#device,
        this.#physicalDevice,
        indexSize,
        'index',
      );
      VK_DEBUG(`Created index buffer: ${indexSize} bytes`);
    }

    // Create UV buffers (2 floats per vertex: u, v)
    if (uvLayerCount > 0 && vertexCount > 0) {
      const uvSize = vertexCount * 2 * Float32Array.BYTES_PER_ELEMENT;
      for (let i = 0; i < uvLayerCount; i++) {
        const uvBuffer = new VkBuffer(
          this.#device,
          this.#physicalDevice,
          uvSize,
          'vertex',
        );
        this.#uvBuffers.push(uvBuffer);
        VK_DEBUG(`Created UV buffer ${i}: ${uvSize} bytes`);
      }
    }
  }

  #releaseBuffers(): void {
    this.#vertexBuffer?.dispose();
    this.#vertexBuffer = null;

    this.#normalBuffer?.dispose();
    this.#normalBuffer = null;

    this.#indexBuffer?.dispose();
    this.#indexBuffer = null;

    this.#uvBuffers.forEach((buffer) => buffer.dispose());
    this.#uvBuffers = [];
  }
}
