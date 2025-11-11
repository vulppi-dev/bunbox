import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkImageAspectFlagBits,
  vkImageViewCreateInfo,
  VkImageViewType,
  VkResult,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

type VkImageViewMask = 'color' | 'depth' | 'stencil' | 'metadata';

type VkImageViewProps = {
  device: Pointer;
  image: Pointer;
  format: number;
  mask: VkImageViewMask[];
};

export class VkImageView implements Disposable {
  static getAspectMask(mask: VkImageViewMask[]): number {
    let aspectMask = 0;
    for (const m of mask) {
      switch (m) {
        case 'color':
          aspectMask |= VkImageAspectFlagBits.COLOR_BIT;
          break;
        case 'depth':
          aspectMask |= VkImageAspectFlagBits.DEPTH_BIT;
          break;
        case 'stencil':
          aspectMask |= VkImageAspectFlagBits.STENCIL_BIT;
          break;
        case 'metadata':
          aspectMask |= VkImageAspectFlagBits.METADATA_BIT;
          break;
      }
    }
    return aspectMask;
  }

  // MARK: Instance props

  private __device: Pointer;
  private __instance: Pointer;

  constructor(props: VkImageViewProps) {
    this.__device = props.device;

    VK_DEBUG(
      `Creating image view for image: 0x${props.image.toString(16)}, format: ${props.format}`,
    );

    const viewCreateInfo = instantiate(vkImageViewCreateInfo);
    viewCreateInfo.image = BigInt(props.image);
    viewCreateInfo.viewType = VkImageViewType.TYPE_2D;
    viewCreateInfo.format = props.format;

    viewCreateInfo.subresourceRange.aspectMask = VkImageView.getAspectMask(
      props.mask,
    );
    viewCreateInfo.subresourceRange.baseMipLevel = 0;
    viewCreateInfo.subresourceRange.levelCount = 1;
    viewCreateInfo.subresourceRange.baseArrayLayer = 0;
    viewCreateInfo.subresourceRange.layerCount = 1;

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateImageView(
      props.device,
      ptr(getInstanceBuffer(viewCreateInfo)),
      null,
      ptr(pointerHolder),
    );
    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__instance = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Image view created: 0x${this.__instance.toString(16)}`);
  }

  get instance() {
    return this.__instance;
  }

  dispose(): void | Promise<void> {
    VK_DEBUG(`Destroying image view: 0x${this.__instance.toString(16)}`);
    VK.vkDestroyImageView(this.__device, this.__instance, null);
    VK_DEBUG('Image view destroyed');
  }
}
