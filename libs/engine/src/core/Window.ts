import { cstr, SDL, SDL_DisplayMode, SDL_WindowFlags } from '@bunbox/sdl3';
import type { Pointer } from 'bun:ffi';
import { Node } from '../abstract/Node';
import { POINTERS_MAP, RETAIN_MAP } from '../stores/global';
import { pointerToBuffer } from '../utils/buffer';
import type { App } from './App';

type WindowsFeatures = {
  alwaysOnTop?: boolean;
  borderless?: boolean;
  external?: boolean;
  fullscreen?: boolean;
  hidden?: boolean;
  highPixelDensity?: boolean;
  inputFocus?: boolean;
  keyboardGrabbed?: boolean;
  maximized?: boolean;
  minimized?: boolean;
  modal?: boolean;
  mouseCapture?: boolean;
  mouseFocus?: boolean;
  mouseGrabbed?: boolean;
  mouseRelativeMode?: boolean;
  notFocusable?: boolean;
  occluded?: boolean;
  popupMenu?: boolean;
  resizable?: boolean;
  tooltip?: boolean;
  transparent?: boolean;
  utility?: boolean;
};

export type WindowOptions = {
  app: App;
  title: string;
  /** @default 800 */
  width?: number;
  /** @default 600 */
  height?: number;
  x?: number;
  y?: number;
  features?: WindowsFeatures;
};
export class Window extends Node {
  #winPtr: Pointer;
  #features: WindowsFeatures;

  #displayMode: SDL_DisplayMode;

  constructor({ app, title, height, width, x, y, features }: WindowOptions) {
    super();
    const titleValue = cstr(title);
    RETAIN_MAP.set(`${this.id}-title`, titleValue);
    this.#features = features ?? {};
    const winPointer = SDL.SDL_CreateWindow(
      titleValue,
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

    this.on('dispose', () => {
      RETAIN_MAP.delete(`${this.id}-title`);
      POINTERS_MAP.delete(this.id);
      if (this.#winPtr) {
        SDL.SDL_DestroyWindow(this.#winPtr);
      }
    });
    app.on('dispose', () => {
      this.dispose();
    });
  }

  get title() {
    return SDL.SDL_GetWindowTitle(this.#winPtr).toString();
  }

  set title(value: string) {
    const titleValue = cstr(value);
    RETAIN_MAP.set(`${this.id}-title`, titleValue);
    SDL.SDL_SetWindowTitle(this.#winPtr, titleValue);
  }

  getDisplayFrameRate() {
    return this.#displayMode.properties.refresh_rate;
  }

  static #getFeaturesFlags(features: WindowsFeatures): number {
    let flags =
      process.platform === 'darwin'
        ? SDL_WindowFlags.SDL_WINDOW_METAL
        : SDL_WindowFlags.SDL_WINDOW_VULKAN;

    if (features.fullscreen) {
      flags |= SDL_WindowFlags.SDL_WINDOW_FULLSCREEN;
    }
    if (features.occluded) {
      flags |= SDL_WindowFlags.SDL_WINDOW_OCCLUDED;
    }
    if (features.hidden) {
      flags |= SDL_WindowFlags.SDL_WINDOW_HIDDEN;
    }
    if (features.borderless) {
      flags |= SDL_WindowFlags.SDL_WINDOW_BORDERLESS;
    }
    if (features.resizable) {
      flags |= SDL_WindowFlags.SDL_WINDOW_RESIZABLE;
    }
    if (features.minimized) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MINIMIZED;
    }
    if (features.maximized) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MAXIMIZED;
    }
    if (features.mouseGrabbed) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_GRABBED;
    }
    if (features.inputFocus) {
      flags |= SDL_WindowFlags.SDL_WINDOW_INPUT_FOCUS;
    }
    if (features.mouseFocus) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_FOCUS;
    }
    if (features.external) {
      flags |= SDL_WindowFlags.SDL_WINDOW_EXTERNAL;
    }
    if (features.modal) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MODAL;
    }
    if (features.highPixelDensity) {
      flags |= SDL_WindowFlags.SDL_WINDOW_HIGH_PIXEL_DENSITY;
    }
    if (features.mouseCapture) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_CAPTURE;
    }
    if (features.mouseRelativeMode) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_RELATIVE_MODE;
    }
    if (features.alwaysOnTop) {
      flags |= SDL_WindowFlags.SDL_WINDOW_ALWAYS_ON_TOP;
    }
    if (features.utility) {
      flags |= SDL_WindowFlags.SDL_WINDOW_UTILITY;
    }
    if (features.tooltip) {
      flags |= SDL_WindowFlags.SDL_WINDOW_TOOLTIP;
    }
    if (features.popupMenu) {
      flags |= SDL_WindowFlags.SDL_WINDOW_POPUP_MENU;
    }
    if (features.keyboardGrabbed) {
      flags |= SDL_WindowFlags.SDL_WINDOW_KEYBOARD_GRABBED;
    }
    if (features.transparent) {
      flags |= SDL_WindowFlags.SDL_WINDOW_TRANSPARENT;
    }
    if (features.notFocusable) {
      flags |= SDL_WindowFlags.SDL_WINDOW_NOT_FOCUSABLE;
    }

    return flags;
  }

  async startLooper() {
    let now = performance.now();
    let prev = 0;
    let delta = 0;
    let processTime = 0;
    const { promise, resolve } = Promise.withResolvers<void>();
    const tid = setInterval(() => {
      delta = now - prev;
      processTime += delta;

      this.#processDisplayMode();
      const processMaxTime = 1000 / this.getDisplayFrameRate();

      if (processTime >= processMaxTime) {
        this.#callProcessStack(processTime);
        processTime = 0;
      }

      this.#callStaticProcessStack(delta);

      prev = now;
      now = performance.now();
    }, 1);

    this.once('dispose', () => {
      clearInterval(tid);
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

  #getChildrenStack(parent: Node) {
    const stack: Node[] = [parent];
    for (const child of parent.children) {
      stack.push(...this.#getChildrenStack(child));
    }
    return stack;
  }

  #callProcessStack(delta: number) {
    const stack: Node[] = this.#getChildrenStack(this).sort(
      (a, b) => a.priority - b.priority,
    );

    for (const node of stack) {
      node._process(delta);
    }
  }

  #callStaticProcessStack(delta: number) {
    const stack: Node[] = this.#getChildrenStack(this).sort(
      (a, b) => a.priority - b.priority,
    );

    for (const node of stack) {
      node._processStatic(delta);
    }
  }
}
