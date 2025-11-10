import type { Disposable } from '@bunbox/utils';
import type { Pointer } from 'bun:ffi';
import { RenderPassPresets } from '../../builders';
import type { RenderPassConfig } from '../../builders/RenderPassConfig';
import { VK_DEBUG } from '../../singleton/logger';
import { VkFramebuffer } from './VkFramebuffer';
import { VkImage } from './VkImage';
import { VkImageView } from './VkImageView';
import { VkRenderPass } from './VkRenderPass';
import { TextureImage } from '../../resources';
import type { VkDevice } from './VkDevice';
import type { SampleCount } from '../../resources/types';

/**
 * Stage in the render pipeline
 */
export interface RenderStage {
  name: string;
  renderPass: VkRenderPass;
  framebuffers: VkFramebuffer[];
  resources: {
    colorImages: VkImage[];
    colorViews: VkImageView[];
    depthImage?: VkImage;
    depthView?: VkImageView;
  };
}

/**
 * Configuration for custom post-process stages
 */
export interface CustomPostProcessConfig {
  name: string;
  config: RenderPassConfig;
}

/**
 * Manages the complete render pipeline with all stages
 *
 * Default pipeline flow:
 * 1. Shadow Maps
 * 2. Depth Pre-pass
 * 3. Light Culling
 * 4. Forward Rendering
 * 5. Transparency
 * 6. Custom Post-Process (user-defined)
 * 7. Final Composite to Swapchain
 */
export class VkRenderPipeline implements Disposable {
  #device: VkDevice;
  #width: number;
  #height: number;
  #swapchainFormat: number;
  #swapchainImages: Pointer[];
  #swapchainImageViews: VkImageView[];
  #sampleCount: SampleCount = 1;
  #msaaEnabled: boolean = false;

  #shadowMapStage: RenderStage | null = null;
  #depthPrePassStage: RenderStage | null = null;
  #lightCullingStage: RenderStage | null = null;
  #forwardStage: RenderStage | null = null;
  #transparencyStage: RenderStage | null = null;
  #customPostProcessStages: RenderStage[] = [];
  #finalCompositeStage: RenderStage | null = null;

  #customPostProcessConfigs: CustomPostProcessConfig[] = [];

  constructor(
    device: VkDevice,
    width: number,
    height: number,
    swapchainFormat: number,
    swapchainImages: Pointer[],
    swapchainImageViews: VkImageView[],
  ) {
    this.#device = device;
    this.#width = width;
    this.#height = height;
    this.#swapchainFormat = swapchainFormat;
    this.#swapchainImages = swapchainImages;
    this.#swapchainImageViews = swapchainImageViews;

    this.#buildPipeline();
  }

  get shadowMapStage(): RenderStage | null {
    return this.#shadowMapStage;
  }

  get depthPrePassStage(): RenderStage | null {
    return this.#depthPrePassStage;
  }

  get lightCullingStage(): RenderStage | null {
    return this.#lightCullingStage;
  }

  get forwardStage(): RenderStage | null {
    return this.#forwardStage;
  }

  get transparencyStage(): RenderStage | null {
    return this.#transparencyStage;
  }

  get customPostProcessStages(): RenderStage[] {
    return this.#customPostProcessStages;
  }

  get finalCompositeStage(): RenderStage | null {
    return this.#finalCompositeStage;
  }

  get msaaEnabled(): boolean {
    return this.#msaaEnabled;
  }

  get sampleCount(): SampleCount {
    return this.#sampleCount;
  }

