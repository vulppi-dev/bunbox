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
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import type { RenderPass } from '../../elements/RenderPass';
import type { TextureImage } from '../../elements';
import { VkTexture } from './VkTexture';
import { Framebuffer } from './Framebuffer';
import {
  DISPOSE_FUNC_SYM,
  PREPARE_FUNC_SYM,
  REBUILD_FUNC_SYM,
  RELEASE_FUNC_SYM,
} from '../symbols/Resources';

type VkAttachmentDescriptionInstance = InferField<
  typeof VkAttachmentDescription
>;
type VkAttachmentReferenceInstance = InferField<typeof VkAttachmentReference>;
type VkSubpassDescriptionInstance = InferField<typeof VkSubpassDescription>;
type VkSubpassDependencyInstance = InferField<typeof VkSubpassDependency>;

/**
 * VkRenderPass - Generic Vulkan render pass implementation
 *
 * This is a SINGLE, GENERIC class that transforms any elements/RenderPass
 * into Vulkan resources. It does NOT extend elements/RenderPass.
 *
 * The Renderer converts elements/RenderPass → VkRenderPass.
 * VkRenderPass reads configuration from the source RenderPass and creates
 * appropriate Vulkan structures.
 */
export class VkRenderPass {
  // Reference to source RenderPass (elements API)
  #sourceRenderPass: RenderPass | null = null;
  // Vulkan-specific state
  #vkLogicalDevice: Pointer | null = null;
  #vkPhysicalDevice: Pointer | null = null;
  #vkRenderPass: Pointer | null = null;
  #currentFormat: number | null = null;

  // Custom framebuffer support (Vulkan-specific)
  #customFramebuffer: Framebuffer | null = null;
  #vkTextureCache: Map<TextureImage, VkTexture> = new Map();

  /**
   * Get the source RenderPass (elements API)
   * @internal
   */
  get sourceRenderPass(): RenderPass | null {
    return this.#sourceRenderPass;
  }

  /**
   * Get the VkRenderPass handle
   * @internal
   */
  get vkRenderPass(): Pointer {
    if (this.#vkRenderPass === null) {
      throw new DynamicLibError('RenderPass not prepared', 'Vulkan');
    }
    return this.#vkRenderPass;
  }

  /**
   * Check if Vulkan resources are prepared
   * @internal
   */
  get isPrepared(): boolean {
    return this.#vkRenderPass !== null;
  }

  /**
   * Get custom framebuffer (Vulkan-specific)
   * @internal
   */
  get vkCustomFramebuffer(): Framebuffer | null {
    return this.#customFramebuffer;
  }

  /**
   * Set the source RenderPass (elements API)
   * This is called by the Renderer when converting RenderPass → VkRenderPass
   * @internal
   */
  setSourceRenderPass(renderPass: RenderPass): void {
    this.#sourceRenderPass = renderPass;
  }

  /**
   * Update render targets from source RenderPass
   * Called by Renderer when source RenderPass changes targets
   * @internal
   */
  updateRenderTargets(targets: TextureImage[] | null): void {
    if (!targets || targets.length === 0) {
      // Clear custom target
      if (this.#customFramebuffer) {
        this.#customFramebuffer.dispose();
        this.#customFramebuffer = null;
      }
      return;
    }

    // Ensure Vulkan is prepared
    if (!this.#vkLogicalDevice || !this.#vkPhysicalDevice) {
      VK_DEBUG('Vulkan not prepared yet, deferring framebuffer creation');
      return;
    }

    // Convert TextureImage → VkTexture
    const vkTextures: VkTexture[] = [];
    for (const texture of targets) {
      let vkTexture = this.#vkTextureCache.get(texture);

      if (!vkTexture) {
        // Create new VkTexture from TextureImage
        vkTexture = new VkTexture(
          this.#vkLogicalDevice,
          this.#vkPhysicalDevice,
          texture,
        );
        this.#vkTextureCache.set(texture, vkTexture);
      }

      vkTextures.push(vkTexture);
    }

    // Get dimensions from first texture
    const width = targets[0]!.width;
    const height = targets[0]!.height;

    // Dispose previous framebuffer
    if (this.#customFramebuffer) {
      this.#customFramebuffer.dispose();
    }

    // Create new framebuffer
    this.#customFramebuffer = new Framebuffer(
      this.#vkLogicalDevice,
      this.vkRenderPass,
      vkTextures,
      width,
      height,
    );

