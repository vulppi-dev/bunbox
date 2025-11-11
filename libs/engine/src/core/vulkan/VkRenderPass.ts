import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  VkAttachmentLoadOp,
  VkAttachmentStoreOp,
  vkAttachmentDescription,
  vkAttachmentReference,
  VkFormat,
  VkImageLayout,
  VkPipelineBindPoint,
  vkRenderPassCreateInfo,
  VkResult,
  VkSampleCountFlagBits,
  vkSubpassDescription,
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
  private static __mapFormat(format: Format, swapchainFormat: number): number {
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

  private static __mapSampleCount(samples: SampleCount): number {
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

  private static __mapLoadOp(loadOp: LoadOp): number {
    const loadOpMap: Record<LoadOp, number> = {
      load: VkAttachmentLoadOp.LOAD,
      clear: VkAttachmentLoadOp.CLEAR,
      'dont-care': VkAttachmentLoadOp.DONT_CARE,
    };

    return loadOpMap[loadOp];
  }

  private static __mapStoreOp(storeOp: StoreOp): number {
    const storeOpMap: Record<StoreOp, number> = {
      store: VkAttachmentStoreOp.STORE,
      'dont-care': VkAttachmentStoreOp.DONT_CARE,
    };

    return storeOpMap[storeOp];
  }

  private static __mapImageLayout(layout: ImageLayout): number {
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
      'present-src': VkImageLayout.PRESENT_SRC_KHR,
      'depth-read-only-stencil-attachment':
        VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
      'depth-attachment-stencil-read-only':
        VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
    };

    return layoutMap[layout];
  }

  private __device: Pointer;
  private __renderPass: Pointer | null = null;
  private __config: RenderPassConfig;
  private __swapchainFormat: number;

  private __pointerHolder: BigUint64Array;

  constructor(
    device: Pointer,
    config: RenderPassConfig,
    swapchainFormat: number,
  ) {
    this.__device = device;
    this.__config = config;
    this.__swapchainFormat = swapchainFormat;

    this.__pointerHolder = new BigUint64Array(1);
    this.__createRenderPass();

    VK_DEBUG(
      `RenderPass created: 0x${this.__renderPass!.toString(16)} ${config.name ? `(${config.name})` : ''}`,
    );
  }

  get instance(): Pointer {
    if (this.__renderPass === null) {
      throw new DynamicLibError(
        'RenderPass has not been created yet',
        'Vulkan',
      );
    }
    return this.__renderPass;
  }

  get attachmentsCount(): number {
    return this.__config.attachments.length;
  }

  dispose(): void | Promise<void> {
    if (!this.__renderPass) return;

    VK_DEBUG(`Destroying renderPass: 0x${this.__renderPass.toString(16)}`);
    VK.vkDestroyRenderPass(this.__device, this.__renderPass, null);
    VK_DEBUG('RenderPass destroyed');
    this.__renderPass = null;
  }

  private __createRenderPass(): void {
    const { attachments } = this.__config;

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
      attachmentDesc.format = VkRenderPass.__mapFormat(
        attachment.format,
        this.__swapchainFormat,
      );
      attachmentDesc.samples = VkRenderPass.__mapSampleCount(
        attachment.samples ?? 1,
      );
      attachmentDesc.loadOp = VkRenderPass.__mapLoadOp(
        attachment.loadOp ?? 'dont-care',
      );
      attachmentDesc.storeOp = VkRenderPass.__mapStoreOp(
        attachment.storeOp ?? 'dont-care',
      );
      attachmentDesc.stencilLoadOp = VkRenderPass.__mapLoadOp(
        attachment.stencilLoadOp ?? 'dont-care',
      );
      attachmentDesc.stencilStoreOp = VkRenderPass.__mapStoreOp(
        attachment.stencilStoreOp ?? 'dont-care',
      );
      attachmentDesc.initialLayout = VkRenderPass.__mapImageLayout(
        attachment.initialLayout ?? 'undefined',
      );

      if (attachment.finalLayout) {
        attachmentDesc.finalLayout = VkRenderPass.__mapImageLayout(
          attachment.finalLayout,
        );
      } else {
        attachmentDesc.finalLayout = VkRenderPass.__mapImageLayout(
          isDepth ? 'depth-stencil-attachment' : 'color-attachment',
        );
      }
    }

    // Create attachment references for the subpass
    const colorAttachmentRefs: number[] = [];
    let depthAttachmentRef: number | null = null;

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]!;
      const isDepth = isDepthFormat(attachment.format);

      if (isDepth) {
        depthAttachmentRef = i;
      } else {
        colorAttachmentRefs.push(i);
      }
    }

    // Create attachment reference structs
    const colorRefSize = sizeOf(vkAttachmentReference);
    const colorRefsBuffer = new Uint8Array(
      colorAttachmentRefs.length * colorRefSize,
    );

    for (let i = 0; i < colorAttachmentRefs.length; i++) {
      const ref = instantiate(vkAttachmentReference, colorRefsBuffer, i);
      ref.attachment = colorAttachmentRefs[i]!;
      ref.layout = VkImageLayout.COLOR_ATTACHMENT_OPTIMAL;
    }

    // Create depth attachment reference if exists
    let depthRefBuffer: Uint8Array | null = null;
    if (depthAttachmentRef !== null) {
      depthRefBuffer = new Uint8Array(colorRefSize);
      const depthRef = instantiate(vkAttachmentReference, depthRefBuffer, 0);
      depthRef.attachment = depthAttachmentRef;
      depthRef.layout = VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
    }

    // Create subpass description
    const subpassDesc = instantiate(vkSubpassDescription);
    subpassDesc.flags = 0;
    subpassDesc.pipelineBindPoint = VkPipelineBindPoint.GRAPHICS;
    subpassDesc.inputAttachmentCount = 0;
    subpassDesc.pInputAttachments = 0n;
    subpassDesc.colorAttachmentCount = colorAttachmentRefs.length;
    subpassDesc.pColorAttachments =
      colorAttachmentRefs.length > 0 ? BigInt(ptr(colorRefsBuffer)) : 0n;
    subpassDesc.pResolveAttachments = 0n;
    subpassDesc.pDepthStencilAttachment =
      depthRefBuffer !== null ? BigInt(ptr(depthRefBuffer)) : 0n;
    subpassDesc.preserveAttachmentCount = 0;
    subpassDesc.pPreserveAttachments = 0n;

    const renderPassCreateInfo = instantiate(vkRenderPassCreateInfo);
    renderPassCreateInfo.flags = 0;
    renderPassCreateInfo.attachmentCount = attachments.length;
    renderPassCreateInfo.pAttachments = BigInt(ptr(attachmentDescBuffer));
    renderPassCreateInfo.subpassCount = 1;
    renderPassCreateInfo.pSubpasses = BigInt(
      ptr(getInstanceBuffer(subpassDesc)),
    );
    renderPassCreateInfo.dependencyCount = 0;
    renderPassCreateInfo.pDependencies = 0n;

    VK_DEBUG(`Creating render pass with ${attachments.length} attachments`);
    const result = VK.vkCreateRenderPass(
      this.__device,
      ptr(getInstanceBuffer(renderPassCreateInfo)),
      null,
      ptr(this.__pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    this.__renderPass = Number(this.__pointerHolder[0]) as Pointer;
  }
}
