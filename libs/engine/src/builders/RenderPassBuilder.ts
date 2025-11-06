import type {
  AttachmentConfig,
  AttachmentReference,
  RenderPassConfig,
  SubpassConfig,
  SubpassDependency,
} from './RenderPassConfig';
import type { Format, SampleCount } from './RenderPassTypes';
import {
  hasStencilComponent,
  isColorFormat,
  isDepthFormat,
} from './RenderPassTypes';

/**
 * Agnostic builder for creating RenderPass configurations
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
 *   .addSubpass({
 *     colorAttachments: [{ attachment: 0, layout: 'color-attachment' }],
 *     depthStencilAttachment: { attachment: 1, layout: 'depth-stencil-attachment' }
 *   })
 *   .build();
 * ```
 */
export class RenderPassBuilder {
  #name?: string;
  #attachments: AttachmentConfig[] = [];
  #subpasses: SubpassConfig[] = [];
  #dependencies: SubpassDependency[] = [];

  /**
   * Set the name of the render pass (for debugging)
   */
  setName(name: string): this {
    this.#name = name;
    return this;
  }

  /**
   * Add a color attachment with sensible defaults
   */
  addColorAttachment(
    config: Partial<AttachmentConfig> & { format: Format },
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

    this.#validateAttachment(attachment);
    this.#attachments.push(attachment);
    return this;
  }

  /**
   * Add a depth or depth-stencil attachment with sensible defaults
   */
  addDepthAttachment(
    config: Partial<AttachmentConfig> & { format: Format },
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

    this.#validateAttachment(attachment);
    this.#attachments.push(attachment);
    return this;
  }

  /**
   * Add a generic attachment with full control
   */
  addAttachment(config: AttachmentConfig): this {
    this.#validateAttachment(config);
    this.#attachments.push(config);
    return this;
  }

  /**
   * Add a subpass configuration
   */
  addSubpass(config: SubpassConfig): this {
    this.#validateSubpass(config);
    this.#subpasses.push({
      pipelineBindPoint: 'graphics',
      ...config,
    });
    return this;
  }

  /**
   * Add a subpass dependency
   */
  addDependency(dependency: SubpassDependency): this {
    this.#validateDependency(dependency);
    this.#dependencies.push(dependency);
    return this;
  }

  /**
   * Create a default subpass that uses all attachments
   * Color attachments come first, depth attachment (if any) comes last
   */
  createDefaultSubpass(): this {
    const colorAttachments: AttachmentReference[] = [];
    let depthStencilAttachment: AttachmentReference | undefined;

    for (let i = 0; i < this.#attachments.length; i++) {
      const attachment = this.#attachments[i];
      if (!attachment) continue;

      if (isDepthFormat(attachment.format)) {
        depthStencilAttachment = {
          attachment: i,
          layout: 'depth-stencil-attachment',
        };
      } else if (
        isColorFormat(attachment.format) ||
        attachment.format === 'swapchain'
      ) {
        colorAttachments.push({
          attachment: i,
          layout: 'color-attachment',
        });
      }
    }

    return this.addSubpass({
      colorAttachments,
      depthStencilAttachment,
    });
  }

  /**
   * Helper: Add default external to subpass 0 dependency
   */
  addDefaultExternalDependency(): this {
    if (this.#subpasses.length === 0) {
      throw new Error('Cannot add external dependency: no subpasses defined');
    }

    return this.addDependency({
      srcSubpass: 'external',
      dstSubpass: 0,
      srcStageMask: 'color-attachment-output',
      dstStageMask: 'color-attachment-output',
      srcAccessMask: 'none',
      dstAccessMask: 'color-attachment-write',
    });
  }

  /**
   * Helper: Configure for multisampling
   */
  withMultisample(samples: SampleCount): this {
    for (const attachment of this.#attachments) {
      attachment.samples = samples;
    }
    return this;
  }

  /**
   * Build the final RenderPassConfig
   */
  build(): RenderPassConfig {
    if (this.#attachments.length === 0) {
      throw new Error('Cannot build RenderPass: no attachments defined');
    }

    // Create default subpass if none defined
    if (this.#subpasses.length === 0) {
      this.createDefaultSubpass();
    }

    // Validate all attachment references
    this.#validateAllReferences();

    return {
      attachments: [...this.#attachments],
      subpasses: this.#subpasses.length > 0 ? [...this.#subpasses] : undefined,
      dependencies:
        this.#dependencies.length > 0 ? [...this.#dependencies] : undefined,
      name: this.#name,
    };
  }

  // Validation methods

  #validateAttachment(attachment: AttachmentConfig): void {
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

  #validateSubpass(subpass: SubpassConfig): void {
    // Validate resolve attachments match color attachments
    if (subpass.resolveAttachments) {
      const colorCount = subpass.colorAttachments?.length ?? 0;
      if (subpass.resolveAttachments.length !== colorCount) {
        throw new Error(
          `Resolve attachments count (${subpass.resolveAttachments.length}) must match color attachments count (${colorCount})`,
        );
      }
    }

    // Validate attachment references
    const validateRef = (ref: AttachmentReference, name: string) => {
      if (ref.attachment < 0 || ref.attachment >= this.#attachments.length) {
        throw new Error(
          `Invalid ${name} attachment reference: ${ref.attachment} (valid range: 0-${this.#attachments.length - 1})`,
        );
      }
    };

    subpass.colorAttachments?.forEach((ref) => validateRef(ref, 'color'));
    if (subpass.depthStencilAttachment) {
      validateRef(subpass.depthStencilAttachment, 'depth-stencil');
    }
    subpass.inputAttachments?.forEach((ref) => validateRef(ref, 'input'));
    subpass.resolveAttachments?.forEach((ref) => validateRef(ref, 'resolve'));
  }

  #validateDependency(dependency: SubpassDependency): void {
    const maxSubpass = this.#subpasses.length - 1;

    // Validate subpass indices
    if (
      typeof dependency.srcSubpass === 'number' &&
      (dependency.srcSubpass < 0 || dependency.srcSubpass > maxSubpass)
    ) {
      throw new Error(
        `Invalid source subpass: ${dependency.srcSubpass} (valid range: 0-${maxSubpass} or 'external')`,
      );
    }

    if (
      typeof dependency.dstSubpass === 'number' &&
      (dependency.dstSubpass < 0 || dependency.dstSubpass > maxSubpass)
    ) {
      throw new Error(
        `Invalid destination subpass: ${dependency.dstSubpass} (valid range: 0-${maxSubpass} or 'external')`,
      );
    }

    // Validate dependency ordering (src must come before dst, unless external)
    if (
      typeof dependency.srcSubpass === 'number' &&
      typeof dependency.dstSubpass === 'number' &&
      dependency.srcSubpass > dependency.dstSubpass
    ) {
      throw new Error(
        `Source subpass (${dependency.srcSubpass}) cannot come after destination subpass (${dependency.dstSubpass})`,
      );
    }
  }

  #validateAllReferences(): void {
    // Ensure all attachment references point to valid attachments
    for (const subpass of this.#subpasses) {
      this.#validateSubpass(subpass);
    }
  }
}
