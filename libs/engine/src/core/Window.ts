import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_Event,
  SDL_EventType,
  SDL_GPUShaderFormat,
  SDL_Scancode,
  SDL_WindowFlags,
} from '@bunbox/sdl3';
import type { Pointer } from 'bun:ffi';
import { WINDOW_FEATURES_MAP } from '../constants';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import type { App } from './App';
import { Node } from './Node';
import { getChildrenStack } from '../utils/node';

export type WindowOptions = {
  app: App;
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  x?: number;
  y?: number;
  features?: WindowsFeaturesOptions;
};
export class Window extends Node {
  #winPtr: Pointer;
  #devicePtr: Pointer;

  #features: WindowsFeaturesOptions;
  #running = false;
  #stack: Node[] = [];

  #displayMode: SDL_DisplayMode;

  #eventStruct = new SDL_Event();

  constructor({ app, title, height, width, x, y, features }: WindowOptions) {
    super();
    this.#features = features ?? {};
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
    POINTERS_MAP.set(this.id, this.#winPtr);

    if (x != null || y != null) {
      SDL.SDL_SetWindowPosition(this.#winPtr, x ?? 0, y ?? 0);
    }

    this.#displayMode = new SDL_DisplayMode();
    const devicePtr = SDL.SDL_CreateGPUDevice(
      process.platform === 'darwin'
        ? SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_METALLIB
        : SDL_GPUShaderFormat.SDL_GPU_SHADERFORMAT_SPIRV,
      true,
      cstr(process.platform === 'darwin' ? 'metal' : 'vulkan'),
    );

    if (!devicePtr) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    this.#devicePtr = devicePtr;
    POINTERS_MAP.set(`${this.id}-device`, this.#devicePtr);

    if (!SDL.SDL_ClaimWindowForGPUDevice(this.#devicePtr, this.#winPtr)) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }

    this.on('add-child', () => {
      if (!this.#running) return;
      this.#stack = getChildrenStack(this);
    });
    this.on('remove-child', () => {
      if (!this.#running) return;
      this.#stack = getChildrenStack(this);
    });

    this.on('dispose', () => {
      POINTERS_MAP.delete(`${this.id}-device`);
      POINTERS_MAP.delete(this.id);
      SDL.SDL_DestroyGPUDevice(this.#devicePtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });
    app.on('dispose', () => {
      this.dispose();
    });
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

  getDisplayFrameRate() {
    return Math.max(this.#displayMode.properties.refresh_rate, 24);
  }

  static #getFeaturesFlags(features: WindowsFeaturesOptions): number {
    let flags =
      process.platform === 'darwin'
        ? SDL_WindowFlags.SDL_WINDOW_METAL
        : SDL_WindowFlags.SDL_WINDOW_VULKAN;
    for (const [key, value] of Object.entries(features)) {
      flags |= value ? (WINDOW_FEATURES_MAP[key as WindowsFeature] ?? 0) : 0;
    }

    return flags;
  }

  async startLooper() {
    if (this.isDisposed) {
      throw new Error('Window is disposed');
    }
    if (this.#running) return;
    this.#running = true;
    this.#stack = getChildrenStack(this);

    let now = performance.now();
    let prev = now;
    let delta = 0;
    let processTime = 0;
    const { promise, resolve } = Promise.withResolvers<void>();

    this.#processDisplayMode();

    const looper = () => {
      if (this.isDisposed || !this.#running) return;

      now = performance.now();
      delta = now - prev;

      while (SDL.SDL_PollEvent(this.#eventStruct.bunPointer)) {
        const type = this.#eventStruct.properties.type;
        if (type === SDL_EventType.SDL_EVENT_QUIT) {
          this.dispose();
          return;
        }

        if (
          [
            SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_CHANGED,
            SDL_EventType.SDL_EVENT_WINDOW_RESIZED,
            SDL_EventType.SDL_EVENT_DISPLAY_ORIENTATION,
          ].includes(type)
        ) {
          this.#processDisplayMode();
        }

        if (type === SDL_EventType.SDL_EVENT_KEY_DOWN) {
          const ev = this.#eventStruct.properties.key;
          if (ev.properties.scancode === SDL_Scancode.SDL_SCANCODE_ESCAPE) {
            this.dispose();
            return;
          }
        }
        // TODO: handle more events

        // TODO: this.#processDisplayMode(); when display changed
      }

      const processMaxTime = 1000 / this.getDisplayFrameRate();
      if (processTime >= processMaxTime) {
        this.#callProcessStack(processTime);
        processTime = 0;
      } else {
        processTime += delta;
      }

      this.#callStaticProcessStack(delta);

      prev = now;
      setTimeout(looper, 1);
    };

    setTimeout(looper, 1);

    this.once('dispose', () => {
      this.#running = false;
      resolve();
    });

    return promise;
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

  #callProcessStack(delta: number) {
    for (const node of this.#stack) {
      node._beforeProcess(delta);
    }
    for (const node of this.#stack) {
      node._process(delta);
    }
    for (const node of this.#stack) {
      node._afterProcess(delta);
    }
  }

  #callStaticProcessStack(delta: number) {
    for (const node of this.#stack) {
      node._beforeProcessStatic(delta);
    }
    for (const node of this.#stack) {
      node._processStatic(delta);
    }
    for (const node of this.#stack) {
      node._afterProcessStatic(delta);
    }
  }
}
