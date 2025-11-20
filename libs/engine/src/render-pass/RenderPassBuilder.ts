import type { TextureFormat, SampleCount } from '../resources';
import type { AttachmentConfig, RenderPassConfig } from './RenderPassConfig';
import {
  hasStencilComponent,
  isDepthFormat,
} from '../builders/RenderPassUtils';

/**
 * Agnostic builder for creating RenderPass configurations
 *
 * Creates render passes with a single pass for maximum cross-API compatibility.
 * Each render pass represents a single rendering operation with its attachments.
 *
 * ## Cross-API Compatibility Strategy:
 * - ✅ Single pass per render pass → Works on ALL backends
 * - No subpasses → Full compatibility with D3D12, WebGPU, Metal, Vulkan
 *
 * ## Architecture Pattern:
 * ```
 * Scene Pass (RenderPass 1)
 *   ↓
 * Bright Pass (RenderPass 2)
 *   ↓
 * Blur Pass (RenderPass 3)
 *   ↓
 * Composite (RenderPass 4)
 * ```
 *
 * @example
 * ```typescript
 * const config = new RenderPassBuilder()
 *   .setName('Forward Rendering')
 *   .addColorAttachment({
 *     format: 'swapchain',
 *     loadOp: 'clear',
 *     storeOp: 'store',
 *     finalLayout: 'present-src'
 *   })
 *   .addDepthAttachment({
 *     format: 'd32-sfloat',
 *     loadOp: 'clear',
 *     storeOp: 'dont-care',
 *   })
 *   .build();
 * ```
 */
export class RenderPassBuilder {
  private __name?: string;
  private __attachments: AttachmentConfig[] = [];

  /**
   * Set the name of the render pass (for debugging)
   */
  setName(name: string): this {
    this.__name = name;
    return this;
  }

  /**
   * Add a color attachment with sensible defaults
   */
  addColorAttachment(
    config: Partial<AttachmentConfig> & { format: TextureFormat | 'swapchain' },
  ): this {
    const attachment: AttachmentConfig = {
      samples: 1,
      loadOp: 'clear',
      storeOp: 'store',
      stencilLoadOp: 'dont-care',
      stencilStoreOp: 'dont-care',
      initialLayout: 'undefined',
      finalLayout:
        config.format === 'swapchain' ? 'present-src' : 'color-attachment',
      ...config,
    };

    this.__validateAttachment(attachment);
    this.__attachments.push(attachment);
    return this;
  }

  /**
   * Add a depth or depth-stencil attachment with sensible defaults
   */
  addDepthAttachment(
    config: Partial<AttachmentConfig> & { format: TextureFormat },
  ): this {
    if (!isDepthFormat(config.format)) {
      throw new Error(`Format '${config.format}' is not a depth format`);
    }

    const attachment: AttachmentConfig = {
      samples: 1,
      loadOp: 'clear',
      storeOp: 'dont-care',
      stencilLoadOp: hasStencilComponent(config.format) ? 'clear' : 'dont-care',
      stencilStoreOp: 'dont-care',
      initialLayout: 'undefined',
      finalLayout: 'depth-stencil-attachment',
      ...config,
    };

    this.__validateAttachment(attachment);
    this.__attachments.push(attachment);
    return this;
  }

  /**
   * Add a generic attachment with full control
   */
  addAttachment(config: AttachmentConfig): this {
    this.__validateAttachment(config);
    this.__attachments.push(config);
    return this;
  }

  /**
   * Helper: Configure for multisampling
   */
  withMultisample(samples: SampleCount): this {
    for (const attachment of this.__attachments) {
      attachment.samples = samples;
    }
    return this;
  }

  /**
   * Build the final RenderPassConfig
   */
  build(): RenderPassConfig {
    if (this.__attachments.length === 0) {
      throw new Error('Cannot build RenderPass: no attachments defined');
    }

    return {
      attachments: [...this.__attachments],
      name: this.__name,
    };
  }

  // Validation methods

  private __validateAttachment(attachment: AttachmentConfig): void {
    if (!attachment.format) {
      throw new Error('Attachment format is required');
    }

    if (
      attachment.samples &&
      ![1, 2, 4, 8, 16, 32, 64].includes(attachment.samples)
    ) {
      throw new Error(`Invalid sample count: ${attachment.samples}`);
    }

    // Validate clear value matches attachment type
    if (attachment.clearValue) {
      if ('color' in attachment.clearValue) {
        if (isDepthFormat(attachment.format)) {
          throw new Error('Cannot use color clear value for depth format');
        }
      } else if ('depthStencil' in attachment.clearValue) {
        if (!isDepthFormat(attachment.format)) {
          throw new Error(
            'Cannot use depth/stencil clear value for color format',
          );
        }
      }
    }
  }
}
