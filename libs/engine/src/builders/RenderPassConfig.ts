import type {
  ComponentFormat,
  ImageLayout,
  LoadOp,
  SampleCount,
  StoreOp,
} from '../resources';

/**
 * Attachment configuration for RenderPass
 * Defines how an image attachment behaves in the render pass
 */
export interface AttachmentConfig {
  /**
   * Format of the attachment
   * Can be swapchain format token or specific format
   */
  format: ComponentFormat;

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
 * Complete render pass configuration
 */
export interface RenderPassConfig {
  /**
   * Attachments for this render pass
   */
  attachments: AttachmentConfig[];

  /**
   * Name for debugging purposes
   */
  name?: string;
}
