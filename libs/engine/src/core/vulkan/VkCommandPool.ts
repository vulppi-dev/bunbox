import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  getResultMessage,
  VK,
  VkCommandPoolCreateFlagBits,
  vkCommandPoolCreateInfo,
  VkResult,
  VkStructureType,
} from '@bunbox/vk';

export class VkCommandPool implements Disposable {
  #vkLogicalDevice: Pointer;
  #commandPool: Pointer;
  #queueFamilyIndex: number;

  constructor(vkLogicalDevice: Pointer, queueFamilyIndex: number = 0) {
    this.#vkLogicalDevice = vkLogicalDevice;
    this.#queueFamilyIndex = queueFamilyIndex;
    const pointerHolder = new BigUint64Array(1);

    VK_DEBUG('Creating command pool');

    const createInfo = instantiate(vkCommandPoolCreateInfo);
    createInfo.sType = VkStructureType.COMMAND_POOL_CREATE_INFO;
    createInfo.flags =
      VkCommandPoolCreateFlagBits.TRANSIENT_BIT |
      VkCommandPoolCreateFlagBits.RESET_COMMAND_BUFFER_BIT;
    createInfo.queueFamilyIndex = this.#queueFamilyIndex;

    const result = VK.vkCreateCommandPool(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#commandPool = Number(pointerHolder[0]) as Pointer;
    VK_DEBUG(`Command pool created: 0x${this.#commandPool.toString(16)}`);
  }

  get pool(): Pointer {
    if (!this.#commandPool) {
      throw new DynamicLibError('Command pool not created', 'Vulkan');
    }
    return this.#commandPool;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying command pool: 0x${this.#commandPool.toString(16)}`);
    VK.vkDestroyCommandPool(this.#vkLogicalDevice, this.#commandPool, null);
  }
}
