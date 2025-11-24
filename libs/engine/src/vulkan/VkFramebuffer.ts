import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { RenderError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import type { VkImageView } from './VkImageView';
import {
  getResultMessage,
  VK,
  vkFramebufferCreateInfo,
  VkResult,
  VkStructureType,
} from '@bunbox/vk';

export class VkFramebuffer implements Disposable {
  private __device: Pointer;
  private __renderPass: Pointer;
  private __attachments: VkImageView[];
  private __width: number;
  private __height: number;
  private __instance: Pointer | null = null;

  private __pointerHolder: BigUint64Array;

  constructor(
    device: Pointer,
    renderPass: Pointer,
    attachments: VkImageView[],
    width: number,
    height: number,
  ) {
    if (attachments.length === 0) {
      throw new RenderError(
        'Framebuffer must have at least one attachment',
        'Vulkan',
      );
    }

    this.__device = device;
    this.__renderPass = renderPass;
    this.__attachments = attachments;
    this.__width = width;
    this.__height = height;

    this.__pointerHolder = new BigUint64Array(1);
    this.__createFramebuffer();
  }

  get instance(): Pointer {
    if (this.__instance === null) {
      throw new RenderError('Framebuffer has not been created yet', 'Vulkan');
    }
    return this.__instance;
  }

  get width(): number {
    return this.__width;
  }

  get height(): number {
    return this.__height;
  }

  dispose(): void | Promise<void> {
    if (!this.__instance) return;

    VK_DEBUG(`Destroying framebuffer: 0x${this.__instance.toString(16)}`);
    VK.vkDestroyFramebuffer(this.__device, this.__instance, null);
    VK_DEBUG('Framebuffer destroyed');
    this.__instance = null;
  }

  /**
   * Recreate framebuffer with new dimensions
   */
  rebuild(width: number, height: number): void {
    VK_DEBUG(`Rebuilding framebuffer: ${width}x${height}`);

    // Destroy old framebuffer
    this.dispose();

    // Update dimensions
    this.__width = width;
    this.__height = height;

    // Create new framebuffer
    this.__createFramebuffer();
  }

  private __createFramebuffer(): void {
    VK_DEBUG(
      `Creating framebuffer: ${this.__width}x${this.__height}, ${this.__attachments.length} attachments`,
    );

    // Collect image view handles
    const attachmentViews = new BigUint64Array(
      this.__attachments.map((tex) => BigInt(tex.instance)),
    );

    const createInfo = instantiate(vkFramebufferCreateInfo);
    createInfo.sType = VkStructureType.FRAMEBUFFER_CREATE_INFO;
    createInfo.renderPass = BigInt(this.__renderPass as number);
    createInfo.attachmentCount = this.__attachments.length;
    createInfo.pAttachments = BigInt(ptr(attachmentViews));
    createInfo.width = this.__width;
    createInfo.height = this.__height;
    createInfo.layers = 1;

    const result = VK.vkCreateFramebuffer(
      this.__device,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.__pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(result), 'Vulkan');
    }

    this.__instance = Number(this.__pointerHolder[0]) as Pointer;
    this.__pointerHolder[0] = 0n;
    VK_DEBUG(`Framebuffer created: 0x${this.__instance.toString(16)}`);
  }
}
