import { cstr, SDL, SDL_WindowFlags } from '@bunbox/sdl3';
import { EventEmitter } from '../abstract/EventEmitter';
import type { App } from './App';
import type { Pointer } from 'bun:ffi';
import { RETAIN_MAP } from '../utils/retain';

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

type WindowEvents = {};

export class Window extends EventEmitter<WindowEvents> {
  #features: WindowsFeatures;
  #winPtr: Pointer;

  constructor({ app, title, height, width, x, y, features }: WindowOptions) {
    super();
    const titleValue = cstr(title);
    RETAIN_MAP.set(`${this.id}-title`, titleValue);
    this.#features = features ?? {};
    const winPointer = SDL.SDL_CreateWindow(
      titleValue,
      width ?? 800,
      height ?? 600,
      this.#getFeaturesFlags(),
    );

    if (!winPointer) {
      throw new Error('Failed to create window');
    }

    this.#winPtr = winPointer;

    if (x != null || y != null) {
      SDL.SDL_SetWindowPosition(this.#winPtr, x ?? 0, y ?? 0);
    }

    this.on('dispose', () => {
      RETAIN_MAP.delete(`${this.id}-title`);
      if (this.#winPtr) {
        SDL.SDL_DestroyWindow(this.#winPtr);
      }
    });
    app.on('dispose', () => {
      this.dispose();
    });
  }
  #getFeaturesFlags(): number {
    let flags =
      process.platform === 'darwin'
        ? SDL_WindowFlags.SDL_WINDOW_METAL
        : SDL_WindowFlags.SDL_WINDOW_VULKAN;

    if (this.#features.fullscreen) {
      flags |= SDL_WindowFlags.SDL_WINDOW_FULLSCREEN;
    }
    if (this.#features.occluded) {
      flags |= SDL_WindowFlags.SDL_WINDOW_OCCLUDED;
    }
    if (this.#features.hidden) {
      flags |= SDL_WindowFlags.SDL_WINDOW_HIDDEN;
    }
    if (this.#features.borderless) {
      flags |= SDL_WindowFlags.SDL_WINDOW_BORDERLESS;
    }
    if (this.#features.resizable) {
      flags |= SDL_WindowFlags.SDL_WINDOW_RESIZABLE;
    }
    if (this.#features.minimized) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MINIMIZED;
    }
    if (this.#features.maximized) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MAXIMIZED;
    }
    if (this.#features.mouseGrabbed) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_GRABBED;
    }
    if (this.#features.inputFocus) {
      flags |= SDL_WindowFlags.SDL_WINDOW_INPUT_FOCUS;
    }
    if (this.#features.mouseFocus) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_FOCUS;
    }
    if (this.#features.external) {
      flags |= SDL_WindowFlags.SDL_WINDOW_EXTERNAL;
    }
    if (this.#features.modal) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MODAL;
    }
    if (this.#features.highPixelDensity) {
      flags |= SDL_WindowFlags.SDL_WINDOW_HIGH_PIXEL_DENSITY;
    }
    if (this.#features.mouseCapture) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_CAPTURE;
    }
    if (this.#features.mouseRelativeMode) {
      flags |= SDL_WindowFlags.SDL_WINDOW_MOUSE_RELATIVE_MODE;
    }
    if (this.#features.alwaysOnTop) {
      flags |= SDL_WindowFlags.SDL_WINDOW_ALWAYS_ON_TOP;
    }
    if (this.#features.utility) {
      flags |= SDL_WindowFlags.SDL_WINDOW_UTILITY;
    }
    if (this.#features.tooltip) {
      flags |= SDL_WindowFlags.SDL_WINDOW_TOOLTIP;
    }
    if (this.#features.popupMenu) {
      flags |= SDL_WindowFlags.SDL_WINDOW_POPUP_MENU;
    }
    if (this.#features.keyboardGrabbed) {
      flags |= SDL_WindowFlags.SDL_WINDOW_KEYBOARD_GRABBED;
    }
    if (this.#features.transparent) {
      flags |= SDL_WindowFlags.SDL_WINDOW_TRANSPARENT;
    }
    if (this.#features.notFocusable) {
      flags |= SDL_WindowFlags.SDL_WINDOW_NOT_FOCUSABLE;
    }

    return flags;
  }
}
