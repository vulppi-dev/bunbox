import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  cstr,
  VK,
  Vk_Result,
  Vk_StructureType,
  VkDeviceCreateInfo,
  VkDeviceQueueCreateInfo,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import { getInstanceBuffer, instantiate, instanceToJSON } from '@bunbox/struct';

export class LogicalDevice implements Disposable {
  #vkPhysicalDevice: Pointer;
  #vkLogicalDevice: Pointer | null = null;
  #vkGraphicsQueue: Pointer | null = null;

  #ptr_aux: BigUint64Array;

  constructor(vkPhysicalDevice: Pointer, requiredExtensions: string[] = []) {
    this.#vkPhysicalDevice = vkPhysicalDevice;
    this.#ptr_aux = new BigUint64Array(1);

    this.#createLogicalDevice(requiredExtensions);
  }

  get device(): Pointer {
    if (!this.#vkLogicalDevice) {
      VK_DEBUG('ERROR: Attempted to access logical device before creation');
      throw new DynamicLibError('Logical device not created', 'Vulkan');
    }
    return this.#vkLogicalDevice;
  }

  get graphicsQueue(): Pointer {
    if (!this.#vkGraphicsQueue) {
      VK_DEBUG('ERROR: Attempted to access graphics queue before creation');
      throw new DynamicLibError('Graphics queue not obtained', 'Vulkan');
    }
    return this.#vkGraphicsQueue;
  }

  dispose(): void {
    if (!this.#vkLogicalDevice) {
      return;
    }

    VK_DEBUG('Disposing LogicalDevice resources');

    // Wait for device to finish before cleanup
    VK_DEBUG('Waiting for device to be idle...');
    VK.vkDeviceWaitIdle(this.#vkLogicalDevice);

    // Destroy logical device
    VK_DEBUG(
      `Destroying logical device: 0x${this.#vkLogicalDevice.toString(16)}`,
    );
    VK.vkDestroyDevice(this.#vkLogicalDevice, null);
    this.#vkLogicalDevice = null;
    this.#vkGraphicsQueue = null;

    VK_DEBUG('LogicalDevice resources disposed');
  }

  #createLogicalDevice(requiredExtensions: string[]): void {
    VK_DEBUG('Creating logical device');
    VK_DEBUG(`Physical device: 0x${this.#vkPhysicalDevice.toString(16)}`);

    // Create a simple device queue create info
    const queueCreateInfo = instantiate(VkDeviceQueueCreateInfo);
    queueCreateInfo.sType = Vk_StructureType.DEVICE_QUEUE_CREATE_INFO;
    queueCreateInfo.queueFamilyIndex = 0; // Using first queue family
    queueCreateInfo.queueCount = 1;
    queueCreateInfo.pQueuePriorities = BigInt(ptr(new Float32Array([1.0])));

    // Prepare extension pointers
    const extensionPointers = requiredExtensions.map((name) =>
      BigInt(ptr(cstr(name))),
    );
    const extensionPointersBuffer = new BigUint64Array(extensionPointers);

    // Create device create info
    const deviceCreateInfo = instantiate(VkDeviceCreateInfo);
    deviceCreateInfo.sType = Vk_StructureType.DEVICE_CREATE_INFO;
    deviceCreateInfo.queueCreateInfoCount = 1;
    deviceCreateInfo.pQueueCreateInfos = BigInt(
      ptr(getInstanceBuffer(queueCreateInfo)),
    );
    deviceCreateInfo.enabledExtensionCount = requiredExtensions.length;
    deviceCreateInfo.ppEnabledExtensionNames =
      requiredExtensions.length > 0 ? BigInt(ptr(extensionPointersBuffer)) : 0n;
    deviceCreateInfo.pEnabledFeatures = 0n;

    VK_DEBUG(
      `Device config: ${JSON.stringify(instanceToJSON(deviceCreateInfo))}`,
    );
    VK_DEBUG(`Required extensions: ${requiredExtensions.join(', ') || 'none'}`);

    // Create logical device
    VK_DEBUG('Calling vkCreateDevice...');
    const result = VK.vkCreateDevice(
      this.#vkPhysicalDevice,
      ptr(getInstanceBuffer(deviceCreateInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      VK_DEBUG(`ERROR: Failed to create logical device. VkResult: ${result}`);
      throw new DynamicLibError(
        `Failed to create logical device. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkLogicalDevice = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Logical device created: 0x${this.#vkLogicalDevice.toString(16)}`);

    // Get graphics queue
    VK_DEBUG('Getting graphics queue (family 0, queue 0)...');
    VK.vkGetDeviceQueue(
      this.#vkLogicalDevice,
      0, // queueFamilyIndex
      0, // queueIndex
      ptr(this.#ptr_aux),
    );
    this.#vkGraphicsQueue = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(
      `Graphics queue obtained: 0x${this.#vkGraphicsQueue.toString(16)}`,
    );
    VK_DEBUG('Logical device creation complete');
  }
}
