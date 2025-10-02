import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_FColor,
  SDL_GPUColorTargetInfo,
  SDL_GPULoadOp,
  SDL_GPUStoreOp,
  SDL_GPUTextureCreateInfo,
  SDL_GPUTextureType,
  SDL_GPUSampleCount,
  SDL_InitFlags,
  SDL_WindowFlags,
  SDL_GPUTextureUsageFlags,
} from '@bunbox/sdl3';
import { type Pointer } from 'bun:ffi';
import {
  POINTER_KEY_DEVICE,
  USING_VULKAN,
  WINDOW_FEATURES_MAP,
} from '../constants';
import { Color, type Matrix, Vector2, Vector3 } from '../math';
import { AbstractCamera, AbstractLight, Node3D, Viewport } from '../nodes';
import { Mesh } from '../nodes/Mesh';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { Node } from './Node';
import type { Geometry, Material } from '../elements';
import {
  parseSampleCount,
  parseTextureFormat,
  parseTextureType,
  parseTextureUsage,
} from './sdl-helper';

export type WindowOptions = {
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  features?: WindowsFeaturesOptions;
};

type SceneRenderData = {
  geometry: Geometry;
  modelMatrix: Matrix;
  viewMatrix: Matrix;
  projectionMatrix: Matrix;
  viewport: Viewport;
  material: Material;
};

export class Window extends Viewport {
  #winPtr: Pointer;
  #devicePtr: Pointer;
  #winId: number;
  #enableVSync: boolean = true;
  #swapFormat: number = 0;

  #features: WindowsFeaturesOptions;
  #stack: Node[] = [];
  #meshStack: Mesh[] = [];
  #lightStack: AbstractLight[] = [];
  #cameraStack: AbstractCamera[] = [];
  #scheduleDirty: boolean = true;

  #clearColor = new Color();

  // Helpers
  #renderDelayCount: number;

  // Pointers & Structs
  #displayMode: SDL_DisplayMode;
  #widthPtr: Int32Array;
  #heightPtr: Int32Array;
  #xPtr: Int32Array;
  #yPtr: Int32Array;

  #currentCmd: Pointer | null = null;
  #swapTexPtr = new BigUint64Array(1);
  #swapWidthPtr = new Uint32Array(1);
  #swapHeightPtr = new Uint32Array(1);

  #clearColorStruct = new SDL_FColor();

  #textureTouch: Set<Pointer> = new Set();
  #textureMap: Map<string, Pointer> = new Map();
  #resolveTextureMap: Map<string, Pointer> = new Map();
  #textureMetaMap: Map<
    string,
    { width: number; height: number; hash: string; sampleCount: number }
  > = new Map();
  #viewportCompositionQueue: Set<{
    texture: Pointer;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = new Set();

  static #getFeaturesFlags(features: WindowsFeaturesOptions): number {
    let flags = USING_VULKAN
      ? SDL_WindowFlags.SDL_WINDOW_VULKAN
      : SDL_WindowFlags.SDL_WINDOW_METAL;
    for (const [key, value] of Object.entries(features)) {
      flags |= value ? (WINDOW_FEATURES_MAP[key as WindowsFeature] ?? 0) : 0;
    }

