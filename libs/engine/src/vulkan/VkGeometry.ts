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
  private __customAttributeBuffers: Map<string, VkBuffer> = new Map();

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

  get customAttributeBuffers(): ReadonlyMap<string, VkBuffer> {
    return this.__customAttributeBuffers;
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
    if (this.__needsRebuild()) {
      this.rebuild();
      return;
    }

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

    // Upload custom attributes
    for (const attr of this.__geometry.customAttributes) {
      const buffer = this.__customAttributeBuffers.get(attr.name);
      if (buffer) {
        buffer.upload(attr.data);
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

    // Create buffers for custom attributes
    for (const attr of this.__geometry.customAttributes) {
      if (attr.data.byteLength === 0) continue;
      const buffer = new VkBuffer(
        this.__device,
        this.__physicalDevice,
        attr.data.byteLength,
        'vertex',
      );
      this.__customAttributeBuffers.set(attr.name, buffer);
      VK_DEBUG(
        `Created custom attribute buffer "${attr.name}": ${attr.data.byteLength} bytes`,
      );
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

    this.__customAttributeBuffers.forEach((buffer) => buffer.dispose());
    this.__customAttributeBuffers.clear();
  }

  private __needsRebuild(): boolean {
    const vertexCount = this.__geometry.vertexCount;
    const indexCount = this.__geometry.indexCount;
    const uvLayerCount = this.__geometry.uvLayerCount;

    const expectedVertexSize =
      vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT;
    if (vertexCount === 0) {
      if (this.__vertexBuffer || this.__normalBuffer) return true;
    } else {
      if (
        !this.__vertexBuffer ||
        this.__vertexBuffer.size !== BigInt(expectedVertexSize)
      )
        return true;
      if (
        !this.__normalBuffer ||
        this.__normalBuffer.size !== BigInt(expectedVertexSize)
      )
        return true;
    }

    const expectedIndexSize = indexCount * Uint32Array.BYTES_PER_ELEMENT;
    if (indexCount === 0) {
      if (this.__indexBuffer) return true;
    } else if (
      !this.__indexBuffer ||
      this.__indexBuffer.size !== BigInt(expectedIndexSize)
    ) {
      return true;
    }

    if (vertexCount === 0) {
      if (this.__uvBuffers.length !== 0) return true;
    } else {
      const expectedUVSize = vertexCount * 2 * Float32Array.BYTES_PER_ELEMENT;
      if (uvLayerCount !== this.__uvBuffers.length) return true;
      for (const buffer of this.__uvBuffers) {
        if (buffer.size !== BigInt(expectedUVSize)) return true;
      }
    }

    const customAttributes = this.__geometry.customAttributes.filter(
      (attr) => attr.data.byteLength > 0,
    );
    if (customAttributes.length !== this.__customAttributeBuffers.size)
      return true;
    for (const attr of customAttributes) {
      const buffer = this.__customAttributeBuffers.get(attr.name);
      if (!buffer || buffer.size !== BigInt(attr.data.byteLength)) return true;
    }

    return false;
  }
}
