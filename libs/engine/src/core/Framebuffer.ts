import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import {
  VK,
  Vk_Result,
  Vk_StructureType,
  VkFramebufferCreateInfo,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import type { VkTexture } from './VkTexture';

export class Framebuffer implements Disposable {
  #vkLogicalDevice: Pointer;
  #vkFramebuffer: Pointer | null = null;
  #renderPass: Pointer;
  #attachments: VkTexture[];
  #width: number;
  #height: number;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(
    vkLogicalDevice: Pointer,
    renderPass: Pointer,
    attachments: VkTexture[],
    width: number,
    height: number,
  ) {
    if (attachments.length === 0) {
      throw new DynamicLibError(
        'Framebuffer must have at least one attachment',
        'Vulkan',
      );
    }

    this.#vkLogicalDevice = vkLogicalDevice;
    this.#renderPass = renderPass;
    this.#attachments = attachments;
    this.#width = width;
    this.#height = height;
    this.#ptr_aux = new BigUint64Array(1);

    this.#createFramebuffer();
  }

  get framebuffer(): Pointer {
    if (!this.#vkFramebuffer) {
      throw new DynamicLibError('VkFramebuffer not created', 'Vulkan');
    }
    return this.#vkFramebuffer;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get attachments(): readonly VkTexture[] {
    return Object.freeze([...this.#attachments]);
  }

  dispose(): void | Promise<void> {
    if (!this.#vkFramebuffer) {
      return;
    }

    VK_DEBUG(`Destroying framebuffer: 0x${this.#vkFramebuffer.toString(16)}`);
    VK.vkDestroyFramebuffer(this.#vkLogicalDevice, this.#vkFramebuffer, null);
    this.#vkFramebuffer = null;
    VK_DEBUG('Framebuffer destroyed');
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
      this.#attachments.map((tex) => BigInt(tex.imageView as number)),
    );

    const createInfo = instantiate(VkFramebufferCreateInfo);
    createInfo.sType = Vk_StructureType.FRAMEBUFFER_CREATE_INFO;
    createInfo.renderPass = BigInt(this.#renderPass as number);
    createInfo.attachmentCount = this.#attachments.length;
    createInfo.pAttachments = BigInt(ptr(attachmentViews));
    createInfo.width = this.#width;
    createInfo.height = this.#height;
    createInfo.layers = 1;

    const result = VK.vkCreateFramebuffer(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(this.#ptr_aux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create framebuffer. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkFramebuffer = Number(this.#ptr_aux[0]) as Pointer;
    VK_DEBUG(`Framebuffer created: 0x${this.#vkFramebuffer.toString(16)}`);
  }
}