    return flags;
  }

  constructor({ title, height, width, features }: WindowOptions) {
    super();
    this.#features = features ?? {};

    const initialFlag = SDL.SDL_WasInit(SDL_InitFlags.SDL_INIT_VIDEO);
    if ((initialFlag & SDL_InitFlags.SDL_INIT_VIDEO) === 0) {
      throw new Error(
        'SDL video subsystem is not initialized. Please initialize it by creating an App instance first.',
      );
    }

    const winPointer = SDL.SDL_CreateWindow(
      cstr(title),
      width ?? 800,
      height ?? 600,
      Window.#getFeaturesFlags(this.#features),
    );

    if (!winPointer) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    this.#winPtr = winPointer;
    this.#winId = SDL.SDL_GetWindowID(this.#winPtr);
    POINTERS_MAP.set(this.id, this.#winPtr);

    this.#displayMode = new SDL_DisplayMode();
    this.#widthPtr = new Int32Array(1);
    this.#heightPtr = new Int32Array(1);
    this.#xPtr = new Int32Array(1);
    this.#yPtr = new Int32Array(1);
    this.#renderDelayCount = 0;
    const devicePtr = POINTERS_MAP.get(POINTER_KEY_DEVICE);

    if (!devicePtr) {
      throw new Error('Create App node instance before creating Window');
    }
    this.#devicePtr = devicePtr;
    if (!SDL.SDL_ClaimWindowForGPUDevice(this.#devicePtr, this.#winPtr)) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    SDL.SDL_GetWindowSizeInPixels(
      this.#winPtr,
      this.#widthPtr,
      this.#heightPtr,
    );
    SDL.SDL_GetWindowPosition(this.#winPtr, this.#xPtr, this.#yPtr);
    this.width = this.#widthPtr[0]!;
    this.height = this.#heightPtr[0]!;
    this.x = this.#xPtr[0]!;
    this.y = this.#yPtr[0]!;
    this.unmarkAsDirty();

    this.#processDisplayMode();
    this.#swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(
      this.#devicePtr,
      this.#winPtr,
    );

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('remove-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('enabled-change', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('orientation', () => {
        this.#processDisplayMode();
      }),
      this.subscribe('windowDisplayChanged', (ev) => {
        if (ev.windowId !== this.#winId) return;
        this.#processDisplayMode();
      }),
      this.subscribe('windowResize', (ev) => {
        if (ev.windowId !== this.#winId) return;
        this.#processDisplayMode();
      }),
    ];

    this.on('dispose', () => {
      unsubscribes.forEach((fn) => fn());
      this.#stack = [];
      this.#meshStack = [];
      POINTERS_MAP.delete(this.id);
      SDL.SDL_ReleaseWindowFromGPUDevice(this.#devicePtr, this.#winPtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });

    this.#rebuildStacks();
  }

  get windowId() {
    return SDL.SDL_GetWindowID(this.#winPtr);
  }

  get title() {
    return SDL.SDL_GetWindowTitle(this.#winPtr).toString();
  }

  get clearColor() {
    return this.#clearColor;
  }

  get isEnabledVSync() {
    return this.#enableVSync;
  }

  set title(value: string) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    SDL.SDL_SetWindowTitle(this.#winPtr, cstr(value));
  }

  set clearColor(value: Color) {
    this.#clearColor = value;
    this.#clearColor.markAsDirty();
  }

  set isEnabledVSync(value: boolean) {
    this.#enableVSync = value;
  }

  getCurrentDisplayFrameRate() {
    return Math.max(this.#displayMode.properties.refresh_rate, 24);
  }

  getCurrentDisplaySize() {
    return new Vector2(
      this.#displayMode.properties.w,
      this.#displayMode.properties.h,
    );
  }

  override _process(deltaTime: number): void {
    this.#renderDelayCount += deltaTime;

    if (this.isDirty) {
      this.#widthPtr[0] = this.width;
      this.#heightPtr[0] = this.height;
      this.#xPtr[0] = this.x;
      this.#yPtr[0] = this.y;

      SDL.SDL_SetWindowSize(
        this.#winPtr,
        this.#widthPtr[0],
        this.#heightPtr[0],
      );
      SDL.SDL_SetWindowPosition(this.#winPtr, this.#xPtr[0], this.#yPtr[0]);

      this.unmarkAsDirty();
    }

    if (this.#enableVSync) {
      const rate = this.getCurrentDisplayFrameRate();
      const delay = 1000 / rate;
      if (this.#renderDelayCount >= delay) {
        this.#callRenderStack(this.#renderDelayCount);
        this.#renderDelayCount = 0;
      }
    } else {
      this.#callRenderStack(this.#renderDelayCount);
      this.#renderDelayCount = 0;
    }
  }

  #processDisplayMode() {
    const displayId = SDL.SDL_GetDisplayForWindow(this.#winPtr);
    const displayModePtr = SDL.SDL_GetCurrentDisplayMode(displayId);

    if (!displayModePtr) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    const buffer = pointerToBuffer(displayModePtr, this.#displayMode.size);
    this.#displayMode.copy(buffer);
  }

  #rebuildStacks() {
    const nextStack: Node[] = [];
    const nextMeshStack: Mesh[] = [];
    const nextLightStack: AbstractLight[] = [];
    const nextCameraStack: AbstractCamera[] = [];

    this.traverse((n) => {
      if (n instanceof Node) {
        nextStack.push(n);
      }
      if (n instanceof Mesh) {
        nextMeshStack.push(n);
      }
      if (n instanceof AbstractLight) {
        nextLightStack.push(n);
      }
      if (n instanceof AbstractCamera) {
        nextCameraStack.push(n);
      }
    });

    this.#stack = nextStack;
    this.#meshStack = nextMeshStack;
    this.#lightStack = nextLightStack;
    this.#cameraStack = nextCameraStack;
    this.#scheduleDirty = false;
  }

  #callRenderStack(delta: number) {
    if (this.#scheduleDirty) {
      this.#rebuildStacks();
    }

    for (const node of this.#stack) node._update(delta);
    this.#render();
  }

  #render(): void {
    if (!this.#winPtr || !this.#devicePtr) return;

    this.#currentCmd = SDL.SDL_AcquireGPUCommandBuffer(this.#devicePtr);
    if (!this.#currentCmd) {
      console.warn('SDL_AcquireGPUCommandBuffer failed');
      return;
    }

    const success = SDL.SDL_AcquireGPUSwapchainTexture(
      this.#currentCmd,
      this.#winPtr,
      this.#swapTexPtr,
      this.#swapWidthPtr,
      this.#swapHeightPtr,
    );

    if (
      !success ||
      !this.#swapTexPtr[0] ||
      this.#swapWidthPtr[0] === 0 ||
      this.#swapHeightPtr[0] === 0
    ) {
      SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
      return;
    }

    this.#textureTouch.clear();
    this.#viewportCompositionQueue.clear();
    this.#clearScreen();

    // Render each camera with its visible meshes
    for (const camera of this.#cameraStack) {
      const viewMatrix = this.#processModelMatrix(camera).invert();
      const projectionMatrix = camera.projectionMatrix;
      const cameraLayer = this.#processModelLayer(camera);

      // Find viewport for this camera
      let viewport: Viewport | null = null;
      let parent = camera.parent;
      while (parent) {
        if (parent instanceof Viewport) {
          viewport = parent;
          break;
        }
        parent = parent.parent;
      }
      const finalViewport = viewport || this;

      // Perform frustum culling for this camera
      const visibleMeshes = this.#frustumCulling(camera);

      // Render all visible meshes for this camera
      for (const mesh of visibleMeshes) {
        const material = mesh.material;
        if (!material || !mesh.geometry) continue;

        const modelMatrix = this.#processModelMatrix(mesh);
        const modelLayer = this.#processModelLayer(mesh);

        // Check layer mask
        if (cameraLayer === 0 || (cameraLayer & modelLayer) === 0) continue;

        this.#renderScene({
          geometry: mesh.geometry,
          modelMatrix,
          viewMatrix,
          projectionMatrix,
          viewport: finalViewport,
          material,
        });
      }
    }

    // TODO: composition

    // TODO: post process

    SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);

    const textures = Array.from(this.#textureMap.entries());
    for (const [key, tex] of textures) {
      if (!this.#textureTouch.has(tex)) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, tex);
        this.#textureMap.delete(key);
        this.#textureMetaMap.delete(key);
      }
    }

    this.#currentCmd = null;
    const err = SDL.SDL_GetError().toString();
    if (err) console.log('[SDL ERROR]', err);
  }

  #clearScreen() {
    const colorTarget = new SDL_GPUColorTargetInfo();
    colorTarget.properties.texture = this.#swapTexPtr[0]!;

    if (this.clearColor.isDirty) {
      this.#clearColorStruct.properties.r = this.#clearColor.r;
      this.#clearColorStruct.properties.g = this.#clearColor.g;
      this.#clearColorStruct.properties.b = this.#clearColor.b;
      this.#clearColorStruct.properties.a = this.#clearColor.a;
      this.clearColor.unmarkAsDirty();
    }
    colorTarget.properties.clear_color = this.#clearColorStruct;
    colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR;
    colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

    const pass = SDL.SDL_BeginGPURenderPass(
      this.#currentCmd,
      colorTarget.bunPointer,
      1,
      null,
    );
    SDL.SDL_EndGPURenderPass(pass);
  }

  #renderScene(sceneData: SceneRenderData) {
    const { texture: viewportTexture, resolveTexture } =
      this.#getViewportTexture(sceneData.viewport);

    const colorTarget = new SDL_GPUColorTargetInfo();
    colorTarget.properties.texture = viewportTexture;
    colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_LOAD;
    colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

    // Set resolve texture if MSAA is enabled
    if (resolveTexture) {
      colorTarget.properties.resolve_texture = resolveTexture;
    }

    const pass = SDL.SDL_BeginGPURenderPass(
      this.#currentCmd,
      colorTarget.bunPointer,
      1,
      null,
    );

    SDL.SDL_EndGPURenderPass(pass);
  }

  #processModelMatrix(node: Node3D): Matrix {
    const root = node.transform.clone();
    let parent = node.parent;
    while (parent) {
      if (parent === this) break;

      if (parent instanceof Node3D) {
        root.mulR(parent.transform);
      }

      parent = parent.parent;
    }

    return root;
  }

  #processModelLayer(node: Node3D): number {
    let layerFlag = node.layer.get();
    let parent = node.parent;
    while (parent) {
      if (parent === this) break;

      if (parent instanceof Node3D) {
        layerFlag &= parent.layer.get();
      }

      parent = parent.parent;
    }

    return layerFlag >>> 0;
  }

  #frustumCulling(camera: AbstractCamera): Set<Mesh> {
    const visibleMeshes = new Set<Mesh>();

    // Get camera's view matrix
    const viewMatrix = this.#processModelMatrix(camera).invert();

    // Get frustum for this camera
    const frustum = camera.getFrustum(viewMatrix);

    // Test each mesh against frustum
    for (const mesh of this.#meshStack) {
      if (!mesh.geometry) continue;

      // Get mesh world position from transform matrix
      const meshMatrix = this.#processModelMatrix(mesh);
      const m = meshMatrix.toArray();

      // Extract position from matrix (last column)
      const meshPosition = new Vector3(m[12], m[13], m[14]);

      // Get bounding sphere radius from geometry
      // For now, use a simple approximation based on geometry bounds
      // TODO: Add proper bounding sphere calculation to Geometry class
      const boundingRadius = 10; // Default radius, should be computed from geometry

      // Perform sphere-frustum intersection test
      if (frustum.intersectsSphere(meshPosition, boundingRadius)) {
        visibleMeshes.add(mesh);
      }
    }

    return visibleMeshes;
  }
  #getViewportTexture(viewport: Viewport): {
    texture: bigint;
    resolveTexture: bigint | null;
  } {
    // Case 1: Viewport has a target (TextureImage)
    if (viewport.target) {
      const target = viewport.target;
      const targetHash = target.hash;
      const existingMeta = this.#textureMetaMap.get(target.id);

      // Check if we need to recreate the texture
      const needsRecreate =
        !existingMeta ||
        existingMeta.width !== target.width ||
        existingMeta.height !== target.height ||
        existingMeta.hash !== targetHash ||
        existingMeta.sampleCount !== target.sampleCount;

      if (needsRecreate) {
        // Destroy old textures if exist
        const oldTexture = this.#textureMap.get(target.id);
        if (oldTexture) {
          SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldTexture);
        }

        const oldResolveTexture = this.#resolveTextureMap.get(target.id);
        if (oldResolveTexture) {
          SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldResolveTexture);
        }

        // Create main texture based on target specifications
        const texInfo = new SDL_GPUTextureCreateInfo();
        texInfo.properties.type = parseTextureType(target);
        texInfo.properties.format = parseTextureFormat(target.format);
        texInfo.properties.usage = parseTextureUsage(target.usage);
        texInfo.properties.width = target.width;
        texInfo.properties.height = target.height;
        texInfo.properties.layer_count_or_depth = target.depth;
        texInfo.properties.num_levels = target.layerCount;
        texInfo.properties.sample_count = parseSampleCount(target.sampleCount);
        texInfo.properties.props = 0n;

        const newTexture = SDL.SDL_CreateGPUTexture(
          this.#devicePtr,
          texInfo.bunPointer,
        );

        if (!newTexture) {
          console.warn(
            `Failed to create GPU texture for target ${target.id}: ${SDL.SDL_GetError()}`,
          );
          return { texture: 0n, resolveTexture: null };
        }

        this.#textureMap.set(target.id, newTexture);
        this.#textureTouch.add(newTexture);

        // Create resolve texture if MSAA is enabled (sampleCount > 1)
        let resolveTexture: Pointer | null = null;

        if (target.sampleCount > 1) {
          const resolveInfo = new SDL_GPUTextureCreateInfo();
          resolveInfo.properties.type = parseTextureType(target);
          resolveInfo.properties.format = parseTextureFormat(target.format);
          resolveInfo.properties.usage = parseTextureUsage(target.usage);
          resolveInfo.properties.width = target.width;
          resolveInfo.properties.height = target.height;
          resolveInfo.properties.layer_count_or_depth = target.depth;
          resolveInfo.properties.num_levels = target.layerCount;
          resolveInfo.properties.sample_count =
            SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1; // Resolve texture always has sampleCount=1
          resolveInfo.properties.props = 0n;

          resolveTexture = SDL.SDL_CreateGPUTexture(
            this.#devicePtr,
            resolveInfo.bunPointer,
          );

          if (!resolveTexture) {
            console.warn(
              `Failed to create resolve texture for target ${target.id}: ${SDL.SDL_GetError()}`,
            );
            // Continue without resolve texture
          } else {
            this.#resolveTextureMap.set(target.id, resolveTexture);
            this.#textureTouch.add(resolveTexture);
          }
        }

        // Update metadata
        this.#textureMetaMap.set(target.id, {
          width: target.width,
          height: target.height,
          hash: targetHash,
          sampleCount: target.sampleCount,
        });

        return {
          texture: BigInt(newTexture),
          resolveTexture: resolveTexture ? BigInt(resolveTexture) : null,
        };
      }

      // Use existing textures
      const tPtr = this.#textureMap.get(target.id)!;
      this.#textureTouch.add(tPtr);

      const rPtr = this.#resolveTextureMap.get(target.id);
      if (rPtr) {
        this.#textureTouch.add(rPtr);
      }

      return {
        texture: BigInt(tPtr),
        resolveTexture: rPtr ? BigInt(rPtr) : null,
      };
    }

    // Case 2: No target - create texture based on viewport dimensions (proportional to swapchain)
    const swapWidth = this.#swapWidthPtr[0]!;
    const swapHeight = this.#swapHeightPtr[0]!;

    // Viewport dimensions are [0..1] proportions of swapchain
    const texWidth = Math.max(1, Math.floor(swapWidth * viewport.width));
    const texHeight = Math.max(1, Math.floor(swapHeight * viewport.height));

    const existingMeta = this.#textureMetaMap.get(viewport.id);

    // Check if we need to recreate (swapchain or viewport dimensions changed)
    const needsRecreate =
      !existingMeta ||
      existingMeta.width !== texWidth ||
      existingMeta.height !== texHeight;

    if (needsRecreate) {
      // Destroy old texture if exists
      const oldTexture = this.#textureMap.get(viewport.id);
      if (oldTexture) {
        SDL.SDL_ReleaseGPUTexture(this.#devicePtr, oldTexture);
      }

      // Create new texture
      const texInfo = new SDL_GPUTextureCreateInfo();
      texInfo.properties.type = SDL_GPUTextureType.SDL_GPU_TEXTURETYPE_2D;
      texInfo.properties.format = this.#swapFormat;
      texInfo.properties.usage =
        (SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_COLOR_TARGET |
          SDL_GPUTextureUsageFlags.SDL_GPU_TEXTUREUSAGE_SAMPLER) >>>
        0;
      texInfo.properties.width = texWidth;
      texInfo.properties.height = texHeight;
      texInfo.properties.layer_count_or_depth = 1;
      texInfo.properties.num_levels = 1;
      texInfo.properties.sample_count =
        SDL_GPUSampleCount.SDL_GPU_SAMPLECOUNT_1;
      texInfo.properties.props = 0n;

      const newTexture = SDL.SDL_CreateGPUTexture(
        this.#devicePtr,
        texInfo.bunPointer,
      );

      if (!newTexture) {
        console.warn(
          `Failed to create GPU texture for viewport ${viewport.id}: ${SDL.SDL_GetError()}`,
        );
        return { texture: 0n, resolveTexture: null };
      }

      this.#textureMap.set(viewport.id, newTexture);
      this.#textureMetaMap.set(viewport.id, {
        width: texWidth,
        height: texHeight,
        hash: '', // No hash for viewport-only textures
        sampleCount: 1,
      });

      this.#textureTouch.add(newTexture);

      // Add to composition queue for final blit to swapchain
      this.#viewportCompositionQueue.add({
        texture: newTexture,
        x: Math.floor(swapWidth * viewport.x),
        y: Math.floor(swapHeight * viewport.y),
        width: texWidth,
        height: texHeight,
      });

      return { texture: BigInt(newTexture), resolveTexture: null };
    }

    const tPtr = this.#textureMap.get(viewport.id)!;
    this.#textureTouch.add(tPtr);

    // Add to composition queue for final blit to swapchain
    this.#viewportCompositionQueue.add({
      texture: tPtr,
      x: Math.floor(swapWidth * viewport.x),
      y: Math.floor(swapHeight * viewport.y),
      width: texWidth,
      height: texHeight,
    });

    return { texture: BigInt(tPtr), resolveTexture: null };
  }

  protected override _getType(): string {
    return 'Window';
  }
}
