import { clamp } from '@vulppi/toolbelt/math';
import type { Pointer } from 'bun:ffi';
import { TextureImage } from '../resources';
import type { CameraRenderGroup, FrameRenderArtifacts } from '../systems/RenderSystem';
import { FRAME_RENDER_ID, FRAME_RENDER_KEY } from '../systems/RenderSystem';
import type { VkCommandBuffer, VkDevice, VkSwapchain } from '../vulkan';
import { VkRenderPass } from '../vulkan';
import type { AssetsStorage } from './AssetsStorage';
import type { Entity, World } from './World';

type CameraTarget = {
  texture: TextureImage;
  width: number;
  height: number;
  swapchainInstance: Pointer;
};

type WindowCache = {
  swapchainInstance: Pointer;
  cameraTargets: Map<Entity, CameraTarget>;
  renderPasses: RenderPassBundle | null;
};

export type FrameData = {
  cameraTargets: Map<Entity, TextureImage>;
};

type RenderPassBundle = {
  camera: VkRenderPass;
  composite: VkRenderPass;
};

export class RenderLogic {
  private __assetsStorage: AssetsStorage | null = null;
  private __windowCache: Map<bigint, WindowCache> = new Map();
  private __frameData: Map<bigint, FrameData> = new Map();

  render(
    window: bigint,
    device: VkDevice,
    commandBuffer: VkCommandBuffer,
    swapchain: VkSwapchain,
    imageIndex: number,
    assetsStorage: AssetsStorage,
    world?: World,
  ): void {
    void device;
    void commandBuffer;
    void imageIndex;
    void world;

    this.__assetsStorage = assetsStorage;

    const renderArtifacts = assetsStorage.get<FrameRenderArtifacts>(
      FRAME_RENDER_KEY,
      FRAME_RENDER_ID,
    );

    if (!renderArtifacts) return;

    const windowCache = this.__getWindowCache(window, swapchain.instance);

    if (windowCache.swapchainInstance !== swapchain.instance) {
      this.__resetWindowCache(windowCache);
      windowCache.swapchainInstance = swapchain.instance;
    }

    this.__ensureRenderPasses(device, swapchain, windowCache);

    const activeCameras = new Set<Entity>();

    for (const group of renderArtifacts.cameras) {
      activeCameras.add(group.camera.id);
      this.__prepareCameraTarget(group, swapchain, windowCache);
    }

    for (const [cameraId, target] of windowCache.cameraTargets) {
      if (activeCameras.has(cameraId)) continue;
      this.__destroyTexture(target.texture);
      windowCache.cameraTargets.delete(cameraId);
    }

    this.__frameData.set(window, {
      cameraTargets: new Map(
        Array.from(windowCache.cameraTargets.entries()).map(
          ([cameraId, target]) => [cameraId, target.texture],
        ),
      ),
    });
  }

  releaseSwapchainResources(window: bigint): void {
    const cache = this.__windowCache.get(window);
    if (!cache) return;
    this.__resetWindowCache(cache);
    this.__windowCache.delete(window);
    this.__frameData.delete(window);
  }

  clear(): void {
    for (const cache of this.__windowCache.values()) {
      this.__resetWindowCache(cache);
    }
    this.__windowCache.clear();
    this.__frameData.clear();
  }

  private __getWindowCache(
    window: bigint,
    swapchainInstance: Pointer,
  ): WindowCache {
    let cache = this.__windowCache.get(window);
    if (!cache) {
      cache = {
        swapchainInstance,
        cameraTargets: new Map(),
        renderPasses: null,
      };
      this.__windowCache.set(window, cache);
    }
    return cache;
  }

  private __prepareCameraTarget(
    group: CameraRenderGroup,
    swapchain: VkSwapchain,
    cache: WindowCache,
  ): void {
    const { camera } = group;
    const vp = camera.viewport;

    const width = Math.max(
      1,
      Math.floor(clamp(vp?.width ?? 1, 0, 1) * swapchain.width),
    );
    const height = Math.max(
      1,
      Math.floor(clamp(vp?.height ?? 1, 0, 1) * swapchain.height),
    );

    const target = cache.cameraTargets.get(camera.id);

    if (
      target &&
      target.width === width &&
      target.height === height &&
      target.swapchainInstance === cache.swapchainInstance
    ) {
      return;
    }

    if (target) {
      this.__destroyTexture(target.texture);
    }

    const texture = new TextureImage({
      width,
      height,
      format: 'rgba32float',
      usage: ['color-attachment', 'sampled'],
    });

    this.__assetsStorage?.textures.register(texture);

    cache.cameraTargets.set(camera.id, {
      texture,
      width,
      height,
      swapchainInstance: cache.swapchainInstance,
    });
  }

  private __ensureRenderPasses(
    device: VkDevice,
    swapchain: VkSwapchain,
    cache: WindowCache,
  ): void {
    if (cache.renderPasses) return;

    const cameraPass = new VkRenderPass(device.logicalDevice, {
      name: 'Camera Pass',
      attachments: [
        {
          format: 'rgba32float',
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'shader-read-only',
        },
      ],
    });

    const compositePass = new VkRenderPass(device.logicalDevice, {
      name: 'Composite Pass',
      attachments: [
        {
          format: swapchain.format,
          loadOp: 'clear',
          storeOp: 'store',
          finalLayout: 'present-src',
        },
      ],
    });

    cache.renderPasses = { camera: cameraPass, composite: compositePass };
  }

  private __destroyTexture(texture: TextureImage): void {
    this.__assetsStorage?.textures.destroy(texture);
  }

  private __resetWindowCache(cache: WindowCache): void {
    cache.renderPasses?.camera.dispose();
    cache.renderPasses?.composite.dispose();
    cache.renderPasses = null;

    for (const target of cache.cameraTargets.values()) {
      this.__destroyTexture(target.texture);
    }
    cache.cameraTargets.clear();
  }
}
