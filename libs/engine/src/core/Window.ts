import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_GPUShaderFormat,
  SDL_InitFlags,
  SDL_WindowFlags,
} from '@bunbox/sdl3';
import { type Pointer } from 'bun:ffi';
import { USING_VULKAN, WINDOW_FEATURES_MAP } from '../constants';
import { Vector2 } from '../math';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { getChildrenStack } from '../utils/node';
import { Node } from './Node';

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

  #features: WindowsFeaturesOptions;
  #stack: Node[] = [];

  #displayMode: SDL_DisplayMode;
  #width: Int32Array;
  #height: Int32Array;
  #x: Int32Array;
  #y: Int32Array;

  #processDelayCount: number;

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
    this.#processDelayCount = 0;

    SDL.SDL_GetWindowSizeInPixels(this.#winPtr, this.#width, this.#height);
    SDL.SDL_GetWindowPosition(this.#winPtr, this.#x, this.#y);
    this.#processDisplayMode();

    const devicePtr = SDL.SDL_CreateGPUDevice(
      USING_VULKAN
        ? SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV
        : SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_METALLIB,
      true,
      cstr(USING_VULKAN ? 'vulkan' : 'metal'),
    );

    if (!devicePtr) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    this.#devicePtr = devicePtr;
    POINTERS_MAP.set(`${this.id}-device`, this.#devicePtr);

    if (!SDL.SDL_ClaimWindowForGPUDevice(this.#devicePtr, this.#winPtr)) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.#stack = getChildrenStack(this, Node);
      }),
      this.subscribe('remove-child', () => {
        this.#stack = getChildrenStack(this, Node);
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
      POINTERS_MAP.delete(`${this.id}-device`);
      POINTERS_MAP.delete(this.id);
      SDL.SDL_ReleaseWindowFromGPUDevice(this.#devicePtr, this.#winPtr);
      SDL.SDL_DestroyGPUDevice(this.#devicePtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });
  }

  protected override _getType(): string {
    return 'Window';
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

  getCurrentDisplayFrameRate() {
    return Math.max(this.#displayMode.properties.refresh_rate, 24);
  }

  getCurrentDisplaySize() {
    return new Vector2(
      this.#displayMode.properties.w,
      this.#displayMode.properties.h,
    );
  }

  override _afterProcess(deltaTime: number): void {
    this.#processDelayCount += deltaTime;
    const rate = this.getCurrentDisplayFrameRate();
    const delay = 1000 / rate;
    if (this.#processDelayCount >= delay) {
      this.#callRenderStack(this.#processDelayCount);
      this.#processDelayCount = 0;
    }
  }

  async #callRenderStack(delta: number) {
    for (const node of this.#stack) {
      node._beforeRender(delta);
    }
    for (const node of this.#stack) {
      node._render(delta);
    }
    for (const node of this.#stack) {
      node._afterRender(delta);
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

  static #getFeaturesFlags(features: WindowsFeaturesOptions): number {
    let flags = USING_VULKAN
      ? SDL_WindowFlags.SDL_WINDOW_VULKAN
      : SDL_WindowFlags.SDL_WINDOW_METAL;
    for (const [key, value] of Object.entries(features)) {
      flags |= value ? (WINDOW_FEATURES_MAP[key as WindowsFeature] ?? 0) : 0;
    }

    return flags;
  }
}
