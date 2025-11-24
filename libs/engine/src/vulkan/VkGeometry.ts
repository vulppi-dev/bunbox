import type { Disposable } from '@bunbox/utils';
import { VkIndexType } from '@bunbox/vk';
import { type Pointer } from 'bun:ffi';
import { Geometry, type GeometryCustomAttribute } from '../resources/Geometry';
import { VK_DEBUG } from '../singleton/logger';
import { VkBuffer, type BufferUsage } from './VkBuffer';

const TYPE_BYTE_SIZE: Record<GeometryCustomAttribute['type'], number> = {
  float32: 4,
  uint8: 1,
  uint16: 2,
  uint32: 4,
  int8: 1,
  int16: 2,
  int32: 4,
};

type AttributeBuffer = {
  name: string;
  buffer: VkBuffer;
  byteStride: number;
  byteOffset: number;
};

type IndexBufferInfo = {
  buffer: VkBuffer;
  indexType: number;
  byteOffset: number;
};

export class VkGeometry implements Disposable {
  private __geometry: Geometry;
  private __device: Pointer | null = null;
  private __physicalDevice: Pointer | null = null;
  private __attributeBuffers = new Map<string, AttributeBuffer>();
  private __indexBuffer: IndexBufferInfo | null = null;

  constructor(geometry: Geometry) {
    this.__geometry = geometry;
  }

  prepare(device: Pointer, physicalDevice: Pointer): void {
    if (this.__attributeBuffers.size > 0) return;
    this.__device = device;
    this.__physicalDevice = physicalDevice;

    this.__createAttributeBuffer(
      'position',
      this.__geometry.vertex,
      'float32',
      3,
      'vertex',
    );
    this.__createAttributeBuffer(
      'normal',
      this.__geometry.normal,
      'float32',
      3,
      'vertex',
    );

    const uvs = this.__geometry.uvs;
    for (let i = 0; i < uvs.length; i++) {
      this.__createAttributeBuffer(
        `uv${i}`,
        uvs[i]!,
        'float32',
        2,
        'vertex',
      );
    }

    for (const attr of this.__geometry.customAttributes) {
      this.__createAttributeBuffer(
        attr.name,
        attr.data,
        attr.type,
        attr.components,
        'vertex',
      );
    }

    if (this.__geometry.indexCount > 0) {
      this.__createIndexBuffer(this.__geometry.indices);
    }

    this.__geometry.markAsClean();
    VK_DEBUG('VkGeometry prepared GPU buffers');
  }

  update(): void {
    if (!this.__geometry.isDirty) return;
    if (!this.__device || !this.__physicalDevice) return;

    for (const [name, view] of this.__attributeBuffers) {
      const source = this.__getAttributeSource(name);
      if (source) {
        view.buffer.upload(source);
      }
    }

    if (this.__indexBuffer) {
      this.__indexBuffer.buffer.upload(this.__geometry.indices);
    }

    this.__geometry.markAsClean();
  }

  getAttributeBuffer(
    name: string,
  ):
    | {
        buffer: Pointer;
        byteStride: number;
        byteOffset: number;
        vkBuffer: VkBuffer;
      }
    | null {
    const attr = this.__attributeBuffers.get(name);
    if (!attr) return null;
    return {
      buffer: attr.buffer.instance,
      byteStride: attr.byteStride,
      byteOffset: attr.byteOffset,
      vkBuffer: attr.buffer,
    };
  }

  getIndexBuffer():
    | {
        buffer: Pointer;
        indexType: number;
        byteOffset: number;
        vkBuffer: VkBuffer;
      }
    | null {
    if (!this.__indexBuffer) return null;
    return {
      buffer: this.__indexBuffer.buffer.instance,
      indexType: this.__indexBuffer.indexType,
      byteOffset: this.__indexBuffer.byteOffset,
      vkBuffer: this.__indexBuffer.buffer,
    };
  }

  release(): void {
    for (const buffer of this.__attributeBuffers.values()) {
      buffer.buffer.dispose();
    }
    this.__attributeBuffers.clear();

    if (this.__indexBuffer) {
      this.__indexBuffer.buffer.dispose();
      this.__indexBuffer = null;
    }

    this.__device = null;
    this.__physicalDevice = null;
  }

  dispose(): void {
    this.release();
  }

  private __createAttributeBuffer(
    name: string,
    data: ArrayBufferView,
    type: GeometryCustomAttribute['type'],
    components: number,
    usage: BufferUsage,
  ): void {
    if (data.byteLength === 0) return;
    const stride = this.__calculateStride(type, components);
    const buffer = new VkBuffer(
      this.__device!,
      this.__physicalDevice!,
      data.byteLength,
      usage,
      data,
    );
    this.__attributeBuffers.set(name, {
      name,
      buffer,
      byteStride: stride,
      byteOffset: 0,
    });
  }

  private __createIndexBuffer(data: ArrayBufferView): void {
    const buffer = new VkBuffer(
      this.__device!,
      this.__physicalDevice!,
      data.byteLength,
      'index',
      data,
    );
    const indexType =
      data instanceof Uint16Array ? VkIndexType.UINT16 : VkIndexType.UINT32;
    this.__indexBuffer = {
      buffer,
      indexType,
      byteOffset: 0,
    };
  }

  private __calculateStride(
    type: GeometryCustomAttribute['type'],
    components: number,
  ): number {
    const size = TYPE_BYTE_SIZE[type] ?? 4;
    return size * components;
  }

  private __getAttributeSource(name: string): ArrayBufferView | null {
    if (name === 'position') return this.__geometry.vertex;
    if (name === 'normal') return this.__geometry.normal;
    if (name.startsWith('uv')) {
      const idx = Number(name.slice(2));
      return Number.isFinite(idx) ? (this.__geometry.uvs[idx] ?? null) : null;
    }
    if (this.__geometry.hasCustomAttribute(name)) {
      return this.__geometry.getCustomAttributeData(name);
    }
    return null;
  }
}
