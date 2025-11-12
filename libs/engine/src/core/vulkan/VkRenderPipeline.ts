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
 * 7. Clear Screen (off-screen with clear color)
 * 8. Final Composite to Swapchain (copies clear screen to presentation)
 */
export class VkRenderPipeline implements Disposable {
  private __device: VkDevice;
  private __width: number;
  private __height: number;
  private __swapchainFormat: number;
  private __swapchainImages: bigint[];
  private __swapchainImageViews: VkImageView[];
  private __sampleCount: SampleCount = 1;
  private __msaaEnabled: boolean = false;

  private __shadowMapStage: RenderStage | null = null;
  private __depthPrePassStage: RenderStage | null = null;
  private __lightCullingStage: RenderStage | null = null;
  private __forwardStage: RenderStage | null = null;
  private __transparencyStage: RenderStage | null = null;
  private __customPostProcessStages: RenderStage[] = [];
  private __clearScreenStage: RenderStage | null = null;
  private __finalCompositeStage: RenderStage | null = null;

  private __customPostProcessConfigs: CustomPostProcessConfig[] = [];

  constructor(
    device: VkDevice,
    width: number,
    height: number,
    swapchainFormat: number,
    swapchainImages: bigint[],
    swapchainImageViews: VkImageView[],
  ) {
    this.__device = device;
    this.__width = width;
    this.__height = height;
    this.__swapchainFormat = swapchainFormat;
    this.__swapchainImages = swapchainImages;
    this.__swapchainImageViews = swapchainImageViews;

    this.__buildPipeline();
  }

  get shadowMapStage(): RenderStage | null {
    return this.__shadowMapStage;
  }

  get depthPrePassStage(): RenderStage | null {
    return this.__depthPrePassStage;
  }

  get lightCullingStage(): RenderStage | null {
    return this.__lightCullingStage;
  }

  get forwardStage(): RenderStage | null {
    return this.__forwardStage;
  }

  get transparencyStage(): RenderStage | null {
    return this.__transparencyStage;
  }

  get customPostProcessStages(): RenderStage[] {
    return this.__customPostProcessStages;
  }

  get clearScreenStage(): RenderStage | null {
    return this.__clearScreenStage;
  }

  get finalCompositeStage(): RenderStage | null {
    return this.__finalCompositeStage;
  }

  get msaaEnabled(): boolean {
    return this.__msaaEnabled;
  }

  get sampleCount(): SampleCount {
    return this.__sampleCount;
  }

  /**
   * Enable or disable MSAA
   */
  setMSAA(enabled: boolean, sampleCount: SampleCount = 4): void {
    if (this.__msaaEnabled === enabled && this.__sampleCount === sampleCount) {
      return;
    }

    this.__msaaEnabled = enabled;
    this.__sampleCount = enabled ? sampleCount : 1;

    VK_DEBUG(
      `MSAA ${enabled ? 'enabled' : 'disabled'} with ${this.__sampleCount}x samples`,
    );

    this.rebuild(this.__width, this.__height);
  }

  /**
   * Add a custom post-process stage
   */
  addCustomPostProcess(config: CustomPostProcessConfig): void {
    VK_DEBUG(`Adding custom post-process stage: ${config.name}`);
    this.__customPostProcessConfigs.push(config);
    this.rebuild(this.__width, this.__height);
  }

  /**
   * Remove a custom post-process stage by name
   */
  removeCustomPostProcess(name: string): boolean {
    const index = this.__customPostProcessConfigs.findIndex(
      (c) => c.name === name,
    );
    if (index === -1) return false;

    VK_DEBUG(`Removing custom post-process stage: ${name}`);
    this.__customPostProcessConfigs.splice(index, 1);
    this.rebuild(this.__width, this.__height);
    return true;
  }

  /**
   * Clear all custom post-process stages
   */
  clearCustomPostProcess(): void {
    if (this.__customPostProcessConfigs.length === 0) return;

    VK_DEBUG('Clearing all custom post-process stages');
    this.__customPostProcessConfigs = [];
    this.rebuild(this.__width, this.__height);
  }

