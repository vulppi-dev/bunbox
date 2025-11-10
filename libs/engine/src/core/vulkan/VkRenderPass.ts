import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkAttachmentLoadOp,
  VkAttachmentStoreOp,
  vkAttachmentDescription,
  VkFormat,
  VkImageLayout,
  vkRenderPassCreateInfo,
  VkResult,
  VkSampleCountFlagBits,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import type { RenderPassConfig } from '../../builders/RenderPassConfig';
import type {
  Format,
  ImageLayout,
  LoadOp,
  SampleCount,
  StoreOp,
} from '../../builders/RenderPassTypes';
import { isDepthFormat } from '../../builders/RenderPassTypes';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';

/**
 * Wrapper for Vulkan RenderPass
 * Simplifies render pass creation using agnostic configuration
 */
export class VkRenderPass implements Disposable {
  static #mapFormat(format: Format, swapchainFormat: number): number {
    if (format === 'swapchain') {
      return swapchainFormat;
    }

    const formatMap: Record<Exclude<Format, 'swapchain'>, number> = {
      'r8-unorm': VkFormat.R8_UNORM,
      'r8g8-unorm': VkFormat.R8G8_UNORM,
      'r8g8b8-unorm': VkFormat.R8G8B8_UNORM,
      'r8g8b8a8-unorm': VkFormat.R8G8B8A8_UNORM,
      'b8g8r8a8-unorm': VkFormat.B8G8R8A8_UNORM,
      'r8-snorm': VkFormat.R8_SNORM,
      'r8g8-snorm': VkFormat.R8G8_SNORM,
      'r8g8b8a8-snorm': VkFormat.R8G8B8A8_SNORM,
      'r16-unorm': VkFormat.R16_UNORM,
      'r16-sfloat': VkFormat.R16_SFLOAT,
      'r16g16-unorm': VkFormat.R16G16_UNORM,
      'r16g16-sfloat': VkFormat.R16G16_SFLOAT,
      'r16g16b16a16-unorm': VkFormat.R16G16B16A16_UNORM,
      'r16g16b16a16-sfloat': VkFormat.R16G16B16A16_SFLOAT,
      'r32-uint': VkFormat.R32_UINT,
      'r32-sint': VkFormat.R32_SINT,
      'r32-sfloat': VkFormat.R32_SFLOAT,
      'r32g32-sfloat': VkFormat.R32G32_SFLOAT,
      'r32g32b32-sfloat': VkFormat.R32G32B32_SFLOAT,
      'r32g32b32a32-sfloat': VkFormat.R32G32B32A32_SFLOAT,
      'd16-unorm': VkFormat.D16_UNORM,
      'd32-sfloat': VkFormat.D32_SFLOAT,
      'd16-unorm-s8-uint': VkFormat.D16_UNORM_S8_UINT,
      'd24-unorm-s8-uint': VkFormat.D24_UNORM_S8_UINT,
      'd32-sfloat-s8-uint': VkFormat.D32_SFLOAT_S8_UINT,
      'r8g8b8a8-srgb': VkFormat.R8G8B8A8_SRGB,
      'b8g8r8a8-srgb': VkFormat.B8G8R8A8_SRGB,
    };

