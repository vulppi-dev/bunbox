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
  Vk_PipelineBindPoint,
  Vk_Result,
  Vk_SampleCountFlagBits,
  Vk_StructureType,
  VkAttachmentDescription,
  VkAttachmentReference,
  VkRenderPassCreateInfo,
  VkSubpassDependency,
  VkSubpassDescription,
  type Vk_ImageLayout,
} from '../../../dynamic-libs';
import { DynamicLibError } from '../../../errors';
import { VK_DEBUG } from '../../../singleton/logger';
import {
  DISPOSE_FUNC_SYM,
  PREPARE_FUNC_SYM,
  REBUILD_FUNC_SYM,
  RELEASE_FUNC_SYM,
  Resource,
} from '../../symbols/Resources';
import type { VkTexture } from '../VkTexture';
import { Framebuffer } from '../Framebuffer';

type VkAttachmentDescriptionInstance = InferField<
  typeof VkAttachmentDescription
>;
type VkAttachmentReferenceInstance = InferField<typeof VkAttachmentReference>;
type VkSubpassDescriptionInstance = InferField<typeof VkSubpassDescription>;
type VkSubpassDependencyInstance = InferField<typeof VkSubpassDependency>;

export abstract class AbstractRenderPass extends Resource {
  #vkLogicalDevice: Pointer | null = null;
  #vkPhysicalDevice: Pointer | null = null;
  #renderPass: Pointer | null = null;
  #currentFormat: number | null = null;

  // Custom framebuffer support
  #customFramebuffer: Framebuffer | null = null;
  #customAttachments: VkTexture[] | null = null;

  get renderPass(): Pointer {
    if (this.#renderPass === null) {
      throw new DynamicLibError('RenderPass not prepared', 'Vulkan');
    }
    return this.#renderPass;
  }

  get isPrepared(): boolean {
    return this.#renderPass !== null;
  }

  get customFramebuffer(): Framebuffer | null {
    return this.#customFramebuffer;
  }

  get customAttachments(): readonly VkTexture[] | null {
    return this.#customAttachments
      ? Object.freeze([...this.#customAttachments])
      : null;
  }

  get hasCustomTarget(): boolean {
    return this.#customFramebuffer !== null;
  }

  [PREPARE_FUNC_SYM](
    vkLogicalDevice: Pointer,
    surfaceFormat: number,
    vkPhysicalDevice?: Pointer,
  ): void {
    if (this.#renderPass !== null) {
      VK_DEBUG('RenderPass already prepared, skipping');
      return;
    }

    this.#vkLogicalDevice = vkLogicalDevice;
    this.#vkPhysicalDevice = vkPhysicalDevice ?? null;
    this.#currentFormat = surfaceFormat;
    this.#createRenderPass();
  }

  [REBUILD_FUNC_SYM](surfaceFormat: number): void {
    if (!this.#vkLogicalDevice) {
      throw new DynamicLibError('RenderPass not prepared yet', 'Vulkan');
    }

    if (this.#currentFormat === surfaceFormat && this.#renderPass !== null) {
      return;
    }

    this[RELEASE_FUNC_SYM]();
    this.#currentFormat = surfaceFormat;
    this.#createRenderPass();
  }

  [RELEASE_FUNC_SYM](): void {
    if (this.#renderPass !== null && this.#vkLogicalDevice !== null) {
      VK_DEBUG(`Releasing render pass: 0x${this.#renderPass.toString(16)}`);
      VK.vkDestroyRenderPass(this.#vkLogicalDevice, this.#renderPass, null);
      this.#renderPass = null;
    }

    // Dispose custom framebuffer if it exists
    if (this.#customFramebuffer !== null) {
      this.#customFramebuffer.dispose();
      this.#customFramebuffer = null;
    }

    this.#customAttachments = null;
  }

  [DISPOSE_FUNC_SYM](): void {
    this[RELEASE_FUNC_SYM]();
    this.#vkLogicalDevice = null;
    this.#vkPhysicalDevice = null;
    this.#currentFormat = null;
  }

  /**
   * Set custom render target (framebuffer with attachments)
   * This allows rendering to textures instead of the swapchain
   */
  setCustomTarget(
    attachments: VkTexture[],
    width: number,
    height: number,
  ): void {
    if (!this.#vkLogicalDevice || !this.#vkPhysicalDevice) {
      throw new DynamicLibError(
        'RenderPass must be prepared before setting custom target',
        'Vulkan',
      );
    }

    if (attachments.length === 0) {
      throw new DynamicLibError(
        'At least one attachment is required',
        'Vulkan',
      );
    }

    VK_DEBUG(
      `Setting custom render target: ${width}x${height}, ${attachments.length} attachments`,
    );

    // Dispose previous custom framebuffer if exists
    if (this.#customFramebuffer) {
      this.#customFramebuffer.dispose();
    }

    // Store attachments
    this.#customAttachments = [...attachments];

    // Create new framebuffer
    this.#customFramebuffer = new Framebuffer(
      this.#vkLogicalDevice,
      this.renderPass, // Use getter to ensure non-null
      attachments,
      width,
      height,
    );
  }

  /**
   * Clear custom render target and return to default (swapchain)
   */
  clearCustomTarget(): void {
    if (this.#customFramebuffer) {
      VK_DEBUG('Clearing custom render target');
      this.#customFramebuffer.dispose();
      this.#customFramebuffer = null;
      this.#customAttachments = null;
    }
  }

  /**
   * Rebuild custom framebuffer with new dimensions
   */
  rebuildCustomTarget(width: number, height: number): void {
    if (!this.#customFramebuffer) {
      throw new DynamicLibError('No custom target to rebuild', 'Vulkan');
    }

    VK_DEBUG(`Rebuilding custom target: ${width}x${height}`);
    this.#customFramebuffer.rebuild(width, height);
  }

  #createRenderPass(): void {
    if (!this.#vkLogicalDevice || this.#currentFormat === null) {
      throw new DynamicLibError(
        'Cannot create render pass without device/format',
        'Vulkan',
      );
    }

    VK_DEBUG('Creating render pass');

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

    this.#renderPass = Number(ptrAux[0]) as Pointer;
    VK_DEBUG(`Render pass created: 0x${this.#renderPass.toString(16)}`);
  }

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

  protected abstract _defineAttachments(
    format: number,
  ): VkAttachmentDescriptionInstance[];

  protected abstract _defineAttachmentReferences(): {
    color?: VkAttachmentReferenceInstance[];
    depth?: VkAttachmentReferenceInstance;
    resolve?: VkAttachmentReferenceInstance[];
    input?: VkAttachmentReferenceInstance[];
  };

  protected abstract _defineSubpasses(
    attachmentRefs: ReturnType<typeof this._defineAttachmentReferences>,
  ): VkSubpassDescriptionInstance[];

  protected abstract _defineSubpassDependencies():
    | VkSubpassDependencyInstance[]
    | null;
}
