import {
  cstr,
  SDL,
  SDL_DisplayOrientation,
  SDL_Event,
  SDL_EventType,
  SDL_GamepadAxis,
  SDL_InitFlags,
  SDL_Keymod,
  SDL_Locale,
  SDL_MouseWheelDirection,
  SDL_PowerState,
  SDL_Rect,
  SDL_SensorType,
  SDL_SystemTheme,
} from '@bunbox/sdl3';
import {
  APP_FEATURES_MAP,
  APP_LOG_CATEGORY_MAP,
  APP_LOG_PRIORITY_MAP,
} from '../constants';
import type { AppFeature, AppLogCategory, AppLogPriority } from '../types';
import { Node } from './Node';
import { promiseDelay } from '@vulppi/toolbelt';
import { getChildrenStack } from '../utils/node';
import {
  ClipboardEvent,
  DeviceEvent,
  DisplayEvent,
  DropEvent,
  Event,
  GamepadAxisEvent,
  GamepadBatteryEvent,
  GamepadButtonEvent,
  GamepadSensorEvent,
  KeyEvent,
  LocaleEvent,
  PointerEvent,
  QuitEvent,
  TextEvent,
  ThemeEvent,
  WindowEvent,
  type DisplayOrientation,
} from '../events';
import { CString, read, type Pointer } from 'bun:ffi';
import { pointerToBuffer } from '../utils/buffer';
import { Rect, Vector3 } from '../math';

export type AppOptions = {
  /**
   * 'video' and 'events' are always enabled.
   */
  features?: AppFeature[];
  name?: string;
  version?: string;
  identifier?: string;
};

declare global {
  const appInstance: InstanceType<typeof App>;
}

function getSensorType(sensor: SDL_SensorType) {
  switch (sensor) {
    case SDL_SensorType.SDL_SENSOR_ACCEL:
      return 'accelerometer';
    case SDL_SensorType.SDL_SENSOR_GYRO:
      return 'gyroscope';
    case SDL_SensorType.SDL_SENSOR_ACCEL_L:
      return 'leftAccelerometer';
    case SDL_SensorType.SDL_SENSOR_GYRO_L:
      return 'leftGyroscope';
    case SDL_SensorType.SDL_SENSOR_ACCEL_R:
      return 'rightAccelerometer';
    case SDL_SensorType.SDL_SENSOR_GYRO_R:
      return 'rightGyroscope';
    default:
      return 'unknown';
  }
}

export class App extends Node {
  static #singleAppInstance: App | null = null;

  #stack: Node[] = [];

  #epochOffsetMs: number;
  #eventStruct: SDL_Event;

  constructor(options?: AppOptions) {
    super();

    if (App.#singleAppInstance) {
      throw new Error(
        'App instance already exists. Only one instance is allowed.',
      );
    }

    const {
      name = 'Bunbox App',
      version = '1.0.0',
      identifier = 'dev.vulppi.bunbox.app',
      features = [],
    } = options || {};

    let flags = SDL_InitFlags.SDL_INIT_VIDEO | SDL_InitFlags.SDL_INIT_EVENTS;
    for (const feature of features) {
      flags |= APP_FEATURES_MAP[feature] ?? 0;
    }

    // Initialize SDL with the specified flags
    const result = SDL.SDL_Init(flags);
    if (!result) {
      throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    }
    this.#epochOffsetMs =
      Date.now() - Number(SDL.SDL_GetTicksNS() / 1_000_000n);
    this.#eventStruct = new SDL_Event();

    SDL.SDL_SetAppMetadata(cstr(name), cstr(version), cstr(identifier));
    SDL.SDL_SetHint(cstr('SDL_LOGGING'), cstr('test=verbose,*=info'));

    const unsubAddChild = this.subscribe('add-child', () => {
      this.#stack = getChildrenStack(this, Node);
    });
    const unsubRemoveChild = this.subscribe('remove-child', () => {
      this.#stack = getChildrenStack(this, Node);
    });

    App.#singleAppInstance = this;

    this.on('dispose', () => {
      unsubAddChild();
      unsubRemoveChild();
      this.#stack = [];
      SDL.SDL_Quit();
      App.#singleAppInstance = null;
    });

    process.on('exit', () => {
      this.dispose();
    });

    Object.defineProperty(globalThis, 'appInstance', {
      value: this,
      writable: false,
      configurable: false,
      enumerable: true,
    });

    this.#stack = getChildrenStack(this, Node);
    this.#startEventLooper();
    this.#startProcessLooper();
  }

