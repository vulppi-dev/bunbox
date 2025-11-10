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
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

export type BufferUsage = 'vertex' | 'index' | 'uniform' | 'staging';

/**
 * Wrapper for Vulkan VkBuffer
 * Manages GPU buffer allocation, memory binding, and data transfer
 */
export class VkBuffer implements Disposable {
  #device: Pointer;
  #physicalDevice: Pointer;
  #instance: Pointer;
  #memory: Pointer;
  #size: bigint;
  #usage: BufferUsage;

  constructor(
    device: Pointer,
    physicalDevice: Pointer,
    size: number,
    usage: BufferUsage,
    data?: ArrayBufferView,
  ) {
    this.#device = device;
    this.#physicalDevice = physicalDevice;
    this.#size = BigInt(size);
    this.#usage = usage;

    VK_DEBUG(`Creating ${usage} buffer of size ${size} bytes`);

    this.#instance = this.#createBuffer(size, usage);
    this.#memory = this.#allocateMemory();

    VK_DEBUG(`Buffer created: 0x${this.#instance.toString(16)}`);

    if (data) {
      this.upload(data);
    }
  }

  get instance(): Pointer {
    return this.#instance;
  }

  get memory(): Pointer {
    return this.#memory;
  }

  get size(): bigint {
    return this.#size;
  }

  get usage(): BufferUsage {
    return this.#usage;
  }

  /**
   * Upload data to the buffer
   */
  upload(data: ArrayBufferView): void {
    VK_DEBUG(`Uploading ${data.byteLength} bytes to ${this.#usage} buffer`);

    const dataPointer = new BigUint64Array(1);
    const result = VK.vkMapMemory(
      this.#device,
      this.#memory,
      0n,
      this.#size,
      0,
      ptr(dataPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
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
    const copySize = Math.min(sourceBuffer.byteLength, Number(this.#size));
    const destBuffer = new Uint8Array(
      // @ts-expect-error - Bun FFI allows creating typed array from pointer
      Buffer.from(mappedMemory, Number(this.#size)),
    );
    destBuffer.set(sourceBuffer.subarray(0, copySize));

    VK.vkUnmapMemory(this.#device, this.#memory);

    VK_DEBUG('Upload complete');
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(
      `Destroying ${this.#usage} buffer: 0x${this.#instance.toString(16)}`,
    );

    if (this.#memory) {
      VK.vkFreeMemory(this.#device, this.#memory, null);
    }

    if (this.#instance) {
      VK.vkDestroyBuffer(this.#device, this.#instance, null);
    }

    VK_DEBUG('Buffer destroyed');
  }

  #createBuffer(size: number, usage: BufferUsage): Pointer {
    const createInfo = instantiate(vkBufferCreateInfo);
    createInfo.size = BigInt(size);
    createInfo.usage = this.#getUsageFlags(usage);
    createInfo.sharingMode = VkSharingMode.EXCLUSIVE;
    createInfo.queueFamilyIndexCount = 0;
    createInfo.pQueueFamilyIndices = 0n;
    createInfo.flags = 0;

    const bufferPointer = new BigUint64Array(1);
    const result = VK.vkCreateBuffer(
      this.#device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(bufferPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return Number(bufferPointer[0]!) as Pointer;
  }

  #allocateMemory(): Pointer {
    const memRequirements = instantiate(vkMemoryRequirements);
    VK.vkGetBufferMemoryRequirements(
      this.#device,
      this.#instance,
      ptr(getInstanceBuffer(memRequirements)),
    );

    const allocInfo = instantiate(vkMemoryAllocateInfo);
    allocInfo.allocationSize = memRequirements.size;
    allocInfo.memoryTypeIndex = this.#findMemoryType(
      memRequirements.memoryTypeBits,
      VkMemoryPropertyFlagBits.HOST_VISIBLE_BIT |
        VkMemoryPropertyFlagBits.HOST_COHERENT_BIT,
    );

    const memoryPointer = new BigUint64Array(1);
    const result = VK.vkAllocateMemory(
      this.#device,
      ptr(getInstanceBuffer(allocInfo)),
      null,
      ptr(memoryPointer),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    const memory = Number(memoryPointer[0]!) as Pointer;

    // Bind buffer to memory
    const bindResult = VK.vkBindBufferMemory(
      this.#device,
      this.#instance,
      memory,
      0n,
    );

    if (bindResult !== VkResult.SUCCESS) {
      VK.vkFreeMemory(this.#device, memory, null);
      throw new DynamicLibError(getResultMessage(bindResult), 'Vulkan');
    }

    return memory;
  }

  #findMemoryType(typeFilter: number, properties: number): number {
    const memProperties = instantiate(vkPhysicalDeviceMemoryProperties);
    VK.vkGetPhysicalDeviceMemoryProperties(
      this.#physicalDevice,
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

    throw new DynamicLibError(
      'Failed to find suitable memory type for buffer',
      'Vulkan',
    );
  }

  #getUsageFlags(usage: BufferUsage): number {
    switch (usage) {
      case 'vertex':
        return VkBufferUsageFlagBits.VERTEX_BUFFER_BIT;
      case 'index':
        return VkBufferUsageFlagBits.INDEX_BUFFER_BIT;
      case 'uniform':
        return VkBufferUsageFlagBits.UNIFORM_BUFFER_BIT;
      case 'staging':
        return VkBufferUsageFlagBits.TRANSFER_SRC_BIT;
      default:
        return VkBufferUsageFlagBits.VERTEX_BUFFER_BIT;
    }
  }
}
