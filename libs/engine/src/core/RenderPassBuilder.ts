import {
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_ImageLayout,
  Vk_SampleCountFlagBits,
  Vk_PipelineBindPoint,
  Vk_PipelineStageFlagBits,
  Vk_AccessFlagBits,
} from '../dynamic-libs';
import type {
  RenderPassConfig,
  AttachmentConfig,
  SubpassConfig,
  SubpassDependency,
  AttachmentReference,
} from './RenderPassConfig';
import { SUBPASS_EXTERNAL } from './RenderPassConfig';

/**
 * Fluent builder for creating RenderPass configurations
 *
 * @example
 * ```typescript
 * const config = new RenderPassBuilder()
 *   .addColorAttachment({
 *     format: 'swapchain',
 *     loadOp: Vk_AttachmentLoadOp.CLEAR,
 *     storeOp: Vk_AttachmentStoreOp.STORE,
 *     finalLayout: Vk_ImageLayout.PRESENT_SRC_KHR
 *   })
 *   .addDepthAttachment({
 *     format: Vk_Format.D32_SFLOAT,
 *     loadOp: Vk_AttachmentLoadOp.CLEAR,
 *     storeOp: Vk_AttachmentStoreOp.DONT_CARE
 *   })
 *   .addSubpass({
 *     colorAttachments: [{ attachment: 0, layout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL }],
 *     depthStencilAttachment: { attachment: 1, layout: Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL }
 *   })
 *   .build();
 * ```
 */
export class RenderPassBuilder {
  #attachments: AttachmentConfig[] = [];
  #subpasses: SubpassConfig[] = [];
  #dependencies: SubpassDependency[] = [];
  #name?: string;

  /**
   * Create attachment reference helper
   */
  static createAttachmentRef(
    attachment: number,
    layout: Vk_ImageLayout,
  ): AttachmentReference {
    return { attachment, layout };
  }

  /**
   * Set debug name for this render pass
   */
  setName(name: string): this {
    this.#name = name;
    return this;
  }

