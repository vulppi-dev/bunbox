import type {
  AccessMask,
  DependencyFlag,
  Format,
  ImageLayout,
  LoadOp,
  PipelineBindPoint,
  SampleCount,
  StageMask,
  StoreOp,
} from './RenderPassTypes';

/**
 * Attachment configuration for RenderPass
 * Defines how an image attachment behaves in the render pass
 */
export interface AttachmentConfig {
  /**
   * Format of the attachment
   * Can be swapchain format token or specific format
   */
  format: Format;

  /**
   * Number of samples for multisampling
   * @default 1
   */
  samples?: SampleCount;

  /**
   * Load operation at the start of the render pass
   * @default 'dont-care'
   */
  loadOp?: LoadOp;

  /**
   * Store operation at the end of the render pass
   * @default 'dont-care'
   */
  storeOp?: StoreOp;

  /**
   * Load operation for stencil (if depth/stencil format)
   * @default 'dont-care'
   */
  stencilLoadOp?: LoadOp;

  /**
   * Store operation for stencil (if depth/stencil format)
   * @default 'dont-care'
   */
  stencilStoreOp?: StoreOp;

  /**
   * Initial layout before render pass begins
   * @default 'undefined'
   */
  initialLayout?: ImageLayout;

  /**
   * Final layout after render pass ends
   * @default 'color-attachment' for color, 'depth-stencil-attachment' for depth
   */
  finalLayout?: ImageLayout;

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
  layout: ImageLayout;
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
   * @default 'graphics'
   */
  pipelineBindPoint?: PipelineBindPoint;

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
  srcStageMask: StageMask;

  /**
   * Destination pipeline stage mask
   */
  dstStageMask: StageMask;

  /**
   * Source access mask
   */
  srcAccessMask: AccessMask;

  /**
   * Destination access mask
   */
  dstAccessMask: AccessMask;

  /**
   * Dependency flags
   * @default undefined
   */
  dependencyFlags?: DependencyFlag | DependencyFlag[];
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
