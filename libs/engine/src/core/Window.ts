import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_FColor,
  SDL_GPUColorTargetInfo,
  SDL_GPULoadOp,
  SDL_GPUShaderFormat,
  SDL_GPUStoreOp,
  SDL_InitFlags,
  SDL_WindowFlags,
} from '@bunbox/sdl3';
import { type Pointer } from 'bun:ffi';
import { USING_VULKAN, WINDOW_FEATURES_MAP } from '../constants';
import { Color, Vector2 } from '../math';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { getChildrenStack } from '../utils/node';
import { Node } from './Node';
import { Mesh } from '../nodes/Mesh';

export type WindowOptions = {
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  features?: WindowsFeaturesOptions;
};

export class Window extends Node {
  #winPtr: Pointer;
  #devicePtr: Pointer;
  #winId: number;
  #background: 'vulkan' | 'metal' = 'vulkan';
  #swapFormat: number = 0;
  #viewportFactor: number;

  #features: WindowsFeaturesOptions;
  #stack: Node[] = [];
  #meshStack: Mesh[] = [];
  // #lightStack: Node[] = [];

  #displayMode: SDL_DisplayMode;
  #width: Int32Array;
  #height: Int32Array;
  #x: Int32Array;
  #y: Int32Array;
  #clearColor = new Color();

  // Helpers
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
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);
    this.#x = new Int32Array(1);
    this.#y = new Int32Array(1);
    this.#renderDelayCount = 0;

    this.#background = USING_VULKAN ? 'vulkan' : 'metal';
    this.#viewportFactor = USING_VULKAN ? -1 : 1;
    const devicePtr = SDL.SDL_CreateGPUDevice(
      USING_VULKAN
        ? SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV
        : SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_METALLIB,
      true,
      cstr(this.#background),
    );

    if (!devicePtr) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    this.#devicePtr = devicePtr;
    POINTERS_MAP.set(`${this.id}-device`, this.#devicePtr);

    if (!SDL.SDL_ClaimWindowForGPUDevice(this.#devicePtr, this.#winPtr)) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    SDL.SDL_GetWindowSizeInPixels(this.#winPtr, this.#width, this.#height);
    SDL.SDL_GetWindowPosition(this.#winPtr, this.#x, this.#y);
    this.#processDisplayMode();
    this.#swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(
      this.#devicePtr,
      this.#winPtr,
    );

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.#stack = getChildrenStack(this, Node);
        this.#meshStack = getChildrenStack(this, Mesh);
      }),
      this.subscribe('remove-child', () => {
        this.#stack = getChildrenStack(this, Node);
        this.#meshStack = getChildrenStack(this, Mesh);
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
      POINTERS_MAP.delete(`${this.id}-device`);
      POINTERS_MAP.delete(this.id);
      SDL.SDL_ReleaseWindowFromGPUDevice(this.#devicePtr, this.#winPtr);
      SDL.SDL_DestroyGPUDevice(this.#devicePtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });

    this.#stack = getChildrenStack(this, Node);
    this.#meshStack = getChildrenStack(this, Mesh);
  }

  protected override _getType(): string {
    return 'Window';
  }

  get windowId() {
    return SDL.SDL_GetWindowID(this.#winPtr);
  }

  get title() {
    return SDL.SDL_GetWindowTitle(this.#winPtr).toString();
  }

  set title(value: string) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    SDL.SDL_SetWindowTitle(this.#winPtr, cstr(value));
  }

  get width() {
    return this.#width[0]!;
  }

  set width(value: number) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    this.#width[0] = value;
    SDL.SDL_SetWindowSize(this.#winPtr, this.#width[0], this.#height[0]!);
  }

  get height() {
    return this.#height[0]!;
  }

  set height(value: number) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    this.#height[0] = value;
    SDL.SDL_SetWindowSize(this.#winPtr, this.#width[0]!, this.#height[0]);
  }

  get x() {
    return this.#x[0]!;
  }

  set x(value: number) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    this.#x[0] = value;
    SDL.SDL_SetWindowPosition(this.#winPtr, this.#x[0], this.#y[0]!);
  }

  get y() {
    return this.#y[0]!;
  }

  set y(value: number) {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    this.#y[0] = value;
    SDL.SDL_SetWindowPosition(this.#winPtr, this.#x[0]!, this.#y[0]);
  }

  get clearColor() {
    return this.#clearColor;
  }

  set clearColor(value: Color) {
    this.#clearColor = value;
    this.#clearColor.markAsDirty();
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
    const rate = this.getCurrentDisplayFrameRate();
    const delay = 1000 / rate;
    if (this.#renderDelayCount >= delay) {
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

  async #callRenderStack(delta: number) {
    for (const node of this.#stack) {
      node._update(delta);
    }
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

    let success = SDL.SDL_AcquireGPUSwapchainTexture(
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

    SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
    this.#currentCmd = null;
    const err = SDL.SDL_GetError().toString();
    if (err) console.log('[SDL ERROR]', err);
  }
}
