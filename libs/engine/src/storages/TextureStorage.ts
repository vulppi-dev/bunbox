import { type Pointer } from 'bun:ffi';
import { EngineError } from '../errors';
import type { TextureBase } from '../resources';
import { VkBuffer, VkCommandPool, VkDevice, VkImage } from '../vulkan';

interface TextureResource {
  buffer?: Uint8Array;
  stagingBuffer?: VkBuffer;
  vkImage?: VkImage;
}

export class TextureStorage {
  private __textures: Map<TextureBase, TextureResource> = new Map();

  register(texture: TextureBase): void {
    this.__ensureResource(texture);
  }

  setBuffer(texture: TextureBase, buffer: Uint8Array): void {
    const resource = this.__ensureResource(texture);
    resource.buffer = buffer;

    // Drop stale staging buffer to avoid uploading outdated data.
    if (resource.stagingBuffer) {
      resource.stagingBuffer.dispose();
      resource.stagingBuffer = undefined;
    }
  }

  getBuffer(texture: TextureBase): Uint8Array | undefined {
    return this.__textures.get(texture)?.buffer;
  }

  getVkImage(texture: TextureBase): VkImage | undefined {
    return this.__textures.get(texture)?.vkImage;
  }

  uploadToGpu(
    texture: TextureBase,
    device: VkDevice,
    commandPool: VkCommandPool,
    queue: Pointer,
  ): void {
    const resource = this.__ensureResource(texture);

    if (!resource.buffer) {
      throw new EngineError(
        'Cannot upload texture without a CPU buffer',
        'TextureStorage',
      );
    }

    resource.stagingBuffer?.dispose();
    resource.stagingBuffer = new VkBuffer(
      device.logicalDevice,
      device.physicalDevice,
      resource.buffer.byteLength,
      'staging',
      resource.buffer,
    );

    if (!resource.vkImage) {
      resource.vkImage = new VkImage(
        device.logicalDevice,
        device.physicalDevice,
        texture,
      );
    }

    // TODO: submit commands using commandPool/queue to copy staging buffer to the image.
    void commandPool;
    void queue;
  }

  downloadFromGpu(
    texture: TextureBase,
    device: VkDevice,
    commandPool: VkCommandPool,
    queue: Pointer,
  ): void {
    const resource = this.__textures.get(texture);

    if (!resource?.vkImage) {
      throw new EngineError(
        'Cannot download texture without a GPU image',
        'TextureStorage',
      );
    }

    // Placeholder for future read-back implementation.
    void device;
    void commandPool;
    void queue;
    throw new EngineError(
      'Download from GPU is not implemented yet',
      'TextureStorage',
    );
  }

  destroy(texture: TextureBase): void {
    const resource = this.__textures.get(texture);
    if (!resource) return;

    resource.vkImage?.dispose();
    resource.stagingBuffer?.dispose();
    this.__textures.delete(texture);
  }

  clear(): void {
    for (const resource of this.__textures.values()) {
      resource.vkImage?.dispose();
      resource.stagingBuffer?.dispose();
    }
    this.__textures.clear();
  }

  size(): number {
    return this.__textures.size;
  }

  private __ensureResource(texture: TextureBase): TextureResource {
    let resource = this.__textures.get(texture);
    if (!resource) {
      resource = {};
      this.__textures.set(texture, resource);
    }
    return resource;
  }
}