  /**
   * Enable or disable MSAA
   */
  setMSAA(enabled: boolean, sampleCount: SampleCount = 4): void {
    if (this.#msaaEnabled === enabled && this.#sampleCount === sampleCount) {
      return;
    }

    this.#msaaEnabled = enabled;
    this.#sampleCount = enabled ? sampleCount : 1;

    VK_DEBUG(
      `MSAA ${enabled ? 'enabled' : 'disabled'} with ${this.#sampleCount}x samples`,
    );

    this.rebuild(this.#width, this.#height);
  }

  /**
   * Add a custom post-process stage
   */
  addCustomPostProcess(config: CustomPostProcessConfig): void {
    VK_DEBUG(`Adding custom post-process stage: ${config.name}`);
    this.#customPostProcessConfigs.push(config);
    this.rebuild(this.#width, this.#height);
  }

  /**
   * Remove a custom post-process stage by name
   */
  removeCustomPostProcess(name: string): boolean {
    const index = this.#customPostProcessConfigs.findIndex(
      (c) => c.name === name,
    );
    if (index === -1) return false;

    VK_DEBUG(`Removing custom post-process stage: ${name}`);
    this.#customPostProcessConfigs.splice(index, 1);
    this.rebuild(this.#width, this.#height);
    return true;
  }

  /**
   * Clear all custom post-process stages
   */
  clearCustomPostProcess(): void {
    if (this.#customPostProcessConfigs.length === 0) return;

    VK_DEBUG('Clearing all custom post-process stages');
    this.#customPostProcessConfigs = [];
    this.rebuild(this.#width, this.#height);
  }

  /**
   * Rebuild pipeline with new dimensions
   */
  rebuild(width: number, height: number): void {
    VK_DEBUG(`Rebuilding render pipeline: ${width}x${height}`);

    this.#width = width;
    this.#height = height;

    this.#disposePipeline();
    this.#buildPipeline();
  }

  /**
   * Update swapchain references
   */
  updateSwapchain(
    swapchainImages: Pointer[],
    swapchainImageViews: VkImageView[],
  ): void {
    VK_DEBUG('Updating pipeline swapchain references');

    this.#swapchainImages = swapchainImages;
    this.#swapchainImageViews = swapchainImageViews;

    this.#disposeFinalCompositeStage();
    this.#buildFinalCompositeStage();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing render pipeline');
    this.#disposePipeline();
  }

  #buildPipeline(): void {
    VK_DEBUG('Building render pipeline stages');

    this.#buildShadowMapStage();
    this.#buildDepthPrePassStage();
    this.#buildLightCullingStage();
    this.#buildForwardStage();
    this.#buildTransparencyStage();
    this.#buildCustomPostProcessStages();
    this.#buildFinalCompositeStage();

    VK_DEBUG('Render pipeline built successfully');
  }

  #disposePipeline(): void {
    this.#disposeShadowMapStage();
    this.#disposeDepthPrePassStage();
    this.#disposeLightCullingStage();
    this.#disposeForwardStage();
    this.#disposeTransparencyStage();
    this.#disposeCustomPostProcessStages();
    this.#disposeFinalCompositeStage();
  }

  #buildShadowMapStage(): void {
    const config = RenderPassPresets.shadowMap();
    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const shadowMapSize = 2048;
    const depthTexture = new TextureImage({
      label: 'Shadow Map',
      width: shadowMapSize,
      height: shadowMapSize,
      sampleCount: 1,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const depthImage = new VkImage(
      this.#device.logicalDevice,
      this.#device.physicalDevice,
      depthTexture,
    );

    const depthView = new VkImageView({
      device: this.#device.logicalDevice,
      format: depthImage.format,
      image: depthImage.instance,
      mask: ['depth'],
    });

    const framebuffer = new VkFramebuffer(
      this.#device.logicalDevice,
      renderPass.instance,
      [depthView],
      shadowMapSize,
      shadowMapSize,
    );

    this.#shadowMapStage = {
      name: 'Shadow Maps',
      renderPass,
      framebuffers: [framebuffer],
      resources: {
        colorImages: [],
        colorViews: [],
        depthImage,
        depthView,
      },
    };

    VK_DEBUG('Shadow map stage created');
  }

  #buildDepthPrePassStage(): void {
    const config = RenderPassPresets.depthPrePass();
    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const depthTexture = new TextureImage({
      label: 'Depth Pre-pass',
      width: this.#width,
      height: this.#height,
      sampleCount: this.#sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.#swapchainImages.length; i++) {
      const depthImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.#device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const framebuffer = new VkFramebuffer(
        this.#device.logicalDevice,
        renderPass.instance,
        [depthView],
        this.#width,
        this.#height,
      );

      colorImages.push(depthImage);
      colorViews.push(depthView);
      framebuffers.push(framebuffer);
    }

    this.#depthPrePassStage = {
      name: 'Depth Pre-Pass',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
      },
    };

