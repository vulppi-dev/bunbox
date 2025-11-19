import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkBorderColor,
  VkCompareOp,
  VkFilter,
  vkSamplerCreateInfo,
  VkSamplerAddressMode,
  VkSamplerMipmapMode,
  VkResult,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../errors';
import type {
  AddressMode,
  BorderColor,
  CompareFunction,
  FilterMode,
  MipmapFilter,
} from '../resources';
import { Sampler } from '../resources';
import { VK_DEBUG } from '../singleton/logger';

/**
 * Wrapper for Vulkan VkSampler
 * Creates GPU sampler objects for texture sampling
 */
export class VkSampler implements Disposable {
  private static __mapFilter(filter: FilterMode): number {
    switch (filter) {
      case 'nearest':
        return VkFilter.NEAREST;
      case 'linear':
        return VkFilter.LINEAR;
    }
  }

  private static __mapMipmapMode(mode: MipmapFilter): number {
    switch (mode) {
      case 'nearest':
        return VkSamplerMipmapMode.NEAREST;
      case 'linear':
        return VkSamplerMipmapMode.LINEAR;
    }
  }

  private static __mapAddressMode(mode: AddressMode): number {
    switch (mode) {
      case 'repeat':
        return VkSamplerAddressMode.REPEAT;
      case 'mirror-repeat':
        return VkSamplerAddressMode.MIRRORED_REPEAT;
      case 'clamp-to-edge':
        return VkSamplerAddressMode.CLAMP_TO_EDGE;
      case 'clamp-to-border':
        return VkSamplerAddressMode.CLAMP_TO_BORDER;
    }
  }

  private static __mapBorderColor(color: BorderColor): number {
    switch (color) {
      case 'transparent-black':
        return VkBorderColor.FLOAT_TRANSPARENT_BLACK;
      case 'opaque-black':
        return VkBorderColor.FLOAT_OPAQUE_BLACK;
      case 'opaque-white':
        return VkBorderColor.FLOAT_OPAQUE_WHITE;
    }
  }

  private static __mapCompareOp(compare: CompareFunction | null): number {
    if (compare === null) return 0;

    switch (compare) {
      case 'never':
        return VkCompareOp.NEVER;
      case 'less':
        return VkCompareOp.LESS;
      case 'less-equal':
        return VkCompareOp.LESS_OR_EQUAL;
      case 'greater':
        return VkCompareOp.GREATER;
      case 'greater-equal':
        return VkCompareOp.GREATER_OR_EQUAL;
      case 'equal':
        return VkCompareOp.EQUAL;
      case 'not-equal':
        return VkCompareOp.NOT_EQUAL;
      case 'always':
        return VkCompareOp.ALWAYS;
    }
  }

  private __device: Pointer;
  private __instance: bigint;

  constructor(device: Pointer, sampler: Sampler) {
    this.__device = device;

    VK_DEBUG(`Creating sampler: ${sampler.label || 'unnamed'}`);

    this.__instance = this.__createSampler(sampler);

    VK_DEBUG(`Sampler created: 0x${this.__instance.toString(16)}`);
  }

  get instance(): bigint {
    return this.__instance;
  }

  dispose(): void {
    VK_DEBUG(`Destroying sampler: 0x${this.__instance.toString(16)}`);
    VK.vkDestroySampler(this.__device, this.__instance, null);
    VK_DEBUG('Sampler destroyed');
  }

  private __createSampler(sampler: Sampler): bigint {
    const createInfo = instantiate(vkSamplerCreateInfo);
    createInfo.flags = 0;
    createInfo.magFilter = VkSampler.__mapFilter(sampler.magFilter);
    createInfo.minFilter = VkSampler.__mapFilter(sampler.minFilter);
    createInfo.mipmapMode = VkSampler.__mapMipmapMode(sampler.mipmapFilter);
    createInfo.addressModeU = VkSampler.__mapAddressMode(sampler.addressModeU);
    createInfo.addressModeV = VkSampler.__mapAddressMode(sampler.addressModeV);
    createInfo.addressModeW = VkSampler.__mapAddressMode(sampler.addressModeW);
    createInfo.mipLodBias = 0.0;
    createInfo.anisotropyEnable = sampler.maxAnisotropy > 1 ? 1 : 0;
    createInfo.maxAnisotropy = sampler.maxAnisotropy;
    createInfo.compareEnable = sampler.compare !== null ? 1 : 0;
    createInfo.compareOp = VkSampler.__mapCompareOp(sampler.compare);
    createInfo.minLod = sampler.lodMinClamp;
    createInfo.maxLod = sampler.lodMaxClamp;
    createInfo.borderColor = VkSampler.__mapBorderColor(sampler.borderColor);
    createInfo.unnormalizedCoordinates = sampler.normalizedCoordinates ? 0 : 1;

    const samplerHolder = new BigUint64Array(1);
    const result = VK.vkCreateSampler(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(samplerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    return samplerHolder[0]!;
  }
}
