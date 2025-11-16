import { getInstanceBuffer, instantiate, sizeOf } from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
import {
  getResultMessage,
  VK,
  vkAttachmentDescription,
  vkAttachmentReference,
  VkImageLayout,
  VkPipelineBindPoint,
  vkRenderPassCreateInfo,
  VkResult,
  vkSubpassDescription,
} from '@bunbox/vk';
import { ptr, type Pointer } from 'bun:ffi';
import type { RenderPassConfig } from '../../builders/RenderPassConfig';
import { isDepthFormat } from '../../builders/RenderPassUtils';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import {
  mapImageLayoutToVk,
  mapLoadOpToVk,
  mapSampleCountToVk,
  mapStoreOpToVk,
  mapTextureFormatToVk,
} from './remap';

/**
 * Wrapper for Vulkan RenderPass
 * Simplifies render pass creation using agnostic configuration
 */
export class VkRenderPass implements Disposable {
  // MARK: Instance properties

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

  dispose(): void {
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

      const attachmentDesc = instantiate(vkAttachmentDescription);
      attachmentDesc.flags = 0;
      attachmentDesc.format =
        attachment.format === 'swapchain'
          ? this.__swapchainFormat
          : mapTextureFormatToVk(attachment.format);
      attachmentDesc.samples = mapSampleCountToVk(attachment.samples ?? 1);
      attachmentDesc.loadOp = mapLoadOpToVk(attachment.loadOp ?? 'dont-care');
      attachmentDesc.storeOp = mapStoreOpToVk(
        attachment.storeOp ?? 'dont-care',
      );
      attachmentDesc.stencilLoadOp = mapLoadOpToVk(
        attachment.stencilLoadOp ?? 'dont-care',
      );
      attachmentDesc.stencilStoreOp = mapStoreOpToVk(
        attachment.stencilStoreOp ?? 'dont-care',
      );
      attachmentDesc.initialLayout = mapImageLayoutToVk(
        attachment.initialLayout ?? 'undefined',
      );

      if (attachment.finalLayout) {
        attachmentDesc.finalLayout = mapImageLayoutToVk(attachment.finalLayout);
      } else {
        attachmentDesc.finalLayout = mapImageLayoutToVk(
          isDepth ? 'depth-stencil-attachment' : 'color-attachment',
        );
      }
      attachmentDescBuffer.set(
        new Uint8Array(getInstanceBuffer(attachmentDesc)),
        i * attachmentDescSize,
      );
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
      const ref = instantiate(vkAttachmentReference);
      ref.attachment = colorAttachmentRefs[i]!;
      ref.layout = VkImageLayout.COLOR_ATTACHMENT_OPTIMAL;
      colorRefsBuffer.set(
        new Uint8Array(getInstanceBuffer(ref)),
        i * colorRefSize,
      );
    }

    // Create depth attachment reference if exists
    let depthRefBuffer: Uint8Array | null = null;
    if (depthAttachmentRef !== null) {
      const depthRef = instantiate(vkAttachmentReference);
      depthRef.attachment = depthAttachmentRef;
      depthRef.layout = VkImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL;
      depthRefBuffer = new Uint8Array(getInstanceBuffer(depthRef));
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
