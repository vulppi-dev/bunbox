import {
  cstr,
  SDL,
  SDL_DisplayMode,
  SDL_Event,
  SDL_EventType,
  SDL_GPUShaderFormat,
  SDL_Locale,
  SDL_SystemTheme,
  SDL_WindowFlags,
} from '@bunbox/sdl3';
import { promiseDelay } from '@vulppi/toolbelt';
import { read, type Pointer } from 'bun:ffi';
import { WINDOW_FEATURES_MAP } from '../constants';
import { Event, LocaleEvent, QuitEvent, ThemeEvent } from '../events';
import { Vector2 } from '../math';
import { POINTERS_MAP } from '../stores/global';
import type { WindowsFeature, WindowsFeaturesOptions } from '../types';
import { pointerToBuffer } from '../utils/buffer';
import { getChildrenStack } from '../utils/node';
import type { App } from './App';
import { Node } from './Node';

export type WindowOptions = {
  app: App;
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
  #app: App;

  #features: WindowsFeaturesOptions;
  #stack: Node[] = [];

  #displayMode: SDL_DisplayMode;
  #width: Int32Array;
  #height: Int32Array;
  #x: Int32Array;
  #y: Int32Array;

  #eventStruct = new SDL_Event();

  constructor({ app, title, height, width, features }: WindowOptions) {
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

    this.#app = app;
    this.#winPtr = winPointer;
    POINTERS_MAP.set(this.id, this.#winPtr);

    this.#displayMode = new SDL_DisplayMode();
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);
    this.#x = new Int32Array(1);
    this.#y = new Int32Array(1);

    SDL.SDL_GetWindowSizeInPixels(this.#winPtr, this.#width, this.#height);
    SDL.SDL_GetWindowPosition(this.#winPtr, this.#x, this.#y);

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
      this.#stack = getChildrenStack(this, Node);
    });
    this.on('remove-child', () => {
      this.#stack = getChildrenStack(this, Node);
    });

    const unsubApp = app.subscribe('dispose', () => {
      this.dispose();
    });

    this.on('dispose', () => {
      unsubApp();
      POINTERS_MAP.delete(`${this.id}-device`);
      POINTERS_MAP.delete(this.id);
      SDL.SDL_ReleaseWindowFromGPUDevice(this.#devicePtr, this.#winPtr);
      SDL.SDL_DestroyGPUDevice(this.#devicePtr);
      SDL.SDL_DestroyWindow(this.#winPtr);
    });

    this.#startEventLooper();
    this.#startProcessLooper();
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

  async #startEventLooper() {
    while (!this.isDisposed) {
      while (SDL.SDL_PollEvent(this.#eventStruct.bunPointer)) {
        this.#dispatchEvent();
      }
      await promiseDelay(1);
    }
  }

  async #startProcessLooper() {
    let now = performance.now();
    let prev = now;
    let delta = 0;
    let processTime = 0;

    this.#processDisplayMode();

    while (!this.isDisposed) {
      now = performance.now();
      delta = now - prev;

      const processMaxTime = 1000 / this.getCurrentDisplayFrameRate();
      if (processTime >= processMaxTime) {
        this.#callProcessStack(processTime);
        processTime = 0;
      } else {
        processTime += delta;
      }

      this.#callStaticProcessStack(delta);

      prev = now;
      await promiseDelay(1);
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

  #dispatchEvent() {
    const type = this.#eventStruct.properties.type;
    const now = this.#app.timestamp;
    const timestampToDate = (t: bigint) =>
      new Date(Number(t / 1_000_000n) + now);

    let event: Event | null = null;
    switch (type) {
      case SDL_EventType.SDL_EVENT_QUIT: {
        const evStruct = this.#eventStruct.properties.quit;
        event = new QuitEvent({
          type: 'quit',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_TERMINATING: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'terminating',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_LOW_MEMORY: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'lowMemory',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DID_ENTER_BACKGROUND: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'enterBackground',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DID_ENTER_FOREGROUND: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'enterForeground',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_LOCALE_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;
        const locales: SDL_Locale[] = [];
        const localeCount = new Int32Array(1);

        const pointers = SDL.SDL_GetPreferredLocales(localeCount);
        if (!pointers) break;
        for (let i = 0; i < localeCount[0]!; i++) {
          const pointer = read.ptr(pointers, i) as Pointer;
          if (!pointer) continue;
          const locale = new SDL_Locale();
          const buffer = pointerToBuffer(pointer, locale.size);
          locale.copy(buffer);
          locales.push(locale);
        }

        event = new LocaleEvent({
          type: 'locale',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          locales: locales.map((l) => ({
            country: l.properties.country,
            language: l.properties.language,
          })),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_SYSTEM_THEME_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;
        const theme = SDL.SDL_GetSystemTheme();

        event = new ThemeEvent({
          type: 'theme',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          mode:
            theme === SDL_SystemTheme.SDL_SYSTEM_THEME_DARK
              ? 'dark'
              : theme === SDL_SystemTheme.SDL_SYSTEM_THEME_LIGHT
                ? 'light'
                : 'system',
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_ORIENTATION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_MOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_DESKTOP_MODE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_FIRST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_LAST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_SHOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_HIDDEN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_EXPOSED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_RESIZED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_METAL_VIEW_RESIZED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MINIMIZED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MAXIMIZED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_RESTORED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOUSE_ENTER: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOUSE_LEAVE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_FOCUS_GAINED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_FOCUS_LOST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_CLOSE_REQUESTED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_HIT_TEST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_ICCPROF_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_SAFE_AREA_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_OCCLUDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_ENTER_FULLSCREEN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_LEAVE_FULLSCREEN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_DESTROYED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_HDR_STATE_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_FIRST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_LAST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_KEY_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_KEY_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_EDITING: {
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_INPUT: {
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYMAP_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYBOARD_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYBOARD_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_EDITING_CANDIDATES: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_BUTTON_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_BUTTON_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_WHEEL: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_AXIS_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_BALL_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_HAT_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_BUTTON_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_BUTTON_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_BATTERY_UPDATED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_UPDATE_COMPLETE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_AXIS_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_BUTTON_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_BUTTON_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_REMAPPED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_SENSOR_UPDATE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_UPDATE_COMPLETE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_STEAM_HANDLE_UPDATED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_CANCELED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_CLIPBOARD_UPDATE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_FILE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_TEXT: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_BEGIN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_COMPLETE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_POSITION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_SENSOR_UPDATE: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_PROXIMITY_IN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_PROXIMITY_OUT: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_BUTTON_DOWN: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_BUTTON_UP: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_MOTION: {
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_AXIS: {
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_ADDED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_REMOVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_APPROVED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_DENIED: {
        break;
      }
      case SDL_EventType.SDL_EVENT_RENDER_TARGETS_RESET: {
        break;
      }
      case SDL_EventType.SDL_EVENT_RENDER_DEVICE_RESET: {
        break;
      }
      case SDL_EventType.SDL_EVENT_RENDER_DEVICE_LOST: {
        break;
      }
      case SDL_EventType.SDL_EVENT_POLL_SENTINEL: {
        break;
      }
      case SDL_EventType.SDL_EVENT_USER: {
        break;
      }
      case SDL_EventType.SDL_EVENT_LAST: {
        break;
      }
    }

    if (!event) return;

    // @ts-ignore
    this.emit(event.type, event);

    for (const node of this.#stack) {
      // @ts-ignore
      node.emit(event.type, event);
    }

    // if (type === SDL_EventType.SDL_EVENT_QUIT) {
    //   this.dispose();
    //   return;
    // }

    // if (
    //   [
    //     SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_CHANGED,
    //     SDL_EventType.SDL_EVENT_WINDOW_RESIZED,
    //     SDL_EventType.SDL_EVENT_DISPLAY_ORIENTATION,
    //   ].includes(type)
    // ) {
    //   this.#processDisplayMode();
    // }

    // if (type === SDL_EventType.SDL_EVENT_KEY_DOWN) {
    //   const ev = this.#eventStruct.properties.key;
    //   if (ev.properties.scancode === SDL_Scancode.SDL_SCANCODE_ESCAPE) {
    //     this.dispose();
    //     return;
    //   }
    // }

    // SDL.SDL_GetWindowSizeInPixels(this.#winPtr, this.#width, this.#height);
    // TODO: handle more events

    // TODO: this.#processDisplayMode(); when display changed
  }
}
