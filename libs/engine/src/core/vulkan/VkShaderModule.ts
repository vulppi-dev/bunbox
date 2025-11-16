import { isWgslValid, wgslToSpirvBin } from '@bunbox/naga';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkResult,
  vkShaderModuleCreateInfo,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

export class VkShaderModule implements Disposable {
  private __device: Pointer;
  private __module: Pointer | null = null;

  constructor(device: Pointer, shader: string) {
    this.__device = device;

    VK_DEBUG('Creating Shader module');

    if (!isWgslValid(shader)) {
      throw new DynamicLibError('Invalid WGSL shader', 'Vulkan');
    }
    const data = wgslToSpirvBin(shader);

    const createInfo = instantiate(vkShaderModuleCreateInfo);
    createInfo.codeSize = BigInt(data.byteLength);
    createInfo.pCode = BigInt(ptr(data));

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateShaderModule(
      device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.__module = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Shader module created: 0x${this.__module.toString(16)}`);
  }

  get instance(): Pointer {
    return this.__module!;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing Shader module');
    if (this.__module) {
      VK.vkDestroyShaderModule(this.__device, this.__module, null);
      this.__module = null;
    }
    VK_DEBUG('Shader module destroyed');
  }
}
