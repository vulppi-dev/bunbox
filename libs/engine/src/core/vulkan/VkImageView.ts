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

type VkImageViewMask = 'color' | 'depth' | 'stencil' | 'metadata';

type VkImageViewProps = {
  device: Pointer;
  image: Pointer;
  width: number;
  height: number;
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

  #instance: Pointer;

  constructor(props: VkImageViewProps) {
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

    this.#instance = Number(pointerHolder[0]!) as Pointer;
  }

  get instance() {
    return this.#instance;
  }

  dispose(): void | Promise<void> {}
}