    VK_DEBUG(
      `Custom render target set: ${width}x${height}, ${vkTextures.length} attachments`,
    );
  }

  /**
   * Prepare Vulkan resources
   * @internal
   */
  [PREPARE_FUNC_SYM](
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
   * @internal
   */
  [REBUILD_FUNC_SYM](surfaceFormat: number): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('RenderPass not prepared yet', 'Vulkan');
    }

    if (this.#currentFormat === surfaceFormat && this.#vkRenderPass !== null) {
      return;
    }

    this[RELEASE_FUNC_SYM]();
    this.#currentFormat = surfaceFormat;
    this.#createVkRenderPass();
  }

  /**
   * Release Vulkan resources (but keep the instance)
   * @internal
   */
  [RELEASE_FUNC_SYM](): void {
    if (this.#vkRenderPass !== null && this.#vkLogicalDevice !== null) {
      VK_DEBUG(`Releasing render pass: 0x${this.#vkRenderPass.toString(16)}`);
      VK.vkDestroyRenderPass(this.#vkLogicalDevice, this.#vkRenderPass, null);
      this.#vkRenderPass = null;
    }

    // Dispose custom framebuffer if it exists
    if (this.#customFramebuffer !== null) {
      this.#customFramebuffer.dispose();
      this.#customFramebuffer = null;
    }

    // Clear VkTexture cache
    for (const vkTexture of this.#vkTextureCache.values()) {
      vkTexture.dispose();
    }
    this.#vkTextureCache.clear();
  }

  /**
   * Dispose all resources
   * @internal
   */
  [DISPOSE_FUNC_SYM](): void {
    this[RELEASE_FUNC_SYM]();
    this.#vkLogicalDevice = null;
    this.#vkPhysicalDevice = null;
    this.#currentFormat = null;
  }

  // ============================================
  // Helper methods for creating Vulkan structures
  // ============================================

  protected _createColorAttachment(config: {
    format: number;
    loadOp: Vk_AttachmentLoadOp;
    storeOp: Vk_AttachmentStoreOp;
    initialLayout: Vk_ImageLayout;
    finalLayout: Vk_ImageLayout;
    samples?: Vk_SampleCountFlagBits;
  }): VkAttachmentDescriptionInstance {
    const attachment = instantiate(VkAttachmentDescription);
    attachment.flags = 0;
    attachment.format = config.format;
    attachment.samples = config.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT;
    attachment.loadOp = config.loadOp;
    attachment.storeOp = config.storeOp;
    attachment.stencilLoadOp = Vk_AttachmentLoadOp.DONT_CARE;
    attachment.stencilStoreOp = Vk_AttachmentStoreOp.DONT_CARE;
    attachment.initialLayout = config.initialLayout;
    attachment.finalLayout = config.finalLayout;
    return attachment;
  }

  protected _createDepthAttachment(config: {
    format: number;
    loadOp: Vk_AttachmentLoadOp;
    storeOp: Vk_AttachmentStoreOp;
    initialLayout: Vk_ImageLayout;
    finalLayout: Vk_ImageLayout;
    samples?: Vk_SampleCountFlagBits;
  }): VkAttachmentDescriptionInstance {
    const attachment = instantiate(VkAttachmentDescription);
    attachment.flags = 0;
    attachment.format = config.format;
    attachment.samples = config.samples ?? Vk_SampleCountFlagBits.COUNT_1_BIT;
    attachment.loadOp = config.loadOp;
    attachment.storeOp = config.storeOp;
    attachment.stencilLoadOp = config.loadOp;
    attachment.stencilStoreOp = config.storeOp;
    attachment.initialLayout = config.initialLayout;
    attachment.finalLayout = config.finalLayout;
    return attachment;
  }

  protected _createAttachmentRef(
    attachmentIndex: number,
    layout: Vk_ImageLayout,
  ): VkAttachmentReferenceInstance {
    const ref = instantiate(VkAttachmentReference);
    ref.attachment = attachmentIndex;
    ref.layout = layout;
    return ref;
  }

  protected _createGraphicsSubpass(config: {
    colorAttachments: VkAttachmentReferenceInstance[];
    depthAttachment?: VkAttachmentReferenceInstance;
    inputAttachments?: VkAttachmentReferenceInstance[];
    resolveAttachments?: VkAttachmentReferenceInstance[];
  }): VkSubpassDescriptionInstance {
    const subpass = instantiate(VkSubpassDescription);
    subpass.flags = 0;
    subpass.pipelineBindPoint = Vk_PipelineBindPoint.GRAPHICS;

    subpass.colorAttachmentCount = config.colorAttachments.length;
    subpass.pColorAttachments =
      config.colorAttachments.length > 0
        ? BigInt(ptr(getInstanceBuffer(config.colorAttachments[0]!)))
        : 0n;

    subpass.pDepthStencilAttachment = config.depthAttachment
      ? BigInt(ptr(getInstanceBuffer(config.depthAttachment)))
      : 0n;

    subpass.inputAttachmentCount = config.inputAttachments?.length ?? 0;
    subpass.pInputAttachments =
      config.inputAttachments && config.inputAttachments.length > 0
        ? BigInt(ptr(getInstanceBuffer(config.inputAttachments[0]!)))
        : 0n;

    subpass.pResolveAttachments =
      config.resolveAttachments && config.resolveAttachments.length > 0
        ? BigInt(ptr(getInstanceBuffer(config.resolveAttachments[0]!)))
        : 0n;

    subpass.preserveAttachmentCount = 0;
    subpass.pPreserveAttachments = 0n;

    return subpass;
  }

  protected _createSubpassDependency(config: {
    srcSubpass: number;
    dstSubpass: number;
    srcStageMask: number;
    dstStageMask: number;
    srcAccessMask: number;
    dstAccessMask: number;
    dependencyFlags?: number;
  }): VkSubpassDependencyInstance {
    const dependency = instantiate(VkSubpassDependency);
    dependency.srcSubpass = config.srcSubpass;
    dependency.dstSubpass = config.dstSubpass;
    dependency.srcStageMask = config.srcStageMask;
    dependency.dstStageMask = config.dstStageMask;
    dependency.srcAccessMask = config.srcAccessMask;
    dependency.dstAccessMask = config.dstAccessMask;
    dependency.dependencyFlags = config.dependencyFlags ?? 0;
    return dependency;
  }

  // ============================================
  // Generic Vulkan render pass configuration
  // These methods create a standard render pass configuration
  // that works for most use cases
  // ============================================

  /**
   * Define attachments for the render pass
   * Creates a simple color attachment configuration
   * @internal
   */
  protected _defineAttachments(
    format: number,
  ): VkAttachmentDescriptionInstance[] {
    return [
      this._createColorAttachment({
        format,
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.STORE,
        initialLayout: Vk_ImageLayout.UNDEFINED,
        finalLayout: Vk_ImageLayout.PRESENT_SRC_KHR,
      }),
    ];
  }

  /**
   * Define attachment references
   * Creates references for the color attachment
   * @internal
   */
  protected _defineAttachmentReferences(): {
    color?: VkAttachmentReferenceInstance[];
    depth?: VkAttachmentReferenceInstance;
    resolve?: VkAttachmentReferenceInstance[];
    input?: VkAttachmentReferenceInstance[];
  } {
    return {
      color: [
        this._createAttachmentRef(0, Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL),
      ],
    };
  }

  /**
   * Define subpasses
   * Creates a single graphics subpass
   * @internal
   */
  protected _defineSubpasses(
    attachmentRefs: ReturnType<typeof this._defineAttachmentReferences>,
  ): VkSubpassDescriptionInstance[] {
    return [
      this._createGraphicsSubpass({
        colorAttachments: attachmentRefs.color!,
      }),
    ];
  }

  /**
   * Define subpass dependencies
   * No dependencies by default
   * @internal
   */
  protected _defineSubpassDependencies(): VkSubpassDependencyInstance[] | null {
    return null;
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

    VK_DEBUG('Creating VkRenderPass');

    const attachments = this._defineAttachments(this.#currentFormat);
    const attachmentRefs = this._defineAttachmentReferences();
    const subpasses = this._defineSubpasses(attachmentRefs);
    const dependencies = this._defineSubpassDependencies();

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
  }
}
