import type {
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_ImageLayout,
  Vk_SampleCountFlagBits,
  Vk_PipelineBindPoint,
  Vk_PipelineStageFlagBits,
  Vk_AccessFlagBits,
  Vk_DependencyFlagBits,
} from '../dynamic-libs';

/**
 * Attachment configuration for RenderPass
 * Defines how an image attachment behaves in the render pass
 */
export interface AttachmentConfig {
  /**
   * Format of the attachment (VkFormat)
   * Can be swapchain format token or specific format
   */
  format: number | 'swapchain';

  /**
   * Number of samples for multisampling
   * @default Vk_SampleCountFlagBits.COUNT_1_BIT
   */
  samples?: Vk_SampleCountFlagBits;

  /**
   * Load operation at the start of the render pass
   * @default Vk_AttachmentLoadOp.CLEAR
   */
  loadOp?: Vk_AttachmentLoadOp;

  /**
   * Store operation at the end of the render pass
   * @default Vk_AttachmentStoreOp.STORE
   */
  storeOp?: Vk_AttachmentStoreOp;

  /**
   * Load operation for stencil (if depth/stencil format)
   * @default Vk_AttachmentLoadOp.DONT_CARE
   */
  stencilLoadOp?: Vk_AttachmentLoadOp;

  /**
   * Store operation for stencil (if depth/stencil format)
   * @default Vk_AttachmentStoreOp.DONT_CARE
   */
  stencilStoreOp?: Vk_AttachmentStoreOp;

  /**
   * Initial layout before render pass begins
   * @default Vk_ImageLayout.UNDEFINED
   */
  initialLayout?: Vk_ImageLayout;

  /**
   * Final layout after render pass ends
   * @default Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL or DEPTH_STENCIL_ATTACHMENT_OPTIMAL
   */
  finalLayout?: Vk_ImageLayout;

  /**
   * Optional clear value for this attachment
   */
  clearValue?: ClearValue;
}

/**
 * Clear value for attachments
 */
export type ClearValue =
  | { color: [number, number, number, number] }
  | { depthStencil: { depth: number; stencil?: number } };

/**
 * Attachment reference in a subpass
 */
export interface AttachmentReference {
  /**
   * Index of the attachment in the attachments array
   */
  attachment: number;

  /**
   * Layout the attachment will be in during the subpass
   */
  layout: Vk_ImageLayout;
}

/**
 * Preserve attachment reference (attachment not used in subpass but must be preserved)
 */
export type PreserveAttachment = number;

/**
 * Subpass configuration
 */
export interface SubpassConfig {
  /**
   * Pipeline bind point
   * @default Vk_PipelineBindPoint.GRAPHICS
   */
  pipelineBindPoint?: Vk_PipelineBindPoint;

  /**
   * Color attachments for this subpass
   */
  colorAttachments?: AttachmentReference[];

  /**
   * Depth/stencil attachment for this subpass
   */
  depthStencilAttachment?: AttachmentReference;

  /**
   * Input attachments (read from previous subpass)
   */
  inputAttachments?: AttachmentReference[];

  /**
   * Resolve attachments (for MSAA resolve)
   * Must match colorAttachments length if provided
   */
  resolveAttachments?: AttachmentReference[];

  /**
   * Preserve attachments (not used but must be preserved)
   */
  preserveAttachments?: PreserveAttachment[];
}

/**
 * Subpass dependency configuration
 */
export interface SubpassDependency {
  /**
   * Source subpass index (VK_SUBPASS_EXTERNAL for external)
   */
  srcSubpass: number | 'external';

  /**
   * Destination subpass index (VK_SUBPASS_EXTERNAL for external)
   */
  dstSubpass: number | 'external';

  /**
   * Source pipeline stage mask
   */
  srcStageMask: Vk_PipelineStageFlagBits | number;

  /**
   * Destination pipeline stage mask
   */
  dstStageMask: Vk_PipelineStageFlagBits | number;

  /**
   * Source access mask
   */
  srcAccessMask: Vk_AccessFlagBits | number;

  /**
   * Destination access mask
   */
  dstAccessMask: Vk_AccessFlagBits | number;

  /**
   * Dependency flags
   * @default 0
   */
  dependencyFlags?: Vk_DependencyFlagBits;
}

/**
 * Complete render pass configuration
 */
export interface RenderPassConfig {
  /**
   * Attachments for this render pass
   */
  attachments: AttachmentConfig[];

  /**
   * Subpasses for this render pass
   * @default Single graphics subpass with all color attachments
   */
  subpasses?: SubpassConfig[];

  /**
   * Subpass dependencies
   */
  dependencies?: SubpassDependency[];

  /**
   * Name for debugging purposes
   */
  name?: string;
}

/**
 * VK_SUBPASS_EXTERNAL constant
 */
export const SUBPASS_EXTERNAL = 0xffffffff;
