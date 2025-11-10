import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import type { VkImageView } from './VkImageView';
import {
  getResultMessage,
  VK,
  vkFramebufferCreateInfo,
  VkResult,
  VkStructureType,
} from '@bunbox/vk';

export class VkFramebuffer implements Disposable {
  #device: Pointer;
  #renderPass: Pointer;
  #attachments: VkImageView[];
  #width: number;
  #height: number;
  #instance: Pointer | null = null;

  #pointerHolder: BigUint64Array;

  constructor(
    device: Pointer,
    renderPass: Pointer,
    attachments: VkImageView[],
    width: number,
    height: number,
  ) {
    if (attachments.length === 0) {
      throw new DynamicLibError(
        'Framebuffer must have at least one attachment',
        'Vulkan',
      );
    }

    this.#device = device;
    this.#renderPass = renderPass;
    this.#attachments = attachments;
    this.#width = width;
    this.#height = height;

    this.#pointerHolder = new BigUint64Array(1);
    this.#createFramebuffer();
  }

  get framebuffer(): Pointer {
    if (this.#instance === null) {
      throw new DynamicLibError(
        'Framebuffer has not been created yet',
        'Vulkan',
      );
    }
    return this.#instance;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  dispose(): void | Promise<void> {
    if (!this.#instance) return;

    VK_DEBUG(`Destroying framebuffer: 0x${this.#instance.toString(16)}`);
    VK.vkDestroyFramebuffer(this.#device, this.#instance, null);
    VK_DEBUG('Framebuffer destroyed');
    this.#instance = null;
  }

  /**
   * Recreate framebuffer with new dimensions
   */
  rebuild(width: number, height: number): void {
    VK_DEBUG(`Rebuilding framebuffer: ${width}x${height}`);

    // Destroy old framebuffer
    this.dispose();

    // Update dimensions
    this.#width = width;
    this.#height = height;

    // Create new framebuffer
    this.#createFramebuffer();
  }

  #createFramebuffer(): void {
    VK_DEBUG(
      `Creating framebuffer: ${this.#width}x${this.#height}, ${this.#attachments.length} attachments`,
    );

    // Collect image view handles
    const attachmentViews = new BigUint64Array(
      this.#attachments.map((tex) => BigInt(tex.instance)),
    );

    const createInfo = instantiate(vkFramebufferCreateInfo);
    createInfo.sType = VkStructureType.FRAMEBUFFER_CREATE_INFO;
    createInfo.renderPass = BigInt(this.#renderPass as number);
    createInfo.attachmentCount = this.#attachments.length;
    createInfo.pAttachments = BigInt(ptr(attachmentViews));
    createInfo.width = this.#width;
    createInfo.height = this.#height;
    createInfo.layers = 1;

    const result = VK.vkCreateFramebuffer(
      this.#device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#instance = Number(this.#pointerHolder[0]) as Pointer;
    this.#pointerHolder[0] = 0n;
    VK_DEBUG(`Framebuffer created: 0x${this.#instance.toString(16)}`);
  }
}