  protected override _getType(): string {
    return 'App';
  }

  get epochOffsetMs() {
    return this.#epochOffsetMs;
  }

  get now() {
    const time = Number(SDL.SDL_GetTicksNS() / 1_000_000n);
    return this.#epochOffsetMs + time;
  }

  setLogPriority(priority: AppLogPriority) {
    SDL.SDL_SetLogPriorities(APP_LOG_PRIORITY_MAP[priority]);
  }

  setCategoryLogPriority(category: AppLogCategory, priority: AppLogPriority) {
    SDL.SDL_SetLogPriority(
      APP_LOG_CATEGORY_MAP[category],
      APP_LOG_PRIORITY_MAP[priority],
    );
  }

  getLocales() {
    const locales: SDL_Locale[] = [];
    const localeCount = new Int32Array(1);

    const pointers = SDL.SDL_GetPreferredLocales(localeCount);
    try {
      if (!pointers) return [];
      for (let i = 0; i < localeCount[0]!; i++) {
        const pointer = read.ptr(pointers, i) as Pointer;
        if (!pointer) continue;
        const locale = new SDL_Locale();
        const buffer = pointerToBuffer(pointer, locale.size);
        locale.copy(buffer);
        locales.push(locale);
      }
    } catch (_) {
    } finally {
      SDL.SDL_free(pointers);
    }

    return locales.map((l) => ({
      country: l.properties.country,
      language: l.properties.language,
    }));
  }

  getTheme() {
    const theme = SDL.SDL_GetSystemTheme();
    return theme === SDL_SystemTheme.SDL_SYSTEM_THEME_DARK
      ? 'dark'
      : theme === SDL_SystemTheme.SDL_SYSTEM_THEME_LIGHT
        ? 'light'
        : 'system';
  }

  getDisplayOrientation(displayId: number): DisplayOrientation {
    const orientation = SDL.SDL_GetCurrentDisplayOrientation(displayId);
    switch (orientation) {
      case SDL_DisplayOrientation.SDL_ORIENTATION_LANDSCAPE:
        return 'landscape';
      case SDL_DisplayOrientation.SDL_ORIENTATION_LANDSCAPE_FLIPPED:
        return 'landscape-flipped';
      case SDL_DisplayOrientation.SDL_ORIENTATION_PORTRAIT:
        return 'portrait';
      case SDL_DisplayOrientation.SDL_ORIENTATION_PORTRAIT_FLIPPED:
        return 'portrait-flipped';
      case SDL_DisplayOrientation.SDL_ORIENTATION_UNKNOWN:
      default:
        return 'unknown';
    }
  }

  getDisplayBoundRect(displayId: number) {
    const rect = new SDL_Rect();
    SDL.SDL_GetDisplayBounds(displayId, rect.bunPointer);
    return new Rect(
      rect.properties.x,
      rect.properties.y,
      rect.properties.w,
      rect.properties.h,
    );
  }

  getWindowBoundRect(windowId: number) {
    const window = SDL.SDL_GetWindowFromID(windowId);
    const x = new Int32Array(1);
    const y = new Int32Array(1);
    const w = new Int32Array(1);
    const h = new Int32Array(1);
    SDL.SDL_GetWindowPosition(window, x, y);
    SDL.SDL_GetWindowSizeInPixels(window, w, h);
    return new Rect(x[0]!, y[0]!, w[0]!, h[0]!);
  }