  /**
   * Rebuild pipeline with new dimensions
   */
  rebuild(width: number, height: number): void {
    VK_DEBUG(`Rebuilding render pipeline: ${width}x${height}`);

    this.__width = width;
    this.__height = height;

    this.__disposePipeline();
    this.__buildPipeline();
  }

  /**
   * Update swapchain references
   */
  updateSwapchain(
    swapchainImages: bigint[],
    swapchainImageViews: VkImageView[],
  ): void {
    VK_DEBUG('Updating pipeline swapchain references');

    this.__swapchainImages = swapchainImages;
    this.__swapchainImageViews = swapchainImageViews;

    this.__disposeFinalCompositeStage();
    this.__buildFinalCompositeStage();
  }

  dispose(): void | Promise<void> {
    VK_DEBUG('Disposing render pipeline');
    this.__disposePipeline();
  }

  private __buildPipeline(): void {
    VK_DEBUG('Building render pipeline stages');

    this.__buildShadowMapStage();
    this.__buildDepthPrePassStage();
    this.__buildLightCullingStage();
    this.__buildForwardStage();
    this.__buildTransparencyStage();
    this.__buildCustomPostProcessStages();
    this.__buildClearScreenStage();
    this.__buildFinalCompositeStage();

    VK_DEBUG('Render pipeline built successfully');
  }

  private __disposePipeline(): void {
    this.__disposeShadowMapStage();
    this.__disposeDepthPrePassStage();
    this.__disposeLightCullingStage();
    this.__disposeForwardStage();
    this.__disposeTransparencyStage();
    this.__disposeCustomPostProcessStages();
    this.__disposeClearScreenStage();
    this.__disposeFinalCompositeStage();
  }

  private __buildShadowMapStage(): void {
    const config = RenderPassPresets.shadowMap();
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
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
      this.__device.logicalDevice,
      this.__device.physicalDevice,
      depthTexture,
    );

    const depthView = new VkImageView({
      device: this.__device.logicalDevice,
      format: depthImage.format,
      image: depthImage.instance,
      mask: ['depth'],
    });

    const framebuffer = new VkFramebuffer(
      this.__device.logicalDevice,
      renderPass.instance,
      [depthView],
      shadowMapSize,
      shadowMapSize,
    );

