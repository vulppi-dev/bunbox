import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_FColor,
  SDL_GPUColorTargetInfo,
  SDL_GPULoadOp,
  SDL_GPUStoreOp,
  SDL_InitFlags,
  SDL_WindowFlags,
} from '@bunbox/sdl3';
import { type Pointer } from 'bun:ffi';
import {
  POINTER_KEY_DEVICE,
  USING_VULKAN,
  WINDOW_FEATURES_MAP,
} from '../constants';
import { Color, Vector2 } from '../math';
import { Viewport } from '../nodes';
import { Mesh } from '../nodes/Mesh';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { Node } from './Node';

export type WindowOptions = {
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  features?: WindowsFeaturesOptions;
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
  // #lightStack: Node[] = [];
  #scheduleDirty: boolean = true;

  #clearColor = new Color();

  // Helpers
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

  #renderDelayCount: number;

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

    this.traverse((n) => {
      if (n instanceof Node) {
        nextStack.push(n);
      }
      if (n instanceof Mesh) {
        nextMeshStack.push(n);
      }
    });

    this.#stack = nextStack;
    this.#meshStack = nextMeshStack;
    this.#scheduleDirty = false;
  }

  #callRenderStack(delta: number) {
    if (this.#scheduleDirty) {
      this.#rebuildStacks();
    }

    for (const node of this.#stack) node._update(delta);
    this.#render();
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

    this.#clearScreen();

    // TODO: render children
    for (const mesh of this.#meshStack) {
      // TODO: Default material
      const material = mesh.material;
      if (!material) continue;
    }

    // TODO: post process

    SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
    this.#currentCmd = null;
    const err = SDL.SDL_GetError().toString();
    if (err) console.log('[SDL ERROR]', err);
  }

  protected override _getType(): string {
    return 'Window';
  }
}
