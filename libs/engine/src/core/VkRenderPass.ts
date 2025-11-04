import {
  getInstanceBuffer,
  instantiate,
  type InferField,
} from '@bunbox/struct';
import { ptr, type Pointer } from 'bun:ffi';
import {
  VK,
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_ImageLayout,
  Vk_PipelineBindPoint,
  Vk_Result,
  Vk_SampleCountFlagBits,
  Vk_StructureType,
  VkAttachmentDescription,
  VkAttachmentReference,
  VkRenderPassCreateInfo,
  VkSubpassDependency,
  VkSubpassDescription,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { VK_DEBUG } from '../singleton/logger';
import type { RenderPassConfig } from './RenderPassConfig';
import { SUBPASS_EXTERNAL } from './RenderPassConfig';
import { Color } from '../math';

type VkAttachmentDescriptionInstance = InferField<
  typeof VkAttachmentDescription
>;
type VkAttachmentReferenceInstance = InferField<typeof VkAttachmentReference>;
type VkSubpassDescriptionInstance = InferField<typeof VkSubpassDescription>;
type VkSubpassDependencyInstance = InferField<typeof VkSubpassDependency>;

/**
 * VkRenderPass - Vulkan render pass implementation
 *
 * Accepts RenderPassConfig directly and creates Vulkan resources.
 * Simplified architecture without elements/RenderPass abstraction.
 */
export class VkRenderPass {
  // Configuration
  #config: RenderPassConfig;
  #clearColor: Color = new Color(0, 0, 0, 1);

  // Vulkan-specific state
  #vkLogicalDevice: Pointer | null = null;
  #vkPhysicalDevice: Pointer | null = null;
  #vkRenderPass: Pointer | null = null;
  #currentFormat: number | null = null;

  constructor(config: RenderPassConfig) {
    this.#config = config;
  }

  /**
   * Get the configuration
   */
  get config(): RenderPassConfig {
    return this.#config;
  }

  /**
   * Get the VkRenderPass handle
   */
  get vkRenderPass(): Pointer {
    if (this.#vkRenderPass === null) {
      throw new DynamicLibError('RenderPass not prepared', 'Vulkan');
    }
    return this.#vkRenderPass;
  }

  /**
   * Check if Vulkan resources are prepared
   */
  get isPrepared(): boolean {
    return this.#vkRenderPass !== null;
  }

  /**
   * Get clear color
   */
  get clearColor(): Color {
    return this.#clearColor;
  }

  /**
   * Set clear color
   */
  set clearColor(color: Color) {
    this.#clearColor = color;
  }

  /**
   * Prepare Vulkan resources
   */
  prepare(
    vkLogicalDevice: Pointer,
    surfaceFormat: number,
    vkPhysicalDevice?: Pointer,
  ): void {
    if (this.#vkRenderPass !== null) {
      VK_DEBUG('RenderPass already prepared, skipping');
      return;
    }

    this.#vkLogicalDevice = vkLogicalDevice;
    this.#vkPhysicalDevice = vkPhysicalDevice ?? null;
    this.#currentFormat = surfaceFormat;
    this.#createVkRenderPass();
  }

  /**
   * Rebuild Vulkan resources
   */
  rebuild(surfaceFormat: number): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('RenderPass not prepared yet', 'Vulkan');
    }

    if (this.#currentFormat === surfaceFormat && this.#vkRenderPass !== null) {
      return;
    }

    this.release();
    this.#currentFormat = surfaceFormat;
    this.#createVkRenderPass();
  }

  /**
   * Release Vulkan resources (but keep the instance)
   */
  release(): void {
    if (this.#vkRenderPass !== null && this.#vkLogicalDevice !== null) {
      VK_DEBUG(`Releasing render pass: 0x${this.#vkRenderPass.toString(16)}`);
      VK.vkDestroyRenderPass(this.#vkLogicalDevice, this.#vkRenderPass, null);
      this.#vkRenderPass = null;
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.release();
    this.#vkLogicalDevice = null;
    this.#vkPhysicalDevice = null;
    this.#currentFormat = null;
  }

  // ============================================
  // Private Vulkan implementation
  // ============================================

  #createVkRenderPass(): void {
    if (!this.#vkLogicalDevice || this.#currentFormat === null) {
      throw new DynamicLibError(
        'Cannot create render pass without device/format',
        'Vulkan',
      );
    }

    VK_DEBUG(
      `Creating VkRenderPass${this.#config.name ? ` (${this.#config.name})` : ''}`,
    );

    // Convert declarative config to Vulkan structures
    // IMPORTANT: Store all intermediate arrays to prevent GC
    const attachments = this.#buildAttachments(
      this.#config,
      this.#currentFormat,
    );
    const { subpasses, refArrays } = this.#buildSubpasses(this.#config);
    const dependencies = this.#buildDependencies(this.#config);

    const createInfo = instantiate(VkRenderPassCreateInfo);
    createInfo.sType = Vk_StructureType.RENDER_PASS_CREATE_INFO;
    createInfo.attachmentCount = attachments.length;
    createInfo.pAttachments =
      attachments.length > 0
        ? BigInt(ptr(getInstanceBuffer(attachments[0]!)))
        : 0n;
    createInfo.subpassCount = subpasses.length;
    createInfo.pSubpasses = BigInt(ptr(getInstanceBuffer(subpasses[0]!)));
    createInfo.dependencyCount = dependencies?.length ?? 0;
    createInfo.pDependencies =
      dependencies && dependencies.length > 0
        ? BigInt(ptr(getInstanceBuffer(dependencies[0]!)))
        : 0n;

    const ptrAux = new BigUint64Array(1);
    const result = VK.vkCreateRenderPass(
      this.#vkLogicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(ptrAux),
    );

    if (result !== Vk_Result.SUCCESS) {
      throw new DynamicLibError(
        `Failed to create render pass. VkResult: ${result}`,
        'Vulkan',
      );
    }

    this.#vkRenderPass = Number(ptrAux[0]) as Pointer;
    VK_DEBUG(`VkRenderPass created: 0x${this.#vkRenderPass.toString(16)}`);

    // Keep refArrays alive until after vkCreateRenderPass
    // This ensures pointers remain valid
    void refArrays;
  }

  /**
   * Build Vulkan attachments from declarative config
   */
  #buildAttachments(
    config: RenderPassConfig,
    surfaceFormat: number,
  ): VkAttachmentDescriptionInstance[] {
    return config.attachments.map((attachment) => {
      const vkAttachment = instantiate(VkAttachmentDescription);
      vkAttachment.flags = 0;
      vkAttachment.format =
        attachment.format === 'swapchain' ? surfaceFormat : attachment.format;
      vkAttachment.samples =
        attachment.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT;
      vkAttachment.loadOp = attachment.loadOp ?? Vk_AttachmentLoadOp.CLEAR;
      vkAttachment.storeOp = attachment.storeOp ?? Vk_AttachmentStoreOp.STORE;
      vkAttachment.stencilLoadOp =
        attachment.stencilLoadOp ?? Vk_AttachmentLoadOp.DONT_CARE;
      vkAttachment.stencilStoreOp =
        attachment.stencilStoreOp ?? Vk_AttachmentStoreOp.DONT_CARE;
      vkAttachment.initialLayout =
        attachment.initialLayout ?? Vk_ImageLayout.UNDEFINED;
      vkAttachment.finalLayout =
        attachment.finalLayout ?? Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL;
      return vkAttachment;
    });
  }

  /**
   * Build Vulkan subpasses from declarative config
   * Returns subpasses and all intermediate ref arrays to prevent GC
   */
  #buildSubpasses(config: RenderPassConfig): {
    subpasses: VkSubpassDescriptionInstance[];
    refArrays: {
      input: VkAttachmentReferenceInstance[][];
      color: VkAttachmentReferenceInstance[][];
      resolve: VkAttachmentReferenceInstance[][];
      depth: (VkAttachmentReferenceInstance | null)[];
      preserve: Uint32Array[];
    };
  } {
    if (!config.subpasses || config.subpasses.length === 0) {
      throw new DynamicLibError(
        'RenderPass configuration must have at least one subpass',
        'Vulkan',
      );
    }

    // Store all attachment references to prevent GC
    const allInputRefs: VkAttachmentReferenceInstance[][] = [];
    const allColorRefs: VkAttachmentReferenceInstance[][] = [];
    const allResolveRefs: VkAttachmentReferenceInstance[][] = [];
    const allDepthRefs: (VkAttachmentReferenceInstance | null)[] = [];
    const allPreserveArrays: Uint32Array[] = [];

    const subpasses = config.subpasses.map((subpass, index) => {
      const vkSubpass = instantiate(VkSubpassDescription);
      vkSubpass.flags = 0;
      vkSubpass.pipelineBindPoint =
        subpass.pipelineBindPoint ?? Vk_PipelineBindPoint.GRAPHICS;

      // Input attachments
      if (subpass.inputAttachments && subpass.inputAttachments.length > 0) {
        const inputRefs = subpass.inputAttachments.map((ref) =>
          this.#createAttachmentRef(ref.attachment, ref.layout),
        );
        allInputRefs[index] = inputRefs;
        vkSubpass.inputAttachmentCount = inputRefs.length;
        vkSubpass.pInputAttachments = BigInt(
          ptr(getInstanceBuffer(inputRefs[0]!)),
        );
      } else {
        vkSubpass.inputAttachmentCount = 0;
        vkSubpass.pInputAttachments = 0n;
      }

      // Color attachments
      if (subpass.colorAttachments && subpass.colorAttachments.length > 0) {
        const colorRefs = subpass.colorAttachments.map((ref) =>
          this.#createAttachmentRef(ref.attachment, ref.layout),
        );
        allColorRefs[index] = colorRefs;
        vkSubpass.colorAttachmentCount = colorRefs.length;
        vkSubpass.pColorAttachments = BigInt(
          ptr(getInstanceBuffer(colorRefs[0]!)),
        );
      } else {
        vkSubpass.colorAttachmentCount = 0;
        vkSubpass.pColorAttachments = 0n;
      }

      // Resolve attachments
      if (subpass.resolveAttachments && subpass.resolveAttachments.length > 0) {
        const resolveRefs = subpass.resolveAttachments.map((ref) =>
          this.#createAttachmentRef(ref.attachment, ref.layout),
        );
        allResolveRefs[index] = resolveRefs;
        vkSubpass.pResolveAttachments = BigInt(
          ptr(getInstanceBuffer(resolveRefs[0]!)),
        );
      } else {
        vkSubpass.pResolveAttachments = 0n;
      }

      // Depth/stencil attachment
      if (subpass.depthStencilAttachment) {
        const depthRef = this.#createAttachmentRef(
          subpass.depthStencilAttachment.attachment,
          subpass.depthStencilAttachment.layout,
        );
        allDepthRefs[index] = depthRef;
        vkSubpass.pDepthStencilAttachment = BigInt(
          ptr(getInstanceBuffer(depthRef)),
        );
      } else {
        allDepthRefs[index] = null;
        vkSubpass.pDepthStencilAttachment = 0n;
      }

      // Preserve attachments
      if (
        subpass.preserveAttachments &&
        subpass.preserveAttachments.length > 0
      ) {
        const preserveArray = new Uint32Array(subpass.preserveAttachments);
        allPreserveArrays[index] = preserveArray;
        vkSubpass.preserveAttachmentCount = preserveArray.length;
        vkSubpass.pPreserveAttachments = BigInt(ptr(preserveArray));
      } else {
        vkSubpass.preserveAttachmentCount = 0;
        vkSubpass.pPreserveAttachments = 0n;
      }

      return vkSubpass;
    });

    return {
      subpasses,
      refArrays: {
        input: allInputRefs,
        color: allColorRefs,
        resolve: allResolveRefs,
        depth: allDepthRefs,
        preserve: allPreserveArrays,
      },
    };
  }

  /**
   * Build Vulkan dependencies from declarative config
   */
  #buildDependencies(
    config: RenderPassConfig,
  ): VkSubpassDependencyInstance[] | null {
    if (!config.dependencies || config.dependencies.length === 0) {
      return null;
    }

    return config.dependencies.map((dep) => {
      const vkDep = instantiate(VkSubpassDependency);
      vkDep.srcSubpass =
        dep.srcSubpass === 'external' ? SUBPASS_EXTERNAL : dep.srcSubpass;
      vkDep.dstSubpass =
        dep.dstSubpass === 'external' ? SUBPASS_EXTERNAL : dep.dstSubpass;
      vkDep.srcStageMask = dep.srcStageMask;
      vkDep.dstStageMask = dep.dstStageMask;
      vkDep.srcAccessMask = dep.srcAccessMask;
      vkDep.dstAccessMask = dep.dstAccessMask;
      vkDep.dependencyFlags = dep.dependencyFlags ?? 0;
      return vkDep;
    });
  }

  /**
   * Create a Vulkan attachment reference
   */
  #createAttachmentRef(
    attachment: number,
    layout: Vk_ImageLayout,
  ): VkAttachmentReferenceInstance {
    const ref = instantiate(VkAttachmentReference);
    ref.attachment = attachment;
    ref.layout = layout;
    return ref;
  }
}
