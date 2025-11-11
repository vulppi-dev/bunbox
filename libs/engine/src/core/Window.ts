import {
  getGlfwErrorDescription,
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
import { Root } from '@bunbox/tree';
import { CString, ptr, type JSCallback, type Pointer } from 'bun:ffi';
import { DynamicLibError, EngineError } from '../errors';
import { WindowEvent } from '../events';
import { Color } from '../math';
import { GLFW_DEBUG } from '../singleton/logger';
import { buildCallback, cstr, pointerCopyBuffer } from '../utils/buffer';
import type { AbstractRenderer } from './AbstractRenderer';
import { VkRenderer } from './vulkan/VkRenderer';
import { Node, PROCESS_EVENT } from '../nodes/Node';
import { AbstractCamera, Light, Mesh } from '../nodes';

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
  backend?: 'vulkan';
  msaa?: 1 | 2 | 4 | 8;
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

export class Window extends Root<never, never, WindowEventMap> {
  private static __isInitialized = false;
  private static __windowsList: Set<Window> = new Set();
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
      throw new DynamicLibError('initialization failed', 'GLFW');
    }
    GLFW_DEBUG('GLFW initialized successfully');

    const glfwVersion = GLFW.glfwGetVersionString();
    GLFW_DEBUG(`Version: ${glfwVersion}`);

    if (!GLFW.glfwVulkanSupported()) {
      throw new DynamicLibError('Vulkan is not supported', 'GLFW');
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

  private __windowPtr: Pointer;
  private __monitorPtr: Pointer | null = null;

  private __renderer: AbstractRenderer;

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

  private __stack: Node[] = [];
  private __meshStack: Mesh[] = [];
  private __cameraStack: AbstractCamera[] = [];
  private __lightStack: Light[] = [];

  private __scheduleDirty: boolean = true;

  private __i32_aux1: Int32Array = new Int32Array(1);
  private __i32_aux2: Int32Array = new Int32Array(1);
  private __f32_aux1: Float32Array = new Float32Array(1);
  private __f32_aux2: Float32Array = new Float32Array(1);

  private __disposeCallbacks: (() => void) | null = null;

  constructor(title: string, props?: WindowProperties) {
    super();

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
      backend = 'vulkan',
      msaa = 1,
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
      throw new DynamicLibError('window creation failed', 'GLFW');
    }
    this.__windowPtr = window;
    Window.__windowsList.add(this);

    this.opacity = this.__opacity;

    this.__loadWindowPosition();
    this.__loadWindowSize();
    this.__loadFramebufferSize();
    this.__loadWindowScale();

    this.__bindWindowCallbacks();

    if (backend === 'vulkan') {
      this.__renderer = new VkRenderer(this.__windowPtr, {
        msaa,
      });
    } else {
      throw new EngineError(`unsupported backend: ${backend}`, 'Window');
    }

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.__scheduleDirty = true;
      }),
      this.subscribe('remove-child', () => {
        this.__scheduleDirty = true;
      }),
      this.subscribe('enabled-change', () => {
        this.__scheduleDirty = true;
      }),
    ];

    this.on('dispose', () => {
      GLFW_DEBUG(`Disposing window: ${this.__title}`);
      Window.__windowsList.delete(this);
      this.__renderer.dispose();

      unsubscribes.forEach((fn) => fn());

      this.__disposeCallbacks?.();
      GLFW.glfwDestroyWindow(this.__windowPtr);

      if (Window.__windowsList.size === 0) {
        GLFW_DEBUG('No more windows. Terminating GLFW.');
        GLFW.glfwSetErrorCallback(0 as Pointer);
        GLFW.glfwTerminate();
        Window.__errorCallback?.close();
        Window.__isInitialized = false;
      }
    });

    GLFW_DEBUG(`First creating window: ${this.__title}`);
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

  get opacity(): number {
    return this.__opacity;
  }

  /** Clear color used for rendering. */
  get clearColor(): Color {
    return this.__renderer.getClearColor();
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

  get backgroundColor(): Color {
    return new Color();
  }

  /**
   * Set MSAA (Multi-Sample Anti-Aliasing) sample count
   * @param sampleCount Number of samples (1 = disabled, 2, 4, or 8)
   */
  setMSAA(sampleCount: 1 | 2 | 4 | 8): void {
    if (this.__renderer && 'setMSAA' in this.__renderer) {
      (this.__renderer as any).setMSAA(sampleCount);
    }
  }

  /**
   * Add a custom post-process effect to the render pipeline
   * @param name Unique identifier for this post-process effect
   * @param config RenderPassConfig defining the post-process pass
   */
  addPostProcessEffect(name: string, config: any): void {
    if (this.__renderer && 'addCustomPostProcess' in this.__renderer) {
      (this.__renderer as any).addCustomPostProcess({ name, config });
    }
  }

  /**
   * Remove a custom post-process effect from the render pipeline
   * @param name Identifier of the effect to remove
   * @returns true if the effect was removed, false if not found
   */
  removePostProcessEffect(name: string): boolean {
    if (this.__renderer && 'removeCustomPostProcess' in this.__renderer) {
      return (this.__renderer as any).removeCustomPostProcess(name);
    }
    return false;
  }

  /**
   * Clear all custom post-process effects
   */
  clearPostProcessEffects(): void {
    if (this.__renderer && 'clearCustomPostProcess' in this.__renderer) {
      (this.__renderer as any).clearCustomPostProcess();
    }
  }

  set title(value: string) {
    this.__title = value;
    if (this.__windowPtr)
      GLFW.glfwSetWindowTitle(this.__windowPtr, cstr(this.__title));
  }

  set backgroundColor(color: Color) {}

  set clearColor(color: Color) {
    this.__renderer.setClearColor(color);
  }

  set opacity(value: number) {
    this.__opacity = value;
    if (this.__windowPtr)
      GLFW.glfwSetWindowOpacity(this.__windowPtr, this.__opacity);
  }

  set isBorderless(value: boolean) {
    this.__borderless = value;
    if (this.__windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.__windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.__borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );
    }
  }

  set isResizable(value: boolean) {
    this.__resizable = value;
    if (this.__windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.__windowPtr,
        GLFW_WindowMacro.RESIZABLE,
        this.__resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  set isAlwaysOnTop(value: boolean) {
    this.__alwaysOnTop = value;
    if (this.__windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.__windowPtr,
        GLFW_WindowMacro.FLOATING,
        this.__alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
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
    if (this.__windowPtr) {
      GLFW.glfwSetWindowPos(this.__windowPtr, this.__x, this.__y);
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
    GLFW.glfwSetWindowSize(this.__windowPtr, this.__width, this.__height);
  }

  fullscreen(windowed: boolean = false) {
    if (!this.__windowPtr) return;

    if (windowed) {
      this.__state = 'windowed-fullscreen';
      this.__updateMainMonitorData();
      GLFW.glfwSetWindowAttrib(
        this.__windowPtr,
        GLFW_WindowMacro.DECORATED,
        GLFW_GeneralMacro.TRUE,
      );

      GLFW.glfwSetWindowPos(this.__windowPtr, this.__x, this.__y);
      GLFW.glfwSetWindowSize(this.__windowPtr, this.__width, this.__height);
    } else {
      this.__state = 'fullscreen';
      this.__updateMainMonitorData(true);
      GLFW.glfwSetWindowMonitor(
        this.__windowPtr,
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
    if (!this.__windowPtr) return;
    this.__state = 'minimized';
    GLFW.glfwIconifyWindow(this.__windowPtr);
  }

  restore() {
    if (!this.__windowPtr) return;
    if (this.__state === 'minimized' && this.__monitorPtr) {
      this.__state = 'fullscreen';
      GLFW.glfwRestoreWindow(this.__windowPtr);
    } else if (this.__state === 'windowed-fullscreen') {
      this.__state = 'windowed';
      GLFW.glfwSetWindowAttrib(
        this.__windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      GLFW.glfwSetWindowPos(this.__windowPtr, this.__savedX, this.__savedY);
      GLFW.glfwSetWindowSize(
        this.__windowPtr,
        this.__savedWidth,
        this.__savedHeight,
      );
    }
    if (this.__state === 'fullscreen') {
      this.__state = 'windowed';
      GLFW.glfwRestoreWindow(this.__windowPtr);
      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      this.__monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.__windowPtr,
        null,
        this.__x,
        this.__y,
        this.__width,
        this.__height,
        0,
      );
    } else {
      this.__state = 'windowed';
      GLFW.glfwRestoreWindow(this.__windowPtr);
    }
  }

  maximize() {
    if (!this.__windowPtr) return;
    if (this.__monitorPtr) {
      this.__state = 'maximized';
      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      this.__monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.__windowPtr,
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
        this.__windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.__x = this.__savedX;
      this.__y = this.__savedY;
      this.__width = this.__savedWidth;
      this.__height = this.__savedHeight;
      GLFW.glfwSetWindowPos(this.__windowPtr, this.__savedX, this.__savedY);
      GLFW.glfwSetWindowSize(
        this.__windowPtr,
        this.__savedWidth,
        this.__savedHeight,
      );
    }

    GLFW.glfwMaximizeWindow(this.__windowPtr);
  }

  show() {
    if (!this.__windowPtr) return;
    this.__isVisible = true;
    GLFW.glfwShowWindow(this.__windowPtr);
    this.__dispatchEvent('window-shown');
  }

  hide() {
    if (!this.__windowPtr) return;
    this.__isVisible = false;
    GLFW.glfwHideWindow(this.__windowPtr);
    this.__dispatchEvent('window-hidden');
  }

  private __updateMainMonitorData(setMonitor: boolean = false) {
    GLFW_DEBUG('Updating main monitor data for fullscreen mode');
    const monitor = GLFW.glfwGetPrimaryMonitor();
    if (!monitor) {
      throw new DynamicLibError('failed to get window monitor', 'GLFW');
    }
    GLFW_DEBUG('Got primary monitor pointer:', monitor);
    const mode = GLFW.glfwGetVideoMode(monitor);
    if (!mode) {
      throw new DynamicLibError('failed to get video mode', 'GLFW');
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
    if (!this.__windowPtr) return;

    const windowPosCB = buildCallback(
      glfwWindowPositionCallback,
      (win, xPos, yPos) => {
        if (this.__windowPtr !== win) return;

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
        if (this.__windowPtr !== win) return;
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
        if (this.__windowPtr !== win) return;
        this.__isFocused = Boolean(focused);
        this.__dispatchEvent(focused ? 'window-focus' : 'window-blur');
      },
    );
    const windowIconifyCB = buildCallback(
      glfwWindowIconifyCallback,
      (win, iconified) => {
        if (this.__windowPtr !== win) return;

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
        if (this.__windowPtr !== win) return;
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
        if (this.__windowPtr !== win) return;
        this.__xScale = xScale;
        this.__yScale = yScale;
        this.__dispatchEvent('window-display-changed');
      },
    );
    const windowFramebufferSizeCB = buildCallback(
      glfwFrameBufferSizeCallback,
      (win, width, height) => {
        if (this.__windowPtr !== win) return;
        if (this.__bufferWidth !== width || this.__bufferHeight !== height) {
          this.markAsDirty();
        }
        this.__bufferWidth = width;
        this.__bufferHeight = height;
      },
    );
    const windowCloseCB = buildCallback(glfwWindowCloseCallback, (win) => {
      if (this.__windowPtr !== win) return;
      this.disable();
      this.dispose();
    });

    GLFW.glfwSetWindowPosCallback(this.__windowPtr, windowPosCB.ptr);
    GLFW.glfwSetWindowSizeCallback(this.__windowPtr, windowSizeCB.ptr);
    GLFW.glfwSetWindowFocusCallback(this.__windowPtr, windowFocusCB.ptr);
    GLFW.glfwSetWindowIconifyCallback(this.__windowPtr, windowIconifyCB.ptr);
    GLFW.glfwSetWindowMaximizeCallback(this.__windowPtr, windowMaximizeCB.ptr);
    GLFW.glfwSetWindowContentScaleCallback(
      this.__windowPtr,
      windowContentScaleCB.ptr,
    );
    GLFW.glfwSetFramebufferSizeCallback(
      this.__windowPtr,
      windowFramebufferSizeCB.ptr,
    );
    GLFW.glfwSetWindowCloseCallback(this.__windowPtr, windowCloseCB.ptr);

    this.__disposeCallbacks = () => {
      GLFW.glfwSetWindowPosCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowSizeCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowFocusCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowIconifyCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowMaximizeCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowContentScaleCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetFramebufferSizeCallback(this.__windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowCloseCallback(this.__windowPtr, 0 as Pointer);
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
    if (!this.__windowPtr) return;

    GLFW.glfwGetFramebufferSize(
      this.__windowPtr,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__bufferWidth = this.__i32_aux2[0]!;
    this.__bufferHeight = this.__i32_aux1[0]!;
  }

  private __loadWindowPosition() {
    if (!this.__windowPtr) return;

    GLFW.glfwGetWindowPos(
      this.__windowPtr,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__x = this.__i32_aux2[0]!;
    this.__y = this.__i32_aux1[0]!;
    this.__savedX = this.__x;
    this.__savedY = this.__y;
  }

  private __loadWindowSize() {
    if (!this.__windowPtr) return;

    GLFW.glfwGetWindowSize(
      this.__windowPtr,
      ptr(this.__i32_aux2),
      ptr(this.__i32_aux1),
    );
    this.__width = this.__i32_aux2[0]!;
    this.__height = this.__i32_aux1[0]!;
    this.__savedWidth = this.__width;
    this.__savedHeight = this.__height;
  }

  private __loadWindowScale() {
    if (!this.__windowPtr) return;

    GLFW.glfwGetWindowContentScale(
      this.__windowPtr,
      ptr(this.__f32_aux1),
      ptr(this.__f32_aux2),
    );
    this.__xScale = this.__f32_aux1[0]!;
    this.__yScale = this.__f32_aux2[0]!;
  }

  private __dispatchEvent(eventKey: keyof WindowEventMap) {
    console.log('ev', eventKey);
    const event = new WindowEvent({
      currentDisplayId: GLFW.glfwGetWindowMonitor(this.__windowPtr) ?? 0,
      windowId: this.__windowPtr ?? 0,
      height: this.__height,
      width: this.__width,
      x: this.__x,
      y: this.__y,
      timestamp: new Date(),
      type: eventKey,
    });
    (this as Window).emit(eventKey, event);
  }

  private __rebuildStacks() {
    const nextStack: Node[] = [];
    const nextCameraStack: AbstractCamera[] = [];
    const nextMeshStack: Mesh[] = [];
    const nextLightStack: Light[] = [];
    this.traverse(
      (n) => {
        if (n !== this && n instanceof Node) {
          nextStack.push(n as Node);
          if (n instanceof AbstractCamera) {
            nextCameraStack.push(n);
          }
          if (n instanceof Mesh) {
            nextMeshStack.push(n);
          }
          if (n instanceof Light) {
            nextLightStack.push(n);
          }
        }
      },
      { ignoreType: Window, includeDisabled: true },
    );
    this.__stack = nextStack;
    this.__cameraStack = nextCameraStack;
    this.__meshStack = nextMeshStack;
    this.__lightStack = nextLightStack;
    this.__scheduleDirty = false;
  }

  private __appTriggerProcessStack(delta: number) {
    if (!this.isEnabled || this.isDisposed) return;
    if (this.__scheduleDirty) this.__rebuildStacks();

    for (const node of this.__stack) {
      if (node.isEnabled) {
        node[PROCESS_EVENT](delta);
      }
    }

    if (this.isDirty) {
      this.__renderer.rebuildFrame();
      this.markAsClean();
    }
    this.__renderer.render(
      this.__cameraStack,
      this.__meshStack,
      this.__lightStack,
      delta,
    );
  }
}
