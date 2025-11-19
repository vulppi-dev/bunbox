import type { Disposable } from '@bunbox/utils';
import type { Pointer } from 'bun:ffi';
import type { Geometry } from '../resources/Geometry';
import { VK_DEBUG } from '../singleton/logger';
import { VkBuffer } from './VkBuffer';

/**
 * Vulkan geometry wrapper
 * Manages GPU buffers for vertex data, indices, and UV coordinates
 */
export class VkGeometry implements Disposable {
  private __device: Pointer;
  private __physicalDevice: Pointer;
  private __geometry: Geometry;

  private __vertexBuffer: VkBuffer | null = null;
  private __normalBuffer: VkBuffer | null = null;
  private __indexBuffer: VkBuffer | null = null;
  private __uvBuffers: VkBuffer[] = [];

  private __isDirty: boolean = true;

  constructor(device: Pointer, physicalDevice: Pointer, geometry: Geometry) {
    this.__device = device;
    this.__physicalDevice = physicalDevice;
    this.__geometry = geometry;

    VK_DEBUG(
      `Creating VkGeometry: ${geometry.vertexCount} vertices, ${geometry.indexCount} indices, ${geometry.uvLayerCount} UV layers`,
    );

    this.__createBuffers();
  }

  get vertexBuffer(): VkBuffer | null {
    return this.__vertexBuffer;
  }

  get normalBuffer(): VkBuffer | null {
    return this.__normalBuffer;
  }

  get indexBuffer(): VkBuffer | null {
    return this.__indexBuffer;
  }

  get uvBuffers(): readonly VkBuffer[] {
    return this.__uvBuffers;
  }

  get geometry(): Geometry {
    return this.__geometry;
  }

  get vertexCount(): number {
    return this.__geometry.vertexCount;
  }

  get indexCount(): number {
    return this.__geometry.indexCount;
  }

  /**
   * Update GPU buffers if geometry data has changed
   */
  update(): void {
    if (!this.__geometry.isDirty && !this.__isDirty) {
      return;
    }

    VK_DEBUG('Updating VkGeometry buffers');

    // Upload vertex data
    if (this.__vertexBuffer) {
      this.__vertexBuffer.upload(this.__geometry.vertex);
    }

    // Upload normal data
    if (this.__normalBuffer) {
      this.__normalBuffer.upload(this.__geometry.normal);
    }

    // Upload index data
    if (this.__indexBuffer) {
      this.__indexBuffer.upload(this.__geometry.indices);
    }

    // Upload UV data
    const uvs = this.__geometry.uvs;
    for (let i = 0; i < uvs.length; i++) {
      const uvBuffer = this.__uvBuffers[i];
      const uvData = uvs[i];
      if (uvBuffer && uvData) {
        uvBuffer.upload(uvData);
      }
    }

    this.__geometry.markAsClean();
    this.__isDirty = false;

    VK_DEBUG('VkGeometry buffers updated');
  }

  /**
   * Rebuild buffers if geometry structure changed
   */
  rebuild(): void {
    VK_DEBUG('Rebuilding VkGeometry buffers');

    this.__releaseBuffers();
    this.__createBuffers();
    this.__isDirty = true;
    this.update();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing VkGeometry');
    this.__releaseBuffers();
  }

  private __createBuffers(): void {
    const vertexCount = this.__geometry.vertexCount;
    const indexCount = this.__geometry.indexCount;
    const uvLayerCount = this.__geometry.uvLayerCount;

    // Create vertex buffer (3 floats per vertex: x, y, z)
    if (vertexCount > 0) {
      const vertexSize = vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
      this.__vertexBuffer = new VkBuffer(
        this.__device,
        this.__physicalDevice,
        vertexSize,
        'vertex',
      );
      VK_DEBUG(`Created vertex buffer: ${vertexSize} bytes`);
    }

    // Create normal buffer (3 floats per vertex: x, y, z)
    if (vertexCount > 0) {
      const normalSize = vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
      this.__normalBuffer = new VkBuffer(
        this.__device,
        this.__physicalDevice,
        normalSize,
        'vertex',
      );
      VK_DEBUG(`Created normal buffer: ${normalSize} bytes`);
    }

    // Create index buffer
    if (indexCount > 0) {
      const indexSize = indexCount * Uint32Array.BYTES_PER_ELEMENT;
      this.__indexBuffer = new VkBuffer(
        this.__device,
        this.__physicalDevice,
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
          this.__device,
          this.__physicalDevice,
          uvSize,
          'vertex',
        );
        this.__uvBuffers.push(uvBuffer);
        VK_DEBUG(`Created UV buffer ${i}: ${uvSize} bytes`);
      }
    }
  }

  private __releaseBuffers(): void {
    this.__vertexBuffer?.dispose();
    this.__vertexBuffer = null;

    this.__normalBuffer?.dispose();
    this.__normalBuffer = null;

    this.__indexBuffer?.dispose();
    this.__indexBuffer = null;

    this.__uvBuffers.forEach((buffer) => buffer.dispose());
    this.__uvBuffers = [];
  }
}
