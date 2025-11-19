import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { type Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkCommandPoolCreateFlagBits,
  vkCommandPoolCreateInfo,
  VkResult,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';

export class VkCommandPool implements Disposable {
  private __vkLogicalDevice: Pointer;
  private __commandPool: Pointer;
  private __queueFamilyIndex: number;

  constructor(vkLogicalDevice: Pointer, queueFamilyIndex: number = 0) {
    this.__vkLogicalDevice = vkLogicalDevice;
    this.__queueFamilyIndex = queueFamilyIndex;
    const pointerHolder = new BigUint64Array(1);

    VK_DEBUG('Creating command pool');

    const createInfo = instantiate(vkCommandPoolCreateInfo);
    createInfo.flags =
      VkCommandPoolCreateFlagBits.TRANSIENT_BIT |
      VkCommandPoolCreateFlagBits.RESET_COMMAND_BUFFER_BIT;
    createInfo.queueFamilyIndex = this.__queueFamilyIndex;

    const result = VK.vkCreateCommandPool(
      this.__vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__commandPool = Number(pointerHolder[0]) as Pointer;
    VK_DEBUG(`Command pool created: 0x${this.__commandPool.toString(16)}`);
  }

  get instance(): Pointer {
    if (!this.__commandPool) {
      throw new DynamicLibError('Command pool not created', 'Vulkan');
    }
    return this.__commandPool;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying command pool: 0x${this.__commandPool.toString(16)}`);
    VK.vkDestroyCommandPool(this.__vkLogicalDevice, this.__commandPool, null);
  }
}
