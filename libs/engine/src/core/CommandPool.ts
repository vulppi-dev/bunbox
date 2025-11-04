import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  VK,
  Vk_CommandPoolCreateFlagBits,
  Vk_Result,
  Vk_StructureType,
  VkCommandPoolCreateInfo,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';

export class CommandPool implements Disposable {
  #vkLogicalDevice: Pointer;
  #commandPool: Pointer | null = null;
  #queueFamilyIndex: number;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(vkLogicalDevice: Pointer, queueFamilyIndex: number = 0) {
    this.#vkLogicalDevice = vkLogicalDevice;
    this.#queueFamilyIndex = queueFamilyIndex;
    this.#ptr_aux = new BigUint64Array(1);

    this.#createCommandPool();
  }

  get pool(): Pointer {
    if (!this.#commandPool) {
      throw new DynamicLibError('Command pool not created', 'Vulkan');
    }
    return this.#commandPool;
  }

  dispose(): void | Promise<void> {
    this.#destroyCommandPool();
  }

  #createCommandPool(): void {
    VK_DEBUG('Creating command pool');

    const createInfo = instantiate(VkCommandPoolCreateInfo);
    createInfo.sType = Vk_StructureType.COMMAND_POOL_CREATE_INFO;
    createInfo.flags = Vk_CommandPoolCreateFlagBits.RESET_COMMAND_BUFFER_BIT;
    createInfo.queueFamilyIndex = this.#queueFamilyIndex;

    const result = VK.vkCreateCommandPool(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create command pool. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#commandPool = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Command pool created: 0x${this.#commandPool.toString(16)}`);
  }

  #destroyCommandPool(): void {
    if (!this.#commandPool) {
      return;
    }

    VK_DEBUG(`Destroying command pool: 0x${this.#commandPool.toString(16)}`);
    VK.vkDestroyCommandPool(this.#vkLogicalDevice, this.#commandPool, null);
    this.#commandPool = null;
    VK_DEBUG('Command pool destroyed');
  }
}