    this.__shadowMapStage = {
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

  private __buildDepthPrePassStage(): void {
    const config = RenderPassPresets.depthPrePass();
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const depthTexture = new TextureImage({
      label: 'Depth Pre-pass',
      width: this.__width,
      height: this.__height,
      sampleCount: this.__sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const depthImages: VkImage[] = [];
    const depthViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const depthImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.__device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const frameBuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [depthView],
        this.__width,
        this.__height,
      );

      depthImages.push(depthImage);
      depthViews.push(depthView);
      framebuffers.push(frameBuffer);
    }

    this.__depthPrePassStage = {
      name: 'Depth Pre-Pass',
      renderPass,
      framebuffers: framebuffers,
      resources: {
        colorImages: [],
        colorViews: [],
        depthImage: depthImages[0],
        depthView: depthViews[0],
      },
    };

    VK_DEBUG('Depth pre-pass stage created');
  }

  private __buildLightCullingStage(): void {
    const config = RenderPassPresets.lightCulling();
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const lightTexture = new TextureImage({
      label: 'Light Culling',
      width: this.__width,
      height: this.__height,
      sampleCount: 1,
      format: 'r32float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        lightTexture,
      );

      const colorView = new VkImageView({
        device: this.__device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const framebuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [colorView],
        this.__width,
        this.__height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      framebuffers.push(framebuffer);
    }

    this.__lightCullingStage = {
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

  private __buildForwardStage(): void {
    let config = RenderPassPresets.forward();

    if (this.__msaaEnabled) {
      config = {
        ...config,
        attachments: config.attachments.map((att) => ({
          ...att,
          samples: this.__sampleCount,
        })),
      };
    }

    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const colorTexture = new TextureImage({
      label: 'Forward Rendering',
      width: this.__width,
      height: this.__height,
      sampleCount: this.__sampleCount,
      format: 'rgba16float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const depthTexture = new TextureImage({
      label: 'Forward Depth',
      width: this.__width,
      height: this.__height,
      sampleCount: this.__sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const depthImages: VkImage[] = [];
    const depthViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        colorTexture,
      );

      const colorView = new VkImageView({
        device: this.__device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const depthImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.__device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const framebuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [colorView, depthView],
        this.__width,
        this.__height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      depthImages.push(depthImage);
      depthViews.push(depthView);
      framebuffers.push(framebuffer);
    }

    this.__forwardStage = {
      name: 'Forward Rendering',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
        depthImage: depthImages[0],
        depthView: depthViews[0],
      },
    };

    VK_DEBUG('Forward stage created');
  }

  private __buildTransparencyStage(): void {
    const config = RenderPassPresets.transparency();
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const colorTexture = new TextureImage({
      label: 'Transparency',
      width: this.__width,
      height: this.__height,
      sampleCount: this.__sampleCount,
      format: 'rgba16float',
      usage: ['color-target'],
      mipLevels: 1,
    });

    const depthTexture = new TextureImage({
      label: 'Transparency Depth',
      width: this.__width,
      height: this.__height,
      sampleCount: this.__sampleCount,
      format: 'depth32float',
      usage: ['depth-stencil-target'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const depthImages: VkImage[] = [];
    const depthViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        colorTexture,
      );

      const colorView = new VkImageView({
        device: this.__device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const depthImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        depthTexture,
      );

      const depthView = new VkImageView({
        device: this.__device.logicalDevice,
        format: depthImage.format,
        image: depthImage.instance,
        mask: ['depth'],
      });

      const framebuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [colorView, depthView],
        this.__width,
        this.__height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      depthImages.push(depthImage);
      depthViews.push(depthView);
      framebuffers.push(framebuffer);
    }

    this.__transparencyStage = {
      name: 'Transparency',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
        depthImage: depthImages[0],
        depthView: depthViews[0],
      },
    };

    VK_DEBUG('Transparency stage created');
  }

  private __buildCustomPostProcessStages(): void {
    this.__customPostProcessStages = [];

    for (const customConfig of this.__customPostProcessConfigs) {
      const renderPass = new VkRenderPass(
        this.__device.logicalDevice,
        customConfig.config,
        this.__swapchainFormat,
      );

      const colorTexture = new TextureImage({
        label: customConfig.name,
        width: this.__width,
        height: this.__height,
        sampleCount: 1,
        format: 'rgba16float',
        usage: ['color-target'],
        mipLevels: 1,
      });

      const colorImages: VkImage[] = [];
      const colorViews: VkImageView[] = [];
      const framebuffers: VkFramebuffer[] = [];

      for (let i = 0; i < this.__swapchainImages.length; i++) {
        const colorImage = new VkImage(
          this.__device.logicalDevice,
          this.__device.physicalDevice,
          colorTexture,
        );

        const colorView = new VkImageView({
          device: this.__device.logicalDevice,
          format: colorImage.format,
          image: colorImage.instance,
          mask: ['color'],
        });

        const framebuffer = new VkFramebuffer(
          this.__device.logicalDevice,
          renderPass.instance,
          [colorView],
          this.__width,
          this.__height,
        );

        colorImages.push(colorImage);
        colorViews.push(colorView);
        framebuffers.push(framebuffer);
      }

      this.__customPostProcessStages.push({
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

  private __buildClearScreenStage(): void {
    const config = RenderPassPresets.offscreen('r16g16b16a16-sfloat', false);
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const colorTexture = new TextureImage({
      label: 'Clear Screen',
      width: this.__width,
      height: this.__height,
      sampleCount: 1,
      format: 'rgba16float',
      usage: ['color-target', 'sampler'],
      mipLevels: 1,
    });

    const colorImages: VkImage[] = [];
    const colorViews: VkImageView[] = [];
    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const colorImage = new VkImage(
        this.__device.logicalDevice,
        this.__device.physicalDevice,
        colorTexture,
      );

      const colorView = new VkImageView({
        device: this.__device.logicalDevice,
        format: colorImage.format,
        image: colorImage.instance,
        mask: ['color'],
      });

      const framebuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [colorView],
        this.__width,
        this.__height,
      );

      colorImages.push(colorImage);
      colorViews.push(colorView);
      framebuffers.push(framebuffer);
    }

    this.__clearScreenStage = {
      name: 'Clear Screen',
      renderPass,
      framebuffers,
      resources: {
        colorImages,
        colorViews,
      },
    };

    VK_DEBUG('Clear screen stage created');
  }

  private __buildFinalCompositeStage(): void {
    const config = RenderPassPresets.finalComposite();
    const renderPass = new VkRenderPass(
      this.__device.logicalDevice,
      config,
      this.__swapchainFormat,
    );

    const framebuffers: VkFramebuffer[] = [];

    for (let i = 0; i < this.__swapchainImages.length; i++) {
      const framebuffer = new VkFramebuffer(
        this.__device.logicalDevice,
        renderPass.instance,
        [this.__swapchainImageViews[i]!],
        this.__width,
        this.__height,
      );

      framebuffers.push(framebuffer);
    }

    this.__finalCompositeStage = {
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

  private __disposeShadowMapStage(): void {
    if (!this.__shadowMapStage) return;

    this.__shadowMapStage.framebuffers.forEach((fb) => fb.dispose());
    this.__shadowMapStage.resources.colorViews.forEach((v) => v.dispose());
    this.__shadowMapStage.resources.colorImages.forEach((i) => i.dispose());
    this.__shadowMapStage.resources.depthView?.dispose();
    this.__shadowMapStage.resources.depthImage?.dispose();
    this.__shadowMapStage.renderPass.dispose();
    this.__shadowMapStage = null;
  }

  private __disposeDepthPrePassStage(): void {
    if (!this.__depthPrePassStage) return;

    this.__depthPrePassStage.framebuffers.forEach((fb) => fb.dispose());
    this.__depthPrePassStage.resources.colorViews.forEach((v) => v.dispose());
    this.__depthPrePassStage.resources.colorImages.forEach((i) => i.dispose());
    this.__depthPrePassStage.renderPass.dispose();
    this.__depthPrePassStage = null;
  }

  private __disposeLightCullingStage(): void {
    if (!this.__lightCullingStage) return;

    this.__lightCullingStage.framebuffers.forEach((fb) => fb.dispose());
    this.__lightCullingStage.resources.colorViews.forEach((v) => v.dispose());
    this.__lightCullingStage.resources.colorImages.forEach((i) => i.dispose());
    this.__lightCullingStage.renderPass.dispose();
    this.__lightCullingStage = null;
  }

  private __disposeForwardStage(): void {
    if (!this.__forwardStage) return;

    this.__forwardStage.framebuffers.forEach((fb) => fb.dispose());
    this.__forwardStage.resources.colorViews.forEach((v) => v.dispose());
    this.__forwardStage.resources.colorImages.forEach((i) => i.dispose());
    this.__forwardStage.renderPass.dispose();
    this.__forwardStage = null;
  }

  private __disposeTransparencyStage(): void {
    if (!this.__transparencyStage) return;

    this.__transparencyStage.framebuffers.forEach((fb) => fb.dispose());
    this.__transparencyStage.resources.colorViews.forEach((v) => v.dispose());
    this.__transparencyStage.resources.colorImages.forEach((i) => i.dispose());
    this.__transparencyStage.renderPass.dispose();
    this.__transparencyStage = null;
  }

  private __disposeCustomPostProcessStages(): void {
    for (const stage of this.__customPostProcessStages) {
      stage.framebuffers.forEach((fb) => fb.dispose());
      stage.resources.colorViews.forEach((v) => v.dispose());
      stage.resources.colorImages.forEach((i) => i.dispose());
      stage.renderPass.dispose();
    }
    this.__customPostProcessStages = [];
  }

  private __disposeClearScreenStage(): void {
    if (!this.__clearScreenStage) return;

    this.__clearScreenStage.framebuffers.forEach((fb) => fb.dispose());
    this.__clearScreenStage.resources.colorViews.forEach((v) => v.dispose());
    this.__clearScreenStage.resources.colorImages.forEach((i) => i.dispose());
    this.__clearScreenStage.renderPass.dispose();
    this.__clearScreenStage = null;
  }

  private __disposeFinalCompositeStage(): void {
    if (!this.__finalCompositeStage) return;

    this.__finalCompositeStage.framebuffers.forEach((fb) => fb.dispose());
    this.__finalCompositeStage.renderPass.dispose();
    this.__finalCompositeStage = null;
  }
}
