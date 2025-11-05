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
   */
  samples?: any;

  /**
   * Load operation at the start of the render pass
   */
  loadOp?: any;

  /**
   * Store operation at the end of the render pass
   */
  storeOp?: any;

  /**
   * Load operation for stencil (if depth/stencil format)
   */
  stencilLoadOp?: any;

  /**
   * Store operation for stencil (if depth/stencil format)
   */
  stencilStoreOp?: any;

  /**
   * Initial layout before render pass begins
   */
  initialLayout?: any;

  /**
   * Final layout after render pass ends
   */
  finalLayout?: any;

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
  layout: any;
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
   * @default any.GRAPHICS
   */
  pipelineBindPoint?: any;

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
  srcStageMask: number;

  /**
   * Destination pipeline stage mask
   */
  dstStageMask: number;

  /**
   * Source access mask
   */
  srcAccessMask: number;

  /**
   * Destination access mask
   */
  dstAccessMask: number;

  /**
   * Dependency flags
   * @default 0
   */
  dependencyFlags?: any;
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