    return formatMap[format];
  }

  static #mapSampleCount(samples: SampleCount): number {
    const sampleMap: Record<SampleCount, number> = {
      1: VkSampleCountFlagBits.COUNT_1_BIT,
      2: VkSampleCountFlagBits.COUNT_2_BIT,
      4: VkSampleCountFlagBits.COUNT_4_BIT,
      8: VkSampleCountFlagBits.COUNT_8_BIT,
      16: VkSampleCountFlagBits.COUNT_16_BIT,
      32: VkSampleCountFlagBits.COUNT_32_BIT,
      64: VkSampleCountFlagBits.COUNT_64_BIT,
    };

    return sampleMap[samples];
  }

  static #mapLoadOp(loadOp: LoadOp): number {
    const loadOpMap: Record<LoadOp, number> = {
      load: VkAttachmentLoadOp.LOAD,
      clear: VkAttachmentLoadOp.CLEAR,
      'dont-care': VkAttachmentLoadOp.DONT_CARE,
    };

    return loadOpMap[loadOp];
  }

  static #mapStoreOp(storeOp: StoreOp): number {
    const storeOpMap: Record<StoreOp, number> = {
      store: VkAttachmentStoreOp.STORE,
      'dont-care': VkAttachmentStoreOp.DONT_CARE,
    };

    return storeOpMap[storeOp];
  }

  static #mapImageLayout(layout: ImageLayout): number {
    const layoutMap: Record<ImageLayout, number> = {
      undefined: VkImageLayout.UNDEFINED,
      general: VkImageLayout.GENERAL,
      'color-attachment': VkImageLayout.COLOR_ATTACHMENT_OPTIMAL,
      'depth-stencil-attachment':
        VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
      'depth-stencil-read-only': VkImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL,
      'shader-read-only': VkImageLayout.SHADER_READ_ONLY_OPTIMAL,
      'transfer-src': VkImageLayout.TRANSFER_SRC_OPTIMAL,
      'transfer-dst': VkImageLayout.TRANSFER_DST_OPTIMAL,
      'present-src': VkImageLayout.COLOR_ATTACHMENT_OPTIMAL,
      'depth-read-only-stencil-attachment':
        VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
      'depth-attachment-stencil-read-only':
        VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
    };

    return layoutMap[layout];
  }

  #device: Pointer;
  #renderPass: Pointer | null = null;
  #config: RenderPassConfig;
  #swapchainFormat: number;

  #pointerHolder: BigUint64Array;

  constructor(
    device: Pointer,
    config: RenderPassConfig,
    swapchainFormat: number,
  ) {
    this.#device = device;
    this.#config = config;
    this.#swapchainFormat = swapchainFormat;

    this.#pointerHolder = new BigUint64Array(1);
    this.#createRenderPass();

    VK_DEBUG(
      `RenderPass created: 0x${this.#renderPass!.toString(16)} ${config.name ? `(${config.name})` : ''}`,
    );
  }

  get instance(): Pointer {
    if (this.#renderPass === null) {
      throw new DynamicLibError(
        'RenderPass has not been created yet',
        'Vulkan',
      );
    }
    return this.#renderPass;
  }

  dispose(): void | Promise<void> {
    if (!this.#renderPass) return;

    VK_DEBUG(`Destroying renderPass: 0x${this.#renderPass.toString(16)}`);
    VK.vkDestroyRenderPass(this.#device, this.#renderPass, null);
    VK_DEBUG('RenderPass destroyed');
    this.#renderPass = null;
  }

  #createRenderPass(): void {
    const { attachments } = this.#config;

    if (attachments.length === 0) {
      throw new DynamicLibError(
        'RenderPass must have at least one attachment',
        'Vulkan',
      );
    }

    const attachmentDescSize = sizeOf(vkAttachmentDescription);
    const attachmentDescBuffer = new Uint8Array(
      attachments.length * attachmentDescSize,
    );

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]!;
      const isDepth = isDepthFormat(attachment.format);

      const attachmentDesc = instantiate(
        vkAttachmentDescription,
        attachmentDescBuffer,
        i,
      );
      attachmentDesc.flags = 0;
      attachmentDesc.format = VkRenderPass.#mapFormat(
        attachment.format,
        this.#swapchainFormat,
      );
      attachmentDesc.samples = VkRenderPass.#mapSampleCount(
        attachment.samples ?? 1,
      );
      attachmentDesc.loadOp = VkRenderPass.#mapLoadOp(
        attachment.loadOp ?? 'dont-care',
      );
      attachmentDesc.storeOp = VkRenderPass.#mapStoreOp(
        attachment.storeOp ?? 'dont-care',
      );
      attachmentDesc.stencilLoadOp = VkRenderPass.#mapLoadOp(
        attachment.stencilLoadOp ?? 'dont-care',
      );
      attachmentDesc.stencilStoreOp = VkRenderPass.#mapStoreOp(
        attachment.stencilStoreOp ?? 'dont-care',
      );
      attachmentDesc.initialLayout = VkRenderPass.#mapImageLayout(
        attachment.initialLayout ?? 'undefined',
      );

      if (attachment.finalLayout) {
        attachmentDesc.finalLayout = VkRenderPass.#mapImageLayout(
          attachment.finalLayout,
        );
      } else {
        attachmentDesc.finalLayout = VkRenderPass.#mapImageLayout(
          isDepth ? 'depth-stencil-attachment' : 'color-attachment',
        );
      }
    }

    const renderPassCreateInfo = instantiate(vkRenderPassCreateInfo);
    renderPassCreateInfo.flags = 0;
    renderPassCreateInfo.attachmentCount = attachments.length;
    renderPassCreateInfo.pAttachments = BigInt(ptr(attachmentDescBuffer));
    renderPassCreateInfo.subpassCount = 0;
    renderPassCreateInfo.pSubpasses = 0n;
    renderPassCreateInfo.dependencyCount = 0;
    renderPassCreateInfo.pDependencies = 0n;

    VK_DEBUG(`Creating render pass with ${attachments.length} attachments`);
    const result = VK.vkCreateRenderPass(
      this.#device,
      ptr(getInstanceBuffer(renderPassCreateInfo)),
      null,
      ptr(this.#pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.#renderPass = Number(this.#pointerHolder[0]) as Pointer;
  }
}
