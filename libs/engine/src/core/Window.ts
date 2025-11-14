import {
  getGlfwErrorDescription,
  getNativeWindow,
  GLFW,
  GLFW_GeneralMacro,
  GLFW_WindowMacro,
  glfwErrorCallback,
  glfwFrameBufferSizeCallback,
  glfwVideoModeStruct,
  glfwWindowCloseCallback,
  glfwWindowContentScaleCallback,
  glfwWindowFocusCallback,
  glfwWindowIconifyCallback,
  glfwWindowMaximizeCallback,
  glfwWindowPositionCallback,
  glfwWindowSizeCallback,
} from '@bunbox/glfw';
import {
  getInstanceBuffer,
  instanceToJSON,
  instantiate,
  setupStruct,
} from '@bunbox/struct';
import { EventEmitter } from '@bunbox/utils';
import { CString, ptr, type JSCallback, type Pointer } from 'bun:ffi';
import { ulid } from 'ulid';
import { WindowError } from '../errors';
import { WindowEvent } from '../events';
import { GLFW_DEBUG } from '../singleton/logger';
import { buildCallback, cstr, pointerCopyBuffer } from '../utils/buffer';
import type { EngineContext } from './EngineContext';
import { Color } from '../math';
import type { Scene } from './Scene';

// Setup struct pointer/string conversions globally
setupStruct({
  pointerToString(ptr) {
    return new CString(Number(ptr) as Pointer).toString();
  },
  stringToPointer(str) {
    return BigInt(ptr(cstr(str)));
  },
});

export type WindowState =
  | 'minimized'
  | 'maximized'
  | 'windowed'
  | 'fullscreen'
  | 'windowed-fullscreen';

export type WindowProperties = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  borderless?: boolean;
  resizable?: boolean;
  opacity?: number;
  state?: WindowState;
  alwaysOnTop?: boolean;
};

export type WindowEventMap = {
  'window-shown': [event: WindowEvent];
  'window-hidden': [event: WindowEvent];
  'window-move': [event: WindowEvent];
  'window-resize': [event: WindowEvent];
  'window-minimized': [event: WindowEvent];
  'window-restored': [event: WindowEvent];
  'window-maximized': [event: WindowEvent];
  'window-fullscreen': [event: WindowEvent];
  'window-pointer-enter': [event: WindowEvent];
  'window-pointer-leave': [event: WindowEvent];
  'window-focus': [event: WindowEvent];
  'window-blur': [event: WindowEvent];
  'window-display-changed': [event: WindowEvent];
};

export class Window extends EventEmitter<WindowEventMap> {
  private static __isInitialized = false;
  private static __windowsList: Set<Window> = new Set();
  private static __windowsMap: Map<string, Window> = new Map();
  private static __errorCallback: JSCallback | null = null;

  private static __callInitializeGLFW() {
    if (Window.__isInitialized) return;

    GLFW_DEBUG('Initializing GLFW for first window creation');
    Window.__errorCallback = buildCallback(
      glfwErrorCallback,
      (errorCode, description) => {
        GLFW_DEBUG(getGlfwErrorDescription(errorCode), description);
      },
    );
    GLFW.glfwSetErrorCallback(Window.__errorCallback.ptr);

    if (GLFW.glfwInit() === 0) {
      throw new WindowError('initialization failed', 'STATIC');
    }
    GLFW_DEBUG('GLFW initialized successfully');

    const glfwVersion = GLFW.glfwGetVersionString();
    GLFW_DEBUG(`Version: ${glfwVersion}`);

    if (!GLFW.glfwVulkanSupported()) {
      throw new WindowError('Vulkan is not supported', 'STATIC');
    }
    GLFW_DEBUG(`Chose Vulkan as the graphics API`);

    // Start main loop
    Window.__isInitialized = true;

    let prev = performance.now();
    (async () => {
      GLFW_DEBUG('Starting GLFW main loop');
      while (Window.__isInitialized) {
        const now = performance.now();
        const delta = now - prev;
        prev = now;

        GLFW.glfwPollEvents();
        for (const win of Window.__windowsList) {
          win.__appTriggerProcessStack(delta);
        }
        await Bun.sleep(4);
      }
    })();
  }

  static getWindowById(id: string): Window | undefined {
    return Window.__windowsMap.get(id);
  }

  // MARK: Instance Properties

  private __id: string;
  private __window: Pointer;
  private __windowNative: bigint;
  private __windowDisplay: bigint;
  private __monitorPtr: Pointer | null = null;

