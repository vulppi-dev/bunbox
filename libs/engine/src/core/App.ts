import {
  cstr,
  SDL,
  SDL_DisplayOrientation,
  SDL_Event,
  SDL_EventType,
  SDL_InitFlags,
  SDL_Keymod,
  SDL_Locale,
  SDL_Rect,
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
  DeviceEvent,
  DisplayEvent,
  Event,
  KeyEvent,
  LocaleEvent,
  QuitEvent,
  TextEvent,
  ThemeEvent,
  WindowEvent,
  type DisplayOrientation,
} from '../events';
import { CString, read, type Pointer } from 'bun:ffi';
import { pointerToBuffer } from '../utils/buffer';
import { Rect } from '../math';

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

export class App extends Node {
  static #singleAppInstance: App | null = null;

  #stack: Node[] = [];

  #initialDate: Date;
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
    this.#initialDate = new Date();
    this.#eventStruct = new SDL_Event();

    SDL.SDL_SetAppMetadata(cstr(name), cstr(version), cstr(identifier));
    SDL.SDL_SetHint(cstr('SDL_LOGGING'), cstr('test=verbose,*=info'));

    const unsubAddChild = this.subscribe('add-child', () => {
      this.#stack = getChildrenStack(this, Node);
    });
    const unsubRemoveChild = this.subscribe('remove-child', () => {
      this.#stack = getChildrenStack(this, Node);
    });

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

    this.#startEventLooper();
    this.#startProcessLooper();
  }

  protected override _getType(): string {
    return 'App';
  }

  get timestamp() {
    return this.#initialDate.getTime();
  }

  get now() {
    const time = Number(SDL.SDL_GetTicksNS() / 1_000_000n);
    return this.#initialDate.getTime() + time;
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
    if (!pointers) return [];
    for (let i = 0; i < localeCount[0]!; i++) {
      const pointer = read.ptr(pointers, i) as Pointer;
      if (!pointer) continue;
      const locale = new SDL_Locale();
      const buffer = pointerToBuffer(pointer, locale.size);
      locale.copy(buffer);
      locales.push(locale);
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
    const now = this.timestamp;
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

        event = new LocaleEvent({
          type: 'locale',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          locales: this.getLocales(),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_SYSTEM_THEME_CHANGED: {
        const evStruct = this.#eventStruct.properties.common;

        event = new ThemeEvent({
          type: 'theme',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          mode: this.getTheme(),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_DISPLAY_ORIENTATION: {
        const evStruct = this.#eventStruct.properties.display;
        const rect = this.getDisplayBoundRect(evStruct.properties.displayID);

        event = new DisplayEvent({
          type: 'orientation',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
      case SDL_EventType.SDL_EVENT_WINDOW_SHOWN:
      case SDL_EventType.SDL_EVENT_WINDOW_EXPOSED: {
        const evStruct = this.#eventStruct.properties.window;
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);
        const rect = this.getWindowBoundRect(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowShown',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
        const window = SDL.SDL_GetWindowFromID(evStruct.properties.windowID);

        event = new WindowEvent({
          type: 'windowDestroy',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          windowId: evStruct.properties.windowID,
          currentDisplayId: SDL.SDL_GetDisplayForWindow(window),
          x: 0,
          y: 0,
          width: 0,
          height: 0,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEY_DOWN: {
        const evStruct = this.#eventStruct.properties.key;

        event = new KeyEvent({
          type: 'keyDown',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_KEYBOARD_ADDED: {
        const evStruct = this.#eventStruct.properties.kdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'keyboard',
          deviceId: evStruct.properties.which,
        });
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
        const evStruct = this.#eventStruct.properties.mdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'mouse',
          deviceId: evStruct.properties.which,
        });
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
        const evStruct = this.#eventStruct.properties.jdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'joystick',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_JOYSTICK_REMOVED: {
        const evStruct = this.#eventStruct.properties.jdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'joystick',
          deviceId: evStruct.properties.which,
        });
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
        const evStruct = this.#eventStruct.properties.gdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'gamepad',
          deviceId: evStruct.properties.which,
        });
        break;
      }
      case SDL_EventType.SDL_EVENT_GAMEPAD_REMOVED: {
        const evStruct = this.#eventStruct.properties.gdevice;

        event = new DeviceEvent({
          type: 'deviceRemoved',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'gamepad',
          deviceId: evStruct.properties.which,
        });
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
        const evStruct = this.#eventStruct.properties.adevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'audio',
          deviceId: evStruct.properties.which,
        });
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
        const evStruct = this.#eventStruct.properties.cdevice;

        event = new DeviceEvent({
          type: 'deviceAdded',
          reserved: evStruct.properties.reserved,
          timestamp: timestampToDate(evStruct.properties.timestamp),
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
          timestamp: timestampToDate(evStruct.properties.timestamp),
          deviceType: 'camera',
          deviceId: evStruct.properties.which,
        });
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
  }
}