    VK_DEBUG('Depth pre-pass stage created');
  }

  #buildLightCullingStage(): void {
    const config = RenderPassPresets.lightCulling();
    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const lightTexture = new TextureImage({
      label: 'Light Culling',
      width: this.#width,
      height: this.#height,
      sampleCount: 1,
      format: 'r32float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.#swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        lightTexture,
      );

      const colorView = new VkImageView({
        device: this.#device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const framebuffer = new VkFramebuffer(
        this.#device.logicalDevice,
        renderPass.instance,
        [colorView],
        this.#width,
        this.#height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      framebuffers.push(framebuffer);
    }

    this.#lightCullingStage = {
      name: 'Light Culling',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
      },
    };

    VK_DEBUG('Light culling stage created');
  }

  #buildForwardStage(): void {
    let config = RenderPassPresets.forward();

    if (this.#msaaEnabled) {
      config = {
        ...config,
        attachments: config.attachments.map((att) => ({
          ...att,
          samples: this.#sampleCount,
        })),
      };
    }

    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const colorTexture = new TextureImage({
      label: 'Forward Rendering',
      width: this.#width,
      height: this.#height,
      sampleCount: this.#sampleCount,
      format: 'rgba16float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const depthTexture = new TextureImage({
      label: 'Forward Depth',
      width: this.#width,
      height: this.#height,
      sampleCount: this.#sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.#swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        colorTexture,
      );

      const colorView = new VkImageView({
        device: this.#device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const depthImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.#device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const framebuffer = new VkFramebuffer(
        this.#device.logicalDevice,
        renderPass.instance,
        [colorView, depthView],
        this.#width,
        this.#height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      framebuffers.push(framebuffer);
    }

    this.#forwardStage = {
      name: 'Forward Rendering',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
        depthImage: colorImages[0],
        depthView: colorViews[0],
      },
    };

    VK_DEBUG('Forward stage created');
  }

  #buildTransparencyStage(): void {
    const config = RenderPassPresets.transparency();
    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const colorTexture = new TextureImage({
      label: 'Transparency',
      width: this.#width,
      height: this.#height,
      sampleCount: this.#sampleCount,
      format: 'rgba16float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const depthTexture = new TextureImage({
      label: 'Transparency Depth',
      width: this.#width,
      height: this.#height,
      sampleCount: this.#sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.#swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        colorTexture,
      );

      const colorView = new VkImageView({
        device: this.#device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const depthImage = new VkImage(
        this.#device.logicalDevice,
        this.#device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.#device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const framebuffer = new VkFramebuffer(
        this.#device.logicalDevice,
        renderPass.instance,
        [colorView, depthView],
        this.#width,
        this.#height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      framebuffers.push(framebuffer);
    }

    this.#transparencyStage = {
      name: 'Transparency',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
        depthImage: colorImages[0],
        depthView: colorViews[0],
      },
    };

    VK_DEBUG('Transparency stage created');
  }

  #buildCustomPostProcessStages(): void {
    this.#customPostProcessStages = [];

    for (const customConfig of this.#customPostProcessConfigs) {
      const renderPass = new VkRenderPass(
        this.#device.logicalDevice,
        customConfig.config,
        this.#swapchainFormat,
      );

      const colorTexture = new TextureImage({
        label: customConfig.name,
        width: this.#width,
        height: this.#height,
        sampleCount: 1,
        format: 'rgba16float',
        usage: ['color-target'],
        mipLevels: 1,
      });

      const colorImages: VkImage[] = [];
      const colorViews: VkImageView[] = [];
      const framebuffers: VkFramebuffer[] = [];

      for (let i = 0; i < this.#swapchainImages.length; i++) {
        const colorImage = new VkImage(
          this.#device.logicalDevice,
          this.#device.physicalDevice,
          colorTexture,
        );

        const colorView = new VkImageView({
          device: this.#device.logicalDevice,
          format: colorImage.format,
          image: colorImage.instance,
          mask: ['color'],
        });

        const framebuffer = new VkFramebuffer(
          this.#device.logicalDevice,
          renderPass.instance,
          [colorView],
          this.#width,
          this.#height,
        );

        colorImages.push(colorImage);
        colorViews.push(colorView);
        framebuffers.push(framebuffer);
      }

      this.#customPostProcessStages.push({
        name: customConfig.name,
        renderPass,
        framebuffers,
        resources: {
          colorImages,
          colorViews,
        },
      });

      VK_DEBUG(`Custom post-process stage created: ${customConfig.name}`);
    }
  }

  #buildFinalCompositeStage(): void {
    const config = RenderPassPresets.finalComposite();
    const renderPass = new VkRenderPass(
      this.#device.logicalDevice,
      config,
      this.#swapchainFormat,
    );

    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.#swapchainImages.length; i++) {
      const framebuffer = new VkFramebuffer(
        this.#device.logicalDevice,
        renderPass.instance,
        [this.#swapchainImageViews[i]!],
        this.#width,
        this.#height,
      );

      framebuffers.push(framebuffer);
    }

    this.#finalCompositeStage = {
      name: 'Final Composite',
      renderPass,
      framebuffers,
      resources: {
        colorImages: [],
        colorViews: [],
      },
    };

    VK_DEBUG('Final composite stage created');
  }

  #disposeShadowMapStage(): void {
    if (!this.#shadowMapStage) return;

    this.#shadowMapStage.framebuffers.forEach((fb) => fb.dispose());
    this.#shadowMapStage.resources.colorViews.forEach((v) => v.dispose());
    this.#shadowMapStage.resources.colorImages.forEach((i) => i.dispose());
    this.#shadowMapStage.resources.depthView?.dispose();
    this.#shadowMapStage.resources.depthImage?.dispose();
    this.#shadowMapStage.renderPass.dispose();
    this.#shadowMapStage = null;
  }

  #disposeDepthPrePassStage(): void {
    if (!this.#depthPrePassStage) return;

    this.#depthPrePassStage.framebuffers.forEach((fb) => fb.dispose());
    this.#depthPrePassStage.resources.colorViews.forEach((v) => v.dispose());
    this.#depthPrePassStage.resources.colorImages.forEach((i) => i.dispose());
    this.#depthPrePassStage.renderPass.dispose();
    this.#depthPrePassStage = null;
  }

  #disposeLightCullingStage(): void {
    if (!this.#lightCullingStage) return;

    this.#lightCullingStage.framebuffers.forEach((fb) => fb.dispose());
    this.#lightCullingStage.resources.colorViews.forEach((v) => v.dispose());
    this.#lightCullingStage.resources.colorImages.forEach((i) => i.dispose());
    this.#lightCullingStage.renderPass.dispose();
    this.#lightCullingStage = null;
  }

  #disposeForwardStage(): void {
    if (!this.#forwardStage) return;

    this.#forwardStage.framebuffers.forEach((fb) => fb.dispose());
    this.#forwardStage.resources.colorViews.forEach((v) => v.dispose());
    this.#forwardStage.resources.colorImages.forEach((i) => i.dispose());
    this.#forwardStage.renderPass.dispose();
    this.#forwardStage = null;
  }

  #disposeTransparencyStage(): void {
    if (!this.#transparencyStage) return;

    this.#transparencyStage.framebuffers.forEach((fb) => fb.dispose());
    this.#transparencyStage.resources.colorViews.forEach((v) => v.dispose());
    this.#transparencyStage.resources.colorImages.forEach((i) => i.dispose());
    this.#transparencyStage.renderPass.dispose();
    this.#transparencyStage = null;
  }

  #disposeCustomPostProcessStages(): void {
    for (const stage of this.#customPostProcessStages) {
      stage.framebuffers.forEach((fb) => fb.dispose());
      stage.resources.colorViews.forEach((v) => v.dispose());
      stage.resources.colorImages.forEach((i) => i.dispose());
      stage.renderPass.dispose();
    }
    this.#customPostProcessStages = [];
  }

  #disposeFinalCompositeStage(): void {
    if (!this.#finalCompositeStage) return;

    this.#finalCompositeStage.framebuffers.forEach((fb) => fb.dispose());
    this.#finalCompositeStage.renderPass.dispose();
    this.#finalCompositeStage = null;
  }
}