  #helperTimestampToDate(t: bigint) {
    const now = this.epochOffsetMs;
    return new Date(Number(t / 1_000_000n) + now);
  }

  async #startEventLooper() {
    while (!this.isDisposed) {
      try {
        const got = SDL.SDL_WaitEventTimeout(this.#eventStruct.bunPointer, 8);
        if (got) this.#dispatchEvent();
      } catch (error) {
        console.error('Error while polling events:', error);
      }
      await promiseDelay(1);
    }
  }

  async #startProcessLooper() {
    let now = performance.now();
    let prev = now;
    let delta = 0;

    while (!this.isDisposed) {
      now = performance.now();
      delta = now - prev;

      this.#callProcessStack(delta);

      prev = now;
      await promiseDelay(1);
    }
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

  #dispatchEvent() {
    const type = this.#eventStruct.properties.type;
    const now = this.epochOffsetMs;

    let event: Event | null = null;
    switch (type) {
      case SDL_EventType.SDL_EVENT_QUIT: {
        const evStruct = this.#eventStruct.properties.quit;
        event = new QuitEvent({
          type: 'quit',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_TERMINATING: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'terminating',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_LOW_MEMORY: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'lowMemory',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DID_ENTER_BACKGROUND: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'enterBackground',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DID_ENTER_FOREGROUND: {
        const evStruct = this.#eventStruct.properties.common;
        event = new Event({
          type: 'enterForeground',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_LOCALE_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;

        event = new LocaleEvent({
          type: 'locale',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          locales: this.getLocales(),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_SYSTEM_THEME_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;

        event = new ThemeEvent({
          type: 'theme',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          mode: this.getTheme(),
        });
        break;
      }
      // MARK: Display events
      case SDL_EventType.SDL_EVENT_DISPLAY_ORIENTATION: {
        const evStruct = this.#eventStruct.properties.display;
        const rect = this.getDisplayBoundRect(evStruct.properties.displayID);

        event = new DisplayEvent({
          type: 'orientation',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          displayId: evStruct.properties.displayID,
          orientation: this.getDisplayOrientation(
            evStruct.properties.displayID,
          ),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_ADDED: {
        const evStruct = this.#eventStruct.properties.display;
        const rect = this.getDisplayBoundRect(evStruct.properties.displayID);

        event = new DisplayEvent({
          type: 'displayAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          displayId: evStruct.properties.displayID,
          orientation: this.getDisplayOrientation(
            evStruct.properties.displayID,
          ),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_REMOVED: {
        const evStruct = this.#eventStruct.properties.display;

        event = new DisplayEvent({
          type: 'displayRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          displayId: evStruct.properties.displayID,
          orientation: 'unknown',
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_MOVED: {
        const evStruct = this.#eventStruct.properties.display;
        const rect = this.getDisplayBoundRect(evStruct.properties.displayID);

        event = new DisplayEvent({
          type: 'displayMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          displayId: evStruct.properties.displayID,
          orientation: this.getDisplayOrientation(
            evStruct.properties.displayID,
          ),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_DESKTOP_MODE_CHANGED:
      case SDL_EventType.SDL_EVENT_DISPLAY_CURRENT_MODE_CHANGED:
      case SDL_EventType.SDL_EVENT_DISPLAY_CONTENT_SCALE_CHANGED: {
        const evStruct = this.#eventStruct.properties.display;
        const rect = this.getDisplayBoundRect(evStruct.properties.displayID);

        event = new DisplayEvent({
          type: 'displayChange',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          displayId: evStruct.properties.displayID,
          orientation: this.getDisplayOrientation(
            evStruct.properties.displayID,
          ),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      // MARK: Window events
      case SDL_EventType.SDL_EVENT_WINDOW_SHOWN:
      case SDL_EventType.SDL_EVENT_WINDOW_EXPOSED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowShown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_HIDDEN:
      case SDL_EventType.SDL_EVENT_WINDOW_OCCLUDED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowHidden',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOVED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_RESIZED:
      case SDL_EventType.SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED:
      case SDL_EventType.SDL_EVENT_WINDOW_METAL_VIEW_RESIZED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowResize',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MINIMIZED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowMinimized',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MAXIMIZED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowMaximized',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_RESTORED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowRestored',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOUSE_ENTER: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowPointerEnter',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_MOUSE_LEAVE: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowPointerLeave',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_FOCUS_GAINED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowFocus',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_FOCUS_LOST: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowBlur',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_CLOSE_REQUESTED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowClose',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_CHANGED:
      case SDL_EventType.SDL_EVENT_WINDOW_DISPLAY_SCALE_CHANGED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowDisplayChange',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_SAFE_AREA_CHANGED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowSafeArea',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_ENTER_FULLSCREEN: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowFullscreenEnter',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_LEAVE_FULLSCREEN: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowFullscreenLeave',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_WINDOW_DESTROYED: {
        const evStruct = this.#eventStruct.properties.window;

        event = new WindowEvent({
          type: 'windowDestroy',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: -1,
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        });
        break;
      }
      // MARK: Keyboard events
      case SDL_EventType.SDL_EVENT_KEY_DOWN: {
        const evStruct = this.#eventStruct.properties.key;

        event = new KeyEvent({
          type: 'keyDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          code: evStruct.properties.scancode,
          key: evStruct.properties.key,
          repeat: Boolean(evStruct.properties.repeat),
          shift: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_SHIFT),
          ctrl: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_CTRL),
          alt: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_ALT),
          meta: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_GUI),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEY_UP: {
        const evStruct = this.#eventStruct.properties.key;

        event = new KeyEvent({
          type: 'keyUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          code: evStruct.properties.scancode,
          key: evStruct.properties.key,
          repeat: Boolean(evStruct.properties.repeat),
          shift: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_SHIFT),
          ctrl: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_CTRL),
          alt: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_ALT),
          meta: Boolean(evStruct.properties.mod & SDL_Keymod.SDL_KMOD_GUI),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_EDITING: {
        const evStruct = this.#eventStruct.properties.edit;

        event = new TextEvent({
          type: 'textEditing',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowID: evStruct.properties.windowID,
          text: evStruct.properties.text,
          start: evStruct.properties.start,
          length: evStruct.properties.length,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_EDITING_CANDIDATES: {
        const evStruct = this.#eventStruct.properties.edit_candidates;
        const candidates: string[] = [];

        for (let i = 0; i < evStruct.properties.num_candidates; i++) {
          const ptr = read.ptr(
            Number(evStruct.properties.candidates as bigint) as Pointer,
            i,
          ) as Pointer;
          if (!ptr) {
            candidates.push('');
          } else {
            candidates.push(new CString(ptr).toString());
          }
        }

        event = new TextEvent({
          type: 'textEditingCandidates',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowID: evStruct.properties.windowID,
          text: candidates[evStruct.properties.selected_candidate] ?? '',
          candidates,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_TEXT_INPUT: {
        const evStruct = this.#eventStruct.properties.text;

        event = new TextEvent({
          type: 'textInput',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowID: evStruct.properties.windowID,
          text: evStruct.properties.text,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYMAP_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;

        event = new Event({
          type: 'keymapChange',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYBOARD_ADDED: {
        const evStruct = this.#eventStruct.properties.kdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'keyboard',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYBOARD_REMOVED: {
        const evStruct = this.#eventStruct.properties.kdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'keyboard',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      // MARK: Mouse events
      case SDL_EventType.SDL_EVENT_MOUSE_MOTION: {
        const evStruct = this.#eventStruct.properties.motion;

        event = new PointerEvent({
          type: 'pointerMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: 0,
          pointerType: 'mouse',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: evStruct.properties.xrel,
          deltaY: evStruct.properties.yrel,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_BUTTON_DOWN: {
        const evStruct = this.#eventStruct.properties.button;

        event = new PointerEvent({
          type: 'pointerDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: evStruct.properties.button,
          pointerType: 'mouse',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: evStruct.properties.clicks === 2,
          pressure: 1,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_BUTTON_UP: {
        const evStruct = this.#eventStruct.properties.button;

        event = new PointerEvent({
          type: 'pointerUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: evStruct.properties.button,
          pointerType: 'mouse',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: evStruct.properties.clicks === 2,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_WHEEL: {
        const evStruct = this.#eventStruct.properties.wheel;
        const dir =
          evStruct.properties.direction ===
          SDL_MouseWheelDirection.SDL_MOUSEWHEEL_NORMAL
            ? 1
            : -1;

        event = new PointerEvent({
          type: 'pointerWheel',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: 0,
          pointerType: 'mouse',
          x: evStruct.properties.mouse_x,
          y: evStruct.properties.mouse_y,
          deltaX: evStruct.properties.x,
          deltaY: evStruct.properties.y * dir,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_ADDED: {
        const evStruct = this.#eventStruct.properties.mdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'mouse',
          deviceId: evStruct.properties.which,
        });

        break;
      }
      case SDL_EventType.SDL_EVENT_MOUSE_REMOVED: {
        const evStruct = this.#eventStruct.properties.mdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'mouse',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      // MARK: Joystick events
      case SDL_EventType.SDL_EVENT_JOYSTICK_ADDED: {
        const evStruct = this.#eventStruct.properties.jdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: SDL.SDL_IsGamepad(evStruct.properties.which)
            ? 'gamepad'
            : 'joystick',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_REMOVED: {
        const evStruct = this.#eventStruct.properties.jdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: SDL.SDL_IsGamepad(evStruct.properties.which)
            ? 'gamepad'
            : 'joystick',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_BATTERY_UPDATED: {
        const evStruct = this.#eventStruct.properties.jbattery;

        event = new GamepadBatteryEvent({
          type: 'gamepadBattery',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceId: evStruct.properties.which,
          batteryLevel: evStruct.properties.percent,
          state: (() => {
            switch (evStruct.properties.state) {
              case SDL_PowerState.SDL_POWERSTATE_ERROR:
                return 'error';
              case SDL_PowerState.SDL_POWERSTATE_ON_BATTERY:
                return 'onBattery';
              case SDL_PowerState.SDL_POWERSTATE_NO_BATTERY:
                return 'noBattery';
              case SDL_PowerState.SDL_POWERSTATE_CHARGING:
                return 'charging';
              case SDL_PowerState.SDL_POWERSTATE_CHARGED:
                return 'charged';
              default:
                return 'unknown';
            }
          })(),
        });
        break;
      }
      // MARK: Gamepad events
      case SDL_EventType.SDL_EVENT_GAMEPAD_AXIS_MOTION: {
        const evStruct = this.#eventStruct.properties.gaxis;
        const raw = evStruct.properties.value; // -32768..32767
        const value = raw >= 0 ? raw / 32767 : raw / 32768; // [-1, 1] sem overshoot

        event = new GamepadAxisEvent({
          type: 'gamepadAxis',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceId: evStruct.properties.which,
          value,
          axis: (() => {
            switch (evStruct.properties.axis) {
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_LEFTX:
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_RIGHTX:
                return 'x';
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_LEFTY:
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_RIGHTY:
                return 'y';
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_LEFT_TRIGGER:
                return 'leftTrigger';
              case SDL_GamepadAxis.SDL_GAMEPAD_AXIS_RIGHT_TRIGGER:
                return 'rightTrigger';
              default:
                return 'unknown';
            }
          })(),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_BUTTON_DOWN: {
        const evStruct = this.#eventStruct.properties.gbutton;

        event = new GamepadButtonEvent({
          type: 'gamepadDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceId: evStruct.properties.which,
          key: evStruct.properties.button,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_BUTTON_UP: {
        const evStruct = this.#eventStruct.properties.gbutton;

        event = new GamepadButtonEvent({
          type: 'gamepadUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceId: evStruct.properties.which,
          key: evStruct.properties.button,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_REMAPPED: {
        const evStruct = this.#eventStruct.properties.gdevice;

        event = new DeviceEvent({
          type: 'gamepadRemap',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'gamepad',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_DOWN: {
        const evStruct = this.#eventStruct.properties.gtouchpad;

        event = new PointerEvent({
          type: 'pointerDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: -1,
          deviceId: evStruct.properties.which,
          pointerId: evStruct.properties.finger,
          pointerIndex: evStruct.properties.touchpad,
          pointerType: 'gamepad',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          pressure: evStruct.properties.pressure,
          isDoubleClick: false, // TODO: handle double click
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_MOTION: {
        const evStruct = this.#eventStruct.properties.gtouchpad;

        event = new PointerEvent({
          type: 'pointerMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: -1,
          deviceId: evStruct.properties.which,
          pointerId: evStruct.properties.finger,
          pointerIndex: evStruct.properties.touchpad,
          pointerType: 'gamepad',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0, // TODO: calculate delta
          deltaY: 0,
          pressure: evStruct.properties.pressure,
          isDoubleClick: false,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_TOUCHPAD_UP: {
        const evStruct = this.#eventStruct.properties.gtouchpad;

        event = new PointerEvent({
          type: 'pointerUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: -1,
          deviceId: evStruct.properties.which,
          pointerId: evStruct.properties.finger,
          pointerIndex: evStruct.properties.touchpad,
          pointerType: 'gamepad',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          pressure: evStruct.properties.pressure,
          isDoubleClick: false,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_SENSOR_UPDATE: {
        const evStruct = this.#eventStruct.properties.gsensor;
        const sensorData = evStruct.properties.data as Float32Array;

        event = new GamepadSensorEvent({
          type: 'gamepadSensor',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceId: evStruct.properties.which,
          value: new Vector3(sensorData[0]!, sensorData[1]!, sensorData[2]!),
          sensorType: getSensorType(evStruct.properties.sensor),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_STEAM_HANDLE_UPDATED: {
        const evStruct = this.#eventStruct.properties.gdevice;

        event = new DeviceEvent({
          type: 'gamepadSteamHandle',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'gamepad',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      // MARK: Finger events
      case SDL_EventType.SDL_EVENT_FINGER_DOWN: {
        const evStruct = this.#eventStruct.properties.tfinger;

        event = new PointerEvent({
          type: 'pointerDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: Number(evStruct.properties.touchId),
          pointerId: Number(evStruct.properties.fingerId),
          pointerType: 'touch',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: evStruct.properties.dx,
          deltaY: evStruct.properties.dy,
          isDoubleClick: false,
          pressure: evStruct.properties.pressure,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_UP: {
        const evStruct = this.#eventStruct.properties.tfinger;

        event = new PointerEvent({
          type: 'pointerUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: Number(evStruct.properties.touchId),
          pointerId: Number(evStruct.properties.fingerId),
          pointerType: 'touch',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: evStruct.properties.dx,
          deltaY: evStruct.properties.dy,
          isDoubleClick: false,
          pressure: evStruct.properties.pressure,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_MOTION: {
        const evStruct = this.#eventStruct.properties.tfinger;

        event = new PointerEvent({
          type: 'pointerMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: Number(evStruct.properties.touchId),
          pointerId: Number(evStruct.properties.fingerId),
          pointerType: 'touch',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: evStruct.properties.dx,
          deltaY: evStruct.properties.dy,
          isDoubleClick: false,
          pressure: evStruct.properties.pressure,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_FINGER_CANCELED: {
        const evStruct = this.#eventStruct.properties.tfinger;

        event = new PointerEvent({
          type: 'pointerCancel',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: Number(evStruct.properties.touchId),
          pointerId: Number(evStruct.properties.fingerId),
          pointerType: 'touch',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: evStruct.properties.dx,
          deltaY: evStruct.properties.dy,
          isDoubleClick: false,
          pressure: evStruct.properties.pressure,
        });
        break;
      }
      // MARK: Clipboard events
      case SDL_EventType.SDL_EVENT_CLIPBOARD_UPDATE: {
        const evStruct = this.#eventStruct.properties.clipboard;
        const mimeTypes: string[] = [];
        for (let i = 0; i < evStruct.properties.num_mime_types; i++) {
          const pointer = read.ptr(
            Number(evStruct.properties.mime_types as bigint) as Pointer,
            i,
          ) as Pointer;
          if (!pointer) continue;
          mimeTypes.push(new CString(pointer).toString());
        }

        event = new ClipboardEvent({
          type: 'clipboardUpdated',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          origin: evStruct.properties.owner ? 'self' : 'external',
          mimeTypes,
        });
        break;
      }
      // MARK: Drop events
      case SDL_EventType.SDL_EVENT_DROP_FILE: {
        const evStruct = this.#eventStruct.properties.drop;

        event = new DropEvent({
          type: 'drop',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          source: evStruct.properties.source,
          data: evStruct.properties.data,
          dropType: 'file',
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_TEXT: {
        const evStruct = this.#eventStruct.properties.drop;

        event = new DropEvent({
          type: 'drop',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          source: evStruct.properties.source,
          data: evStruct.properties.data,
          dropType: 'text',
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_BEGIN: {
        const evStruct = this.#eventStruct.properties.drop;

        event = new DropEvent({
          type: 'dropBegin',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          source: evStruct.properties.source,
          data: evStruct.properties.data,
          dropType: 'unknown',
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_COMPLETE: {
        const evStruct = this.#eventStruct.properties.drop;

        event = new DropEvent({
          type: 'dropComplete',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          source: evStruct.properties.source,
          data: evStruct.properties.data,
          dropType: 'unknown',
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DROP_POSITION: {
        const evStruct = this.#eventStruct.properties.drop;

        event = new DropEvent({
          type: 'dropMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          source: evStruct.properties.source,
          data: evStruct.properties.data,
          dropType: 'unknown',
        });
        break;
      }
      // MARK: Audio events
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_ADDED: {
        const evStruct = this.#eventStruct.properties.adevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'audio',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_REMOVED: {
        const evStruct = this.#eventStruct.properties.adevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'audio',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_AUDIO_DEVICE_FORMAT_CHANGED: {
        const evStruct = this.#eventStruct.properties.adevice;

        event = new DeviceEvent({
          type: 'deviceUpdated',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'audio',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      // MARK: Sensor events
      case SDL_EventType.SDL_EVENT_SENSOR_UPDATE: {
        const evStruct = this.#eventStruct.properties.sensor;

        event = new DeviceEvent({
          type: 'deviceUpdated',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'sensor',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      // MARK: Pen events
      case SDL_EventType.SDL_EVENT_PEN_PROXIMITY_IN: {
        const evStruct = this.#eventStruct.properties.pproximity;

        event = new PointerEvent({
          type: 'pointerIn',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: 0,
          pointerType: 'pen',
          x: 0,
          y: 0,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_PROXIMITY_OUT: {
        const evStruct = this.#eventStruct.properties.pproximity;

        event = new PointerEvent({
          type: 'pointerOut',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerId: 0,
          pointerType: 'pen',
          x: 0,
          y: 0,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_DOWN: {
        const evStruct = this.#eventStruct.properties.ptouch;

        event = new PointerEvent({
          type: 'pointerDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: 0,
          pointerType: 'pen',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_UP: {
        const evStruct = this.#eventStruct.properties.ptouch;

        event = new PointerEvent({
          type: 'pointerUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: 0,
          pointerType: 'pen',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_BUTTON_DOWN: {
        const evStruct = this.#eventStruct.properties.pbutton;

        event = new PointerEvent({
          type: 'pointerDown',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: evStruct.properties.button,
          pointerType: 'pen',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_BUTTON_UP: {
        const evStruct = this.#eventStruct.properties.pbutton;

        event = new PointerEvent({
          type: 'pointerUp',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: evStruct.properties.button,
          pointerType: 'pen',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_MOTION: {
        const evStruct = this.#eventStruct.properties.pmotion;

        event = new PointerEvent({
          type: 'pointerMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: 0,
          pointerType: 'pen',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_PEN_AXIS: {
        const evStruct = this.#eventStruct.properties.paxis;
        evStruct.properties.value;

        event = new PointerEvent({
          type: 'pointerMove',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          deviceId: evStruct.properties.which,
          pointerIndex: evStruct.properties.pen_state,
          pointerId: evStruct.properties.axis,
          pointerType: 'pen-axis',
          x: evStruct.properties.x,
          y: evStruct.properties.y,
          deltaX: 0,
          deltaY: 0,
          isDoubleClick: false,
          pressure: evStruct.properties.value,
        });
        break;
      }
      // MARK: Camera events
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_ADDED: {
        const evStruct = this.#eventStruct.properties.cdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'camera',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_REMOVED: {
        const evStruct = this.#eventStruct.properties.cdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'camera',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_APPROVED: {
        const evStruct = this.#eventStruct.properties.cdevice;

        event = new DeviceEvent({
          type: 'deviceApproved',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'camera',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_CAMERA_DEVICE_DENIED: {
        const evStruct = this.#eventStruct.properties.cdevice;

        event = new DeviceEvent({
          type: 'deviceDenied',
          reserved: evStruct.properties.reserved,
          timestamp: this.#helperTimestampToDate(evStruct.properties.timestamp),
          deviceType: 'camera',
          deviceId: evStruct.properties.which,
        });
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
  }
}
