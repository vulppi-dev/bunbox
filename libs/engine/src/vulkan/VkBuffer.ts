import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkBufferCreateInfo,
  VkBufferUsageFlagBits,
  vkMemoryAllocateInfo,
  vkMemoryRequirements,
  VkMemoryPropertyFlagBits,
  VkResult,
  VkSharingMode,
  vkPhysicalDeviceMemoryProperties,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { RenderError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';

export type BufferUsage = 'vertex' | 'index' | 'uniform' | 'staging' | 'storage';

/**
 * Wrapper for Vulkan VkBuffer
 * Manages GPU buffer allocation, memory binding, and data transfer
 */
export class VkBuffer implements Disposable {
  private __device: Pointer;
  private __physicalDevice: Pointer;
  private __instance: Pointer;
  private __memory: Pointer;
  private __size: bigint;
  private __usage: BufferUsage;

  constructor(
    device: Pointer,
    physicalDevice: Pointer,
    size: number,
    usage: BufferUsage,
    data?: ArrayBufferView,
  ) {
    this.__device = device;
    this.__physicalDevice = physicalDevice;
    this.__size = BigInt(size);
    this.__usage = usage;

    VK_DEBUG(`Creating ${usage} buffer of size ${size} bytes`);

    this.__instance = this.__createBuffer(size, usage);
    this.__memory = this.__allocateMemory();

    VK_DEBUG(`Buffer created: 0x${this.__instance.toString(16)}`);

    if (data) {
      this.upload(data);
    }
  }

  get instance(): Pointer {
    return this.__instance;
  }

  get memory(): Pointer {
    return this.__memory;
  }

  get size(): bigint {
    return this.__size;
  }

  get usage(): BufferUsage {
    return this.__usage;
  }

  /**
   * Upload data to the buffer
   */
  upload(data: ArrayBufferView): void {
    VK_DEBUG(`Uploading ${data.byteLength} bytes to ${this.__usage} buffer`);

    const dataPointer = new BigUint64Array(1);
    const result = VK.vkMapMemory(
      this.__device,
      this.__memory,
      0n,
      this.__size,
      0,
      ptr(dataPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    const mappedMemory = Number(dataPointer[0]!) as Pointer;

    // Copy data to mapped memory
    // Convert source data to Uint8Array for byte-level access
    const sourceBuffer = new Uint8Array(
      data.buffer,
      data.byteOffset,
      data.byteLength,
    );

    // Create a view of the mapped memory and copy
    const copySize = Math.min(sourceBuffer.byteLength, Number(this.__size));
    const destBuffer = new Uint8Array(
      // @ts-expect-error - Bun FFI allows creating typed array from pointer
      Buffer.from(mappedMemory, Number(this.__size)),
    );
    destBuffer.set(sourceBuffer.subarray(0, copySize));

    VK.vkUnmapMemory(this.__device, this.__memory);

    VK_DEBUG('Upload complete');
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(
      `Destroying ${this.__usage} buffer: 0x${this.__instance.toString(16)}`,
    );

    if (this.__memory) {
      VK.vkFreeMemory(this.__device, this.__memory, null);
    }

    if (this.__instance) {
      VK.vkDestroyBuffer(this.__device, this.__instance, null);
    }

    VK_DEBUG('Buffer destroyed');
  }

  private __createBuffer(size: number, usage: BufferUsage): Pointer {
    const createInfo = instantiate(vkBufferCreateInfo);
    createInfo.size = BigInt(size);
    createInfo.usage = this.__getUsageFlags(usage);
    createInfo.sharingMode = VkSharingMode.EXCLUSIVE;
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.flags = 0;

    const bufferPointer = new BigUint64Array(1);
    const result = VK.vkCreateBuffer(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(bufferPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    return Number(bufferPointer[0]!) as Pointer;
  }

  private __allocateMemory(): Pointer {
    const memRequirements = instantiate(vkMemoryRequirements);
    VK.vkGetBufferMemoryRequirements(
      this.__device,
      this.__instance,
      ptr(getInstanceBuffer(memRequirements)),
    );

    const allocInfo = instantiate(vkMemoryAllocateInfo);
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = this.__findMemoryType(
      memRequirements.memoryTypeBits,
      VkMemoryPropertyFlagBits.HOST_VISIBLE_BIT |
        VkMemoryPropertyFlagBits.HOST_COHERENT_BIT,
    );

    const memoryPointer = new BigUint64Array(1);
    const result = VK.vkAllocateMemory(
      this.__device,
      ptr(getInstanceBuffer(allocInfo)),
      null,
      ptr(memoryPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    const memory = Number(memoryPointer[0]!) as Pointer;

    // Bind buffer to memory
    const bindResult = VK.vkBindBufferMemory(
      this.__device,
      this.__instance,
      memory,
      0n,
    );

    if (bindResult !== VkResult.SUCCESS) {
      VK.vkFreeMemory(this.__device, memory, null);
      throw new RenderError(getResultMessage(bindResult), 'Vulkan');
    }

    return memory;
  }

  private __findMemoryType(typeFilter: number, properties: number): number {
    const memProperties = instantiate(vkPhysicalDeviceMemoryProperties);
    VK.vkGetPhysicalDeviceMemoryProperties(
      this.__physicalDevice,
      ptr(getInstanceBuffer(memProperties)),
    );

    for (let i = 0; i < memProperties.memoryTypeCount; i++) {
      const memType = memProperties.memoryTypes[i]!;
      if (
        (typeFilter & (1 << i)) !== 0 &&
        (memType.propertyFlags & properties) === properties
      ) {
        return i;
      }
    }

    throw new RenderError(
      'Failed to find suitable memory type for buffer',
      'Vulkan',
    );
  }

  private __getUsageFlags(usage: BufferUsage): number {
    switch (usage) {
      case 'vertex':
        return VkBufferUsageFlagBits.VERTEX_BUFFER_BIT;
      case 'index':
        return VkBufferUsageFlagBits.INDEX_BUFFER_BIT;
      case 'uniform':
        return VkBufferUsageFlagBits.UNIFORM_BUFFER_BIT;
      case 'staging':
        return VkBufferUsageFlagBits.TRANSFER_SRC_BIT;
      case 'storage':
        return VkBufferUsageFlagBits.STORAGE_BUFFER_BIT;
      default:
        return VkBufferUsageFlagBits.VERTEX_BUFFER_BIT;
    }
  }
}