  /**
   * Add a color attachment
   */
  addColorAttachment(
    config: Partial<AttachmentConfig> & { format: number | 'swapchain' },
  ): this {
    this.#attachments.push({
      format: config.format,
      samples: config.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT,
      loadOp: config.loadOp ?? Vk_AttachmentLoadOp.CLEAR,
      storeOp: config.storeOp ?? Vk_AttachmentStoreOp.STORE,
      stencilLoadOp: config.stencilLoadOp ?? Vk_AttachmentLoadOp.DONT_CARE,
      stencilStoreOp: config.stencilStoreOp ?? Vk_AttachmentStoreOp.DONT_CARE,
      initialLayout: config.initialLayout ?? Vk_ImageLayout.UNDEFINED,
      finalLayout:
        config.finalLayout ?? Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
      clearValue: config.clearValue,
    });
    return this;
  }

  /**
   * Add a depth attachment
   */
  addDepthAttachment(
    config: Partial<AttachmentConfig> & { format: number },
  ): this {
    this.#attachments.push({
      format: config.format,
      samples: config.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT,
      loadOp: config.loadOp ?? Vk_AttachmentLoadOp.CLEAR,
      storeOp: config.storeOp ?? Vk_AttachmentStoreOp.STORE,
      stencilLoadOp: config.stencilLoadOp ?? Vk_AttachmentLoadOp.CLEAR,
      stencilStoreOp: config.stencilStoreOp ?? Vk_AttachmentStoreOp.DONT_CARE,
      initialLayout: config.initialLayout ?? Vk_ImageLayout.UNDEFINED,
      finalLayout:
        config.finalLayout ?? Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
      clearValue: config.clearValue ?? {
        depthStencil: { depth: 1.0, stencil: 0 },
      },
    });
    return this;
  }

  /**
   * Add a depth-stencil attachment
   */
  addDepthStencilAttachment(
    config: Partial<AttachmentConfig> & { format: number },
  ): this {
    this.#attachments.push({
      format: config.format,
      samples: config.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT,
      loadOp: config.loadOp ?? Vk_AttachmentLoadOp.CLEAR,
      storeOp: config.storeOp ?? Vk_AttachmentStoreOp.STORE,
      stencilLoadOp: config.stencilLoadOp ?? Vk_AttachmentLoadOp.CLEAR,
      stencilStoreOp: config.stencilStoreOp ?? Vk_AttachmentStoreOp.STORE,
      initialLayout: config.initialLayout ?? Vk_ImageLayout.UNDEFINED,
      finalLayout:
        config.finalLayout ?? Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
      clearValue: config.clearValue ?? {
        depthStencil: { depth: 1.0, stencil: 0 },
      },
    });
    return this;
  }

  /**
   * Add a generic attachment with full control
   */
  addAttachment(config: AttachmentConfig): this {
    this.#attachments.push(config);
    return this;
  }

  /**
   * Add a subpass
   */
  addSubpass(config: SubpassConfig): this {
    this.#subpasses.push({
      pipelineBindPoint:
        config.pipelineBindPoint ?? Vk_PipelineBindPoint.GRAPHICS,
      colorAttachments: config.colorAttachments,
      depthStencilAttachment: config.depthStencilAttachment,
      inputAttachments: config.inputAttachments,
      resolveAttachments: config.resolveAttachments,
      preserveAttachments: config.preserveAttachments,
    });
    return this;
  }

  /**
   * Add a subpass dependency
   */
  addDependency(dependency: SubpassDependency): this {
    this.#dependencies.push(dependency);
    return this;
  }

  /**
   * Add a default external dependency for the first subpass
   * Useful for simple render passes
   */
  addDefaultExternalDependency(): this {
    this.#dependencies.push({
      srcSubpass: 'external',
      dstSubpass: 0,
      srcStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
      dstStageMask: Vk_PipelineStageFlagBits.COLOR_ATTACHMENT_OUTPUT_BIT,
      srcAccessMask: 0,
      dstAccessMask: Vk_AccessFlagBits.COLOR_ATTACHMENT_WRITE_BIT,
    });
    return this;
  }

  /**
   * Get current attachment count
   */
  getAttachmentCount(): number {
    return this.#attachments.length;
  }

  /**
   * Get current subpass count
   */
  getSubpassCount(): number {
    return this.#subpasses.length;
  }

  /**
   * Validate and build the configuration
   */
  build(): RenderPassConfig {
    this.#validate();

    // If no subpasses defined, create a default one
    if (this.#subpasses.length === 0) {
      this.#createDefaultSubpass();
    }

    return {
      attachments: [...this.#attachments],
      subpasses: [...this.#subpasses],
      dependencies:
        this.#dependencies.length > 0 ? [...this.#dependencies] : undefined,
      name: this.#name,
    };
  }

  #validate(): void {
    if (this.#attachments.length === 0) {
      throw new Error('RenderPass must have at least one attachment');
    }

    // Validate subpass references
    for (let i = 0; i < this.#subpasses.length; i++) {
      const subpass = this.#subpasses[i]!;

      this.#validateAttachmentRefs(
        subpass.colorAttachments,
        `Subpass ${i} color attachments`,
      );
      this.#validateAttachmentRefs(
        subpass.inputAttachments,
        `Subpass ${i} input attachments`,
      );
      this.#validateAttachmentRefs(
        subpass.resolveAttachments,
        `Subpass ${i} resolve attachments`,
      );

      if (subpass.depthStencilAttachment) {
        this.#validateAttachmentRef(
          subpass.depthStencilAttachment,
          `Subpass ${i} depth/stencil attachment`,
        );
      }

      // Validate resolve attachments match color attachments count
      if (subpass.resolveAttachments && subpass.colorAttachments) {
        if (
          subpass.resolveAttachments.length !== subpass.colorAttachments.length
        ) {
          throw new Error(
            `Subpass ${i}: resolve attachments count must match color attachments count`,
          );
        }
      }
    }

    // Validate dependencies
    for (const dep of this.#dependencies) {
      const srcIdx =
        dep.srcSubpass === 'external' ? SUBPASS_EXTERNAL : dep.srcSubpass;
      const dstIdx =
        dep.dstSubpass === 'external' ? SUBPASS_EXTERNAL : dep.dstSubpass;

      if (srcIdx !== SUBPASS_EXTERNAL && srcIdx >= this.#subpasses.length) {
        throw new Error(
          `Invalid dependency: srcSubpass ${srcIdx} exceeds subpass count`,
        );
      }

      if (dstIdx !== SUBPASS_EXTERNAL && dstIdx >= this.#subpasses.length) {
        throw new Error(
          `Invalid dependency: dstSubpass ${dstIdx} exceeds subpass count`,
        );
      }
    }
  }

  #validateAttachmentRefs(
    refs: AttachmentReference[] | undefined,
    context: string,
  ): void {
    if (!refs) return;

    for (const ref of refs) {
      this.#validateAttachmentRef(ref, context);
    }
  }

  #validateAttachmentRef(ref: AttachmentReference, context: string): void {
    if (ref.attachment >= this.#attachments.length) {
      throw new Error(
        `${context}: attachment index ${ref.attachment} exceeds attachment count (${this.#attachments.length})`,
      );
    }
  }

  #createDefaultSubpass(): void {
    const colorAttachments: AttachmentReference[] = [];
    let depthAttachment: AttachmentReference | undefined;

    // Auto-detect color and depth attachments based on format/layout
    for (let i = 0; i < this.#attachments.length; i++) {
      const attachment = this.#attachments[i]!;

      // Check if depth format based on final layout
      const isDepth =
        attachment.finalLayout ===
          Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL ||
        attachment.finalLayout ===
          Vk_ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL;

      if (isDepth) {
        depthAttachment = {
          attachment: i,
          layout: Vk_ImageLayout.DEPTH_STENCIL_ATTACHMENT_OPTIMAL,
        };
      } else {
        colorAttachments.push({
          attachment: i,
          layout: Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL,
        });
      }
    }

    this.#subpasses.push({
      pipelineBindPoint: Vk_PipelineBindPoint.GRAPHICS,
      colorAttachments,
      depthStencilAttachment: depthAttachment,
    });
  }
}