  private __context: EngineContext;

  private __title: string;
  private __x: number = 0;
  private __y: number = 0;
  private __savedX: number = 0;
  private __savedY: number = 0;
  private __width: number = 0;
  private __height: number = 0;
  private __savedWidth: number = 0;
  private __savedHeight: number = 0;
  private __bufferWidth: number = 0;
  private __bufferHeight: number = 0;
  private __xScale: number = 1;
  private __yScale: number = 1;
  private __opacity: number = 1.0;
  private __borderless: boolean = false;
  private __resizable: boolean = true;
  private __alwaysOnTop: boolean = false;
  private __isFocused: boolean = false;
  private __isVisible: boolean = true;
  private __state: WindowState = 'windowed';

  private __scene: Scene | null = null;

  private __i32_aux1: Int32Array = new Int32Array(1);
  private __i32_aux2: Int32Array = new Int32Array(1);
  private __f32_aux1: Float32Array = new Float32Array(1);
  private __f32_aux2: Float32Array = new Float32Array(1);

  private __disposeCallbacks: (() => void) | null = null;

  constructor(title: string, context: EngineContext, props?: WindowProperties) {
    super();
    this.__id = ulid();
    this.__context = context;

    const {
      width = 800,
      height = 600,
      x = -1,
      y = -1,
      borderless = false,
      resizable = true,
      opacity = 1.0,
      state = 'windowed',
      alwaysOnTop = false,
    } = props || {};

    this.__title = title;
    this.__width = width;
    this.__height = height;
    this.__savedWidth = width;
    this.__savedHeight = height;
    this.__x = x;
    this.__y = y;
    this.__savedX = x;
    this.__savedY = y;
    this.__borderless = borderless;
    this.__resizable = resizable;
    this.__opacity = opacity;
    this.__state = state;
    this.__alwaysOnTop = alwaysOnTop;

    Window.__callInitializeGLFW();

    if (this.__state === 'fullscreen') {
      this.__updateMainMonitorData(true);
    }

    this.__setWindowHints();
    const window = GLFW.glfwCreateWindow(
      this.__width,
      this.__height,
      cstr(this.__title),
      this.__monitorPtr,
      null,
    );
    if (!window) {
      throw new WindowError('window creation failed', this.__id);
    }
    this.__window = window;
    Window.__windowsList.add(this);
    Window.__windowsMap.set(this.__id, this);

    this.opacity = this.__opacity;

    this.__loadWindowPosition();
    this.__loadWindowSize();
    this.__loadFramebufferSize();
    this.__loadWindowScale();

    this.__bindWindowCallbacks();

    const [nWindow, display] = getNativeWindow(this.__window);
    this.__windowNative = nWindow;
    this.__windowDisplay = display;

    this.markAsDirty();
    GLFW_DEBUG(`First creating window: ${this.__title}`);
  }

  /** Unique window identifier. */
  get id() {
    return this.__id;
  }

  /** Window title. */
  get title() {
    return this.__title;
  }

  /** Window X origin in pixels. */
  get x(): number {
    return this.__x;
  }

  /** Window Y origin in pixels. */
  get y(): number {
    return this.__y;
  }

  /** Window width in pixels. */
  get width(): number {
    return this.__width;
  }

  /** Window height in pixels. */
  get height(): number {
    return this.__height;
  }

  /** Window buffer width in pixels. */
  get bufferWidth(): number {
    return this.__bufferWidth;
  }

  /** Window buffer height in pixels. */
  get bufferHeight(): number {
    return this.__bufferHeight;
  }

  /** Window X scale factor. */
  get xScale(): number {
    return this.__xScale;
  }

  /** Window Y scale factor. */
  get yScale(): number {
    return this.__yScale;
  }

  /** Window opacity (0.0 to 1.0). */
  get opacity(): number {
    return this.__opacity;
  }

  /** Whether the window is borderless. */
  get isBorderless(): boolean {
    return this.__borderless;
  }

  /** Whether the window is resizable. */
  get isResizable(): boolean {
    return this.__resizable;
  }

  /** Whether the window is always on top. */
  get isAlwaysOnTop(): boolean {
    return this.__alwaysOnTop;
  }

  /** Whether the window is focused. */
  get isFocused(): boolean {
    return this.__isFocused;
  }

  /** Whether the window is shown. */
  get isShown(): boolean {
    return this.__isVisible;
  }

  /** Whether the window is hidden. */
  get isHidden(): boolean {
    return !this.__isVisible;
  }

  /** Current window state. */
  get state(): WindowState {
    return this.__state;
  }

  /** Background color of the window. */
  get scene(): Scene | null {
    return this.__scene;
  }

  set title(value: string) {
    this.__title = value;
    if (this.__window)
      GLFW.glfwSetWindowTitle(this.__window, cstr(this.__title));
  }

  set opacity(value: number) {
    this.__opacity = value;
    if (this.__window) GLFW.glfwSetWindowOpacity(this.__window, this.__opacity);
  }

  set isBorderless(value: boolean) {
    this.__borderless = value;
    if (this.__window) {
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.DECORATED,
        this.__borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );
    }
  }

  set isResizable(value: boolean) {
    this.__resizable = value;
    if (this.__window) {
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.RESIZABLE,
        this.__resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  set isAlwaysOnTop(value: boolean) {
    this.__alwaysOnTop = value;
    if (this.__window) {
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.FLOATING,
        this.__alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  set scene(value: Scene | null) {
    this.__scene = value;
  }

  override async dispose(): Promise<void> {
    await super.dispose();

    this.__context.disposeWindow(this.__windowNative);

    GLFW_DEBUG(`Disposing window: ${this.__title}`);
    Window.__windowsList.delete(this);
    Window.__windowsMap.delete(this.__id);

    this.__disposeCallbacks?.();
    GLFW.glfwDestroyWindow(this.__window);

    if (Window.__windowsList.size === 0) {
      GLFW_DEBUG('No more windows. Terminating GLFW.');
      GLFW.glfwSetErrorCallback(0 as Pointer);
      GLFW.glfwTerminate();
      Window.__errorCallback?.close();
      Window.__isInitialized = false;
    }
  }

  setPos(x: number, y: number) {
    if (this.__state === 'fullscreen') {
      console.warn('Cannot set window position while in fullscreen mode.');
      return;
    }

    this.__x = x;
    this.__y = y;
    this.__savedX = x;
    this.__savedY = y;
    if (this.__window) {
      GLFW.glfwSetWindowPos(this.__window, this.__x, this.__y);
    }
  }

  setSize(width: number, height: number) {
    if (this.__state === 'fullscreen') {
      console.warn('Cannot set window position while in fullscreen mode.');
    } else {
      this.__savedWidth = width;
      this.__savedHeight = height;
    }
    this.__width = width;
    this.__height = height;
    GLFW.glfwSetWindowSize(this.__window, this.__width, this.__height);
  }

  fullscreen(windowed: boolean = false) {
    if (!this.__window) return;

    if (windowed) {
      this.__state = 'windowed-fullscreen';
      this.__updateMainMonitorData();
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.DECORATED,
        GLFW_GeneralMacro.TRUE,
      );

      GLFW.glfwSetWindowPos(this.__window, this.__x, this.__y);
      GLFW.glfwSetWindowSize(this.__window, this.__width, this.__height);
    } else {
      this.__state = 'fullscreen';
      this.__updateMainMonitorData(true);
      GLFW.glfwSetWindowMonitor(
        this.__window,
        this.__monitorPtr,
        0,
        0,
        this.__width,
        this.__height,
        0,
      );
    }
  }

  minimize() {
    if (!this.__window) return;
    this.__state = 'minimized';
    GLFW.glfwIconifyWindow(this.__window);
  }

  restore() {
    if (!this.__window) return;
    if (this.__state === 'minimized' && this.__monitorPtr) {
      this.__state = 'fullscreen';
      GLFW.glfwRestoreWindow(this.__window);
    } else if (this.__state === 'windowed-fullscreen') {
      this.__state = 'windowed';
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      GLFW.glfwSetWindowPos(this.__window, this.__savedX, this.__savedY);
      GLFW.glfwSetWindowSize(
        this.__window,
        this.__savedWidth,
        this.__savedHeight,
      );
    }
    if (this.__state === 'fullscreen') {
      this.__state = 'windowed';
      GLFW.glfwRestoreWindow(this.__window);
      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      this.__monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.__window,
        null,
        this.__x,
        this.__y,
        this.__width,
        this.__height,
        0,
      );
    } else {
      this.__state = 'windowed';
      GLFW.glfwRestoreWindow(this.__window);
    }
  }

  maximize() {
    if (!this.__window) return;
    if (this.__monitorPtr) {
      this.__state = 'maximized';
      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      this.__monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.__window,
        null,
        this.__x,
        this.__y,
        this.__width,
        this.__height,
        0,
      );
    } else if (this.__state === 'windowed-fullscreen') {
      this.__state = 'maximized';
      GLFW.glfwSetWindowAttrib(
        this.__window,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      GLFW.glfwSetWindowPos(this.__window, this.__savedX, this.__savedY);
      GLFW.glfwSetWindowSize(
        this.__window,
        this.__savedWidth,
        this.__savedHeight,
      );
    }

    GLFW.glfwMaximizeWindow(this.__window);
  }

  show() {
    if (!this.__window) return;
    this.__isVisible = true;
    GLFW.glfwShowWindow(this.__window);
    this.__dispatchEvent('window-shown');
  }

  hide() {
    if (!this.__window) return;
    this.__isVisible = false;
    GLFW.glfwHideWindow(this.__window);
    this.__dispatchEvent('window-hidden');
  }

  private __updateMainMonitorData(setMonitor: boolean = false) {
    GLFW_DEBUG('Updating main monitor data for fullscreen mode');
    const monitor = GLFW.glfwGetPrimaryMonitor();
    if (!monitor) {
      throw new WindowError('failed to get window monitor', this.__id);
    }
    GLFW_DEBUG('Got primary monitor pointer:', monitor);
    const mode = GLFW.glfwGetVideoMode(monitor);
    if (!mode) {
      throw new WindowError('failed to get video mode', this.__id);
    }
    GLFW_DEBUG('Got video mode pointer:', mode);

    const modeStr = instantiate(glfwVideoModeStruct);
    const modeBfr = getInstanceBuffer(modeStr);
    GLFW_DEBUG('Video mode data:', instanceToJSON(modeStr));
    pointerCopyBuffer(mode, modeBfr);

    this.__x = 0;
    this.__y = 0;
    this.__width = modeStr.width;
    this.__height = modeStr.height;
    if (setMonitor) this.__monitorPtr = monitor;
  }

  private __setWindowHints() {
    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.VISIBLE, GLFW_GeneralMacro.TRUE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.AUTO_ICONIFY, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_X,
      this.__x >= 0 ? this.__x : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_Y,
      this.__y >= 0 ? this.__y : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.TRANSPARENT_FRAMEBUFFER,
      GLFW_GeneralMacro.TRUE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.DECORATED,
      this.__borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.RESIZABLE,
      this.__resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.FLOATING,
      this.__alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.FOCUS_ON_SHOW,
      this.__isFocused ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );

    GLFW_DEBUG('Set window hints for new window');
  }

  private __bindWindowCallbacks() {
    if (this.__disposeCallbacks) {
      this.__disposeCallbacks();
      this.__disposeCallbacks = null;
    }
    if (!this.__window) return;

    const windowPosCB = buildCallback(
      glfwWindowPositionCallback,
      (win, xPos, yPos) => {
        if (this.__window !== win) return;

        this.__x = xPos;
        this.__y = yPos;
        if (
          this.__state !== 'fullscreen' &&
          this.__state !== 'windowed-fullscreen'
        ) {
          this.__savedX = xPos;
          this.__savedY = yPos;
        }

        this.__dispatchEvent('window-move');
      },
    );
    const windowSizeCB = buildCallback(
      glfwWindowSizeCallback,
      (win, width, height) => {
        if (this.__window !== win) return;
        this.__width = width;
        this.__height = height;
        if (
          this.__state !== 'fullscreen' &&
          this.__state !== 'windowed-fullscreen'
        ) {
          this.__savedWidth = width;
          this.__savedHeight = height;
        }
        this.__dispatchEvent('window-resize');
      },
    );
    const windowFocusCB = buildCallback(
      glfwWindowFocusCallback,
      (win, focused) => {
        if (this.__window !== win) return;
        this.__isFocused = Boolean(focused);
        this.__dispatchEvent(focused ? 'window-focus' : 'window-blur');
      },
    );
    const windowIconifyCB = buildCallback(
      glfwWindowIconifyCallback,
      (win, iconified) => {
        if (this.__window !== win) return;

        if (iconified) {
          this.__state = 'minimized';
        }

        this.__loadWindowSize();
        this.__dispatchEvent(
          iconified ? 'window-minimized' : 'window-restored',
        );
      },
    );
    const windowMaximizeCB = buildCallback(
      glfwWindowMaximizeCallback,
      (win, maximized) => {
        if (this.__window !== win) return;
        if (maximized) {
          this.__state = 'maximized';
        }
        this.__loadWindowSize();
        this.__dispatchEvent(
          maximized ? 'window-maximized' : 'window-restored',
        );
      },
    );
    const windowContentScaleCB = buildCallback(
      glfwWindowContentScaleCallback,
      (win, xScale, yScale) => {
        if (this.__window !== win) return;
        this.__xScale = xScale;
        this.__yScale = yScale;
        this.__dispatchEvent('window-display-changed');
      },
    );
    const windowFramebufferSizeCB = buildCallback(
      glfwFrameBufferSizeCallback,
      (win, width, height) => {
        if (this.__window !== win) return;
        if (this.__bufferWidth !== width || this.__bufferHeight !== height) {
          this.markAsDirty();
        }
        this.__bufferWidth = width;
        this.__bufferHeight = height;
      },
    );
    const windowCloseCB = buildCallback(glfwWindowCloseCallback, (win) => {
      if (this.__window !== win) return;
      this.dispose();
    });

    GLFW.glfwSetWindowPosCallback(this.__window, windowPosCB.ptr);
    GLFW.glfwSetWindowSizeCallback(this.__window, windowSizeCB.ptr);
    GLFW.glfwSetWindowFocusCallback(this.__window, windowFocusCB.ptr);
    GLFW.glfwSetWindowIconifyCallback(this.__window, windowIconifyCB.ptr);
    GLFW.glfwSetWindowMaximizeCallback(this.__window, windowMaximizeCB.ptr);
    GLFW.glfwSetWindowContentScaleCallback(
      this.__window,
      windowContentScaleCB.ptr,
    );
    GLFW.glfwSetFramebufferSizeCallback(
      this.__window,
      windowFramebufferSizeCB.ptr,
    );
    GLFW.glfwSetWindowCloseCallback(this.__window, windowCloseCB.ptr);

    this.__disposeCallbacks = () => {
      GLFW.glfwSetWindowPosCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowSizeCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowFocusCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowIconifyCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowMaximizeCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowContentScaleCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetFramebufferSizeCallback(this.__window, 0 as Pointer);
      GLFW.glfwSetWindowCloseCallback(this.__window, 0 as Pointer);
      windowPosCB.close();
      windowSizeCB.close();
      windowFocusCB.close();
      windowIconifyCB.close();
      windowMaximizeCB.close();
      windowContentScaleCB.close();
      windowFramebufferSizeCB.close();
      windowCloseCB.close();
    };
  }

  private __loadFramebufferSize() {
    if (!this.__window) return;

    GLFW.glfwGetFramebufferSize(
      this.__window,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__bufferWidth = this.__i32_aux2[0]!;
    this.__bufferHeight = this.__i32_aux1[0]!;
  }

  private __loadWindowPosition() {
    if (!this.__window) return;

    GLFW.glfwGetWindowPos(
      this.__window,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__x = this.__i32_aux2[0]!;
    this.__y = this.__i32_aux1[0]!;
    this.__savedX = this.__x;
    this.__savedY = this.__y;
  }

  private __loadWindowSize() {
    if (!this.__window) return;

    GLFW.glfwGetWindowSize(
      this.__window,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__width = this.__i32_aux2[0]!;
    this.__height = this.__i32_aux1[0]!;
    this.__savedWidth = this.__width;
    this.__savedHeight = this.__height;
  }

  private __loadWindowScale() {
    if (!this.__window) return;

    GLFW.glfwGetWindowContentScale(
      this.__window,
      ptr(this.__f32_aux1),
      ptr(this.__f32_aux2),
    );
    this.__xScale = this.__f32_aux1[0]!;
    this.__yScale = this.__f32_aux2[0]!;
  }

  private __dispatchEvent(eventKey: keyof WindowEventMap) {
    console.log('ev', eventKey);
    const event = new WindowEvent({
      currentDisplayId: GLFW.glfwGetWindowMonitor(this.__window) ?? 0,
      windowId: this.__window ?? 0,
      height: this.__height,
      width: this.__width,
      x: this.__x,
      y: this.__y,
      timestamp: new Date(),
      type: eventKey,
    });
    (this as Window).emit(eventKey, event);
  }

  private __appTriggerProcessStack(delta: number) {
    if (this.isDisposed) return;

    if (this.isDirty) {
      this.__context.rebuildSwapchain(
        this.__windowNative,
        this.__windowDisplay,
        this.__bufferWidth,
        this.__bufferHeight,
      );
      this.markAsClean();
    }
    this.__context.renderFrame(this.__windowNative, this.scene, delta);
  }
}
