import {
  getInstanceBuffer,
  instanceToJSON,
  instantiate,
  setupStruct,
} from '@bunbox/struct';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import { CString, ptr, type JSCallback, type Pointer } from 'bun:ffi';
import {
  BGFX,
  BGFX_MaximumLimits,
  BGFX_RenderType,
  BGFX_Reset,
  bgfxInitStruct,
  bgfxPlatformDataStruct,
  buildCallback,
  cstr,
  GLFW,
  GLFW_ErrorCodes,
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
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { WindowEvent } from '../events';
import { BGFX_DEBUG, GLFW_DEBUG } from '../singleton/logger';
import { pointerCopyBuffer } from '../utils/buffer';
import { Node } from './Node';
import { getRendererName, Renderer } from './Renderer';

import { Node3D } from '../nodes';

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

function getGLFWErrorDescription(errorCode: number): string {
  switch (errorCode) {
    case GLFW_ErrorCodes.API_UNAVAILABLE:
      return 'GLFW API unavailable';
    case GLFW_ErrorCodes.CURSOR_UNAVAILABLE:
      return 'GLFW Cursor unavailable';
    case GLFW_ErrorCodes.FEATURE_UNAVAILABLE:
      return 'GLFW Feature unavailable';
    case GLFW_ErrorCodes.FEATURE_UNIMPLEMENTED:
      return 'GLFW Feature unimplemented';
    case GLFW_ErrorCodes.FORMAT_UNAVAILABLE:
      return 'GLFW Format unavailable';
    case GLFW_ErrorCodes.INVALID_ENUM:
      return 'GLFW Invalid enum';
    case GLFW_ErrorCodes.INVALID_VALUE:
      return 'GLFW Invalid value';
    case GLFW_ErrorCodes.NOT_INITIALIZED:
      return 'GLFW Not initialized';
    case GLFW_ErrorCodes.NO_CURRENT_CONTEXT:
      return 'GLFW No current context';
    case GLFW_ErrorCodes.NO_ERROR:
      return 'GLFW No error';
    case GLFW_ErrorCodes.NO_WINDOW_CONTEXT:
      return 'GLFW No window context';
    case GLFW_ErrorCodes.OUT_OF_MEMORY:
      return 'GLFW Out of memory';
    case GLFW_ErrorCodes.PLATFORM_ERROR:
      return 'GLFW Platform error';
    case GLFW_ErrorCodes.PLATFORM_UNAVAILABLE:
      return 'GLFW Platform unavailable';
    case GLFW_ErrorCodes.VERSION_UNAVAILABLE:
      return 'GLFW Version unavailable';
    default:
      return `Unknown GLFW error code: ${errorCode}`;
  }
}

export class Window<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<P, M, MergeEventMaps<T, WindowEventMap>> {
  static #isInitialized = false;
  static #windowsList: Set<Window> = new Set();
  static #errorCallback: JSCallback | null = null;
  #renderer: Renderer;

  static #callInitializeGLFW() {
    if (Window.#isInitialized) return;
    GLFW_DEBUG('Initializing GLFW for first window creation');
    Window.#errorCallback = buildCallback(
      glfwErrorCallback,
      (errorCode, description) => {
        GLFW_DEBUG(getGLFWErrorDescription(errorCode), description);
      },
    );
    GLFW.glfwSetErrorCallback(Window.#errorCallback.ptr);

    if (GLFW.glfwInit() === 0) {
      throw new DynamicLibError('initialization failed', 'GLFW');
    }
    GLFW_DEBUG('GLFW initialized successfully');

    const glfwVersion = GLFW.glfwGetVersionString();
    GLFW_DEBUG(`Version: ${glfwVersion}`);

    /*-------- BGFX Main invisible window --------*/
    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.POSITION_X, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.POSITION_Y, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.VISIBLE, GLFW_GeneralMacro.FALSE);
    BGFX_DEBUG('Creating main invisible window for BGFX context');

    const window = GLFW.glfwCreateWindow(32, 32, cstr(''), null, null);
    if (!window) {
      throw new DynamicLibError(
        'BGFX main invisible window creation failed',
        'GLFW',
      );
    }
    const windowHandler = Renderer.getNativeWindowHandler(window);
    if (!windowHandler) {
      throw new DynamicLibError(
        'BGFX main invisible window native handler retrieval failed',
        'GLFW',
      );
    }
    BGFX_DEBUG('BGFX main invisible window created successfully:', window);
    BGFX.bgfx_render_frame(-1);
    BGFX_DEBUG('BGFX render frame initialized');

    const displayHandler =
      process.platform === 'linux' ? BigInt(GLFW.glfwGetX11Display()!) : 0n;
    const platformData = instantiate(bgfxPlatformDataStruct);
    const initData = instantiate(bgfxInitStruct);
    BGFX.bgfx_init_ctor(ptr(getInstanceBuffer(initData)));
    BGFX_DEBUG('BGFX init struct initialized');

    platformData.nwh = BigInt(windowHandler);
    platformData.ndt = displayHandler;
    BGFX.bgfx_set_platform_data(ptr(getInstanceBuffer(platformData)));
    BGFX_DEBUG('BGFX platform data set:', instanceToJSON(platformData));

    const renderersSupportedBfr = new Int32Array(16);
    const count = BGFX.bgfx_get_supported_renderers(
      16,
      ptr(renderersSupportedBfr),
    );
    const renderersSupported = Array.from(
      renderersSupportedBfr.slice(0, count),
    );
    BGFX_DEBUG(
      `Supported renderers: ${renderersSupported
        .map(getRendererName)
        .join(', ')}`,
    );

    initData.platformData = platformData;
    initData.resolution.width = 32;
    initData.resolution.height = 32;
    initData.resolution.reset = BGFX_Reset.VSYNC;
    initData.type = renderersSupported.includes(BGFX_RenderType.Direct3D12)
      ? BGFX_RenderType.Direct3D12
      : renderersSupported.includes(BGFX_RenderType.Metal)
        ? BGFX_RenderType.Metal
        : BGFX_RenderType.Vulkan;
    BGFX_DEBUG(`Selected renderer: ${getRendererName(initData.type)}`);

    if (!BGFX.bgfx_init(ptr(getInstanceBuffer(initData)))) {
      throw new DynamicLibError('BGFX initialization failed', 'BGFX');
    }
    BGFX_DEBUG('BGFX initialized successfully:', instanceToJSON(initData));
    BGFX.bgfx_set_view_frame_buffer(0, BGFX_MaximumLimits.MAX_UINT16);

    Window.#isInitialized = true;

    let prev = performance.now();
    (async () => {
      GLFW_DEBUG('Starting GLFW main loop');
      while (Window.#isInitialized) {
        const now = performance.now();
        const delta = now - prev;
        prev = now;

        GLFW.glfwPollEvents();
        for (const win of Window.#windowsList) {
          win.#appTriggerProcessStack(delta);
        }
        BGFX.bgfx_frame(false);
        await Bun.sleep(4);
      }
    })();
  }

  #windowPtr: Pointer;
  #monitorPtr: Pointer | null = null;

  #title: string;
  #x: number = 0;
  #y: number = 0;
  #savedX: number = 0;
  #savedY: number = 0;
  #width: number = 0;
  #height: number = 0;
  #savedWidth: number = 0;
  #savedHeight: number = 0;
  #bufferWidth: number = 0;
  #bufferHeight: number = 0;
  #xScale: number = 1;
  #yScale: number = 1;
  #opacity: number = 1.0;
  #borderless: boolean = false;
  #resizable: boolean = true;
  #alwaysOnTop: boolean = false;
  #isFocused: boolean = false;
  #state: WindowState = 'windowed';

  #stack: Node[] = [];
  #stack3D: Node3D[] = [];

  #scheduleDirty: boolean = true;

  #i32_aux1: Int32Array = new Int32Array(1);
  #i32_aux2: Int32Array = new Int32Array(1);
  #f32_aux1: Float32Array = new Float32Array(1);
  #f32_aux2: Float32Array = new Float32Array(1);

  #disposeCallbacks: (() => void) | null = null;

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
    } = props || {};

    this.#title = title;
    this.#width = width;
    this.#height = height;
    this.#savedWidth = width;
    this.#savedHeight = height;
    this.#x = x;
    this.#y = y;
    this.#savedX = x;
    this.#savedY = y;
    this.#borderless = borderless;
    this.#resizable = resizable;
    this.#opacity = opacity;
    this.#state = state;
    this.#alwaysOnTop = alwaysOnTop;

    Window.#callInitializeGLFW();

    if (this.#state === 'fullscreen') {
      this.#updateMainMonitorData(true);
    }

    this.#setWindowHints();
    const window = GLFW.glfwCreateWindow(
      this.#width,
      this.#height,
      cstr(this.#title),
      this.#monitorPtr,
      null,
    );
    if (!window) {
      throw new DynamicLibError('window creation failed', 'GLFW');
    }
    this.#windowPtr = window;
    Window.#windowsList.add(this);

    this.opacity = this.#opacity;

    this.#loadWindowPosition();
    this.#loadWindowSize();
    this.#loadFramebufferSize();
    this.#loadWindowScale();

    this.#bindWindowCallbacks();

    this.#renderer = new Renderer(this.#windowPtr);

    const unsubscribes = [
      this.subscribe('add-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('remove-child', () => {
        this.#scheduleDirty = true;
      }),
      this.subscribe('enabled-change', () => {
        this.#scheduleDirty = true;
      }),
    ];

    this.on('dispose', () => {
      GLFW_DEBUG(`Disposing window: ${this.#title}`);
      Window.#windowsList.delete(this);
      this.#renderer.dispose();

      unsubscribes.forEach((fn) => fn());
      this.#stack = [];

      this.#disposeCallbacks?.();
      GLFW.glfwDestroyWindow(this.#windowPtr);

      if (Window.#windowsList.size === 0) {
        GLFW_DEBUG('No more windows. Terminating GLFW.');
        GLFW.glfwSetErrorCallback(0 as Pointer);
        GLFW.glfwTerminate();
        Window.#errorCallback?.close();
        Window.#isInitialized = false;
      }
    });

    GLFW_DEBUG(`First creating window: ${this.#title}`);
  }

  /** Window title. */
  get title() {
    return this.#title;
  }

  /** Window X origin in pixels. */
  get x(): number {
    return this.#x;
  }

  /** Window Y origin in pixels. */
  get y(): number {
    return this.#y;
  }

  /** Window width in pixels. */
  get width(): number {
    return this.#width;
  }

  /** Window height in pixels. */
  get height(): number {
    return this.#height;
  }

  /** Window buffer width in pixels. */
  get bufferWidth(): number {
    return this.#bufferWidth;
  }

  /** Window buffer height in pixels. */
  get bufferHeight(): number {
    return this.#bufferHeight;
  }

  /** Window X scale factor. */
  get xScale(): number {
    return this.#xScale;
  }

  /** Window Y scale factor. */
  get yScale(): number {
    return this.#yScale;
  }

  get opacity(): number {
    return this.#opacity;
  }

  /** Whether the window is borderless. */
  get isBorderless(): boolean {
    return this.#borderless;
  }

  /** Whether the window is resizable. */
  get isResizable(): boolean {
    return this.#resizable;
  }

  /** Whether the window is always on top. */
  get isAlwaysOnTop(): boolean {
    return this.#alwaysOnTop;
  }

  /** Whether the window is focused. */
  get isFocused(): boolean {
    return this.#isFocused;
  }

  /** Current window state. */
  get state(): WindowState {
    return this.#state;
  }

  set title(value: string) {
    this.#title = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowTitle(this.#windowPtr, cstr(this.#title));
  }

  set opacity(value: number) {
    this.#opacity = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowOpacity(this.#windowPtr, this.#opacity);
  }

  set isBorderless(value: boolean) {
    this.#borderless = value;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.#borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );
    }
  }

  set isResizable(value: boolean) {
    this.#resizable = value;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.RESIZABLE,
        this.#resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  set isAlwaysOnTop(value: boolean) {
    this.#alwaysOnTop = value;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.FLOATING,
        this.#alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  setPos(x: number, y: number) {
    if (this.#state === 'fullscreen') {
      console.warn('Cannot set window position while in fullscreen mode.');
      return;
    }

    this.#x = x;
    this.#y = y;
    this.#savedX = x;
    this.#savedY = y;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
    }
  }

  setSize(width: number, height: number) {
    if (this.#state === 'fullscreen') {
      console.warn('Cannot set window position while in fullscreen mode.');
    } else {
      this.#savedWidth = width;
      this.#savedHeight = height;
    }
    this.#width = width;
    this.#height = height;
    // TODO: Teste change resolution;
    GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
  }

  fullscreen(windowed: boolean = false) {
    if (!this.#windowPtr) return;

    if (windowed) {
      this.#state = 'windowed-fullscreen';
      this.#updateMainMonitorData();
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.DECORATED,
        GLFW_GeneralMacro.TRUE,
      );

      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
    } else {
      this.#state = 'fullscreen';
      this.#updateMainMonitorData(true);
      GLFW.glfwSetWindowMonitor(
        this.#windowPtr,
        this.#monitorPtr,
        0,
        0,
        this.#width,
        this.#height,
        0,
      );
    }
  }

  minimize() {
    if (!this.#windowPtr) return;
    this.#state = 'minimized';
    GLFW.glfwIconifyWindow(this.#windowPtr);
  }

  restore() {
    if (!this.#windowPtr) return;
    if (this.#state === 'minimized' && this.#monitorPtr) {
      this.#state = 'fullscreen';
      GLFW.glfwRestoreWindow(this.#windowPtr);
    } else if (this.#state === 'windowed-fullscreen') {
      this.#state = 'windowed';
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.#x = this.#savedX;
      this.#y = this.#savedY;
      this.#width = this.#savedWidth;
      this.#height = this.#savedHeight;
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#savedX, this.#savedY);
      GLFW.glfwSetWindowSize(
        this.#windowPtr,
        this.#savedWidth,
        this.#savedHeight,
      );
    }
    if (this.#state === 'fullscreen') {
      this.#state = 'windowed';
      GLFW.glfwRestoreWindow(this.#windowPtr);
      this.#x = this.#savedX;
      this.#y = this.#savedY;
      this.#width = this.#savedWidth;
      this.#height = this.#savedHeight;
      this.#monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.#windowPtr,
        null,
        this.#x,
        this.#y,
        this.#width,
        this.#height,
        0,
      );
    } else {
      this.#state = 'windowed';
      GLFW.glfwRestoreWindow(this.#windowPtr);
    }
  }

  maximize() {
    if (!this.#windowPtr) return;
    if (this.#monitorPtr) {
      this.#state = 'maximized';
      this.#x = this.#savedX;
      this.#y = this.#savedY;
      this.#width = this.#savedWidth;
      this.#height = this.#savedHeight;
      this.#monitorPtr = null;
      GLFW.glfwSetWindowMonitor(
        this.#windowPtr,
        null,
        this.#x,
        this.#y,
        this.#width,
        this.#height,
        0,
      );
    } else if (this.#state === 'windowed-fullscreen') {
      this.#state = 'maximized';
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowMacro.DECORATED,
        this.isBorderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );

      this.#x = this.#savedX;
      this.#y = this.#savedY;
      this.#width = this.#savedWidth;
      this.#height = this.#savedHeight;
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#savedX, this.#savedY);
      GLFW.glfwSetWindowSize(
        this.#windowPtr,
        this.#savedWidth,
        this.#savedHeight,
      );
    }

    GLFW.glfwMaximizeWindow(this.#windowPtr);
  }

  override _process(_deltaTime: number): void {
    // if (this.isDisposed) return;
    if (GLFW.glfwWindowShouldClose(this.#windowPtr)) {
      // this.dispose();
      return;
    }
  }

  protected override _getType(): string {
    return 'Window';
  }

  #updateMainMonitorData(setMonitor: boolean = false) {
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
    pointerCopyBuffer(mode, new Uint8Array(modeBfr));

    this.#x = 0;
    this.#y = 0;
    this.#width = modeStr.width;
    this.#height = modeStr.height;
    if (setMonitor) this.#monitorPtr = monitor;
  }

  #setWindowHints() {
    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.VISIBLE, GLFW_GeneralMacro.TRUE);
    GLFW.glfwWindowHint(GLFW_WindowMacro.AUTO_ICONIFY, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_X,
      this.#x >= 0 ? this.#x : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_Y,
      this.#y >= 0 ? this.#y : GLFW_GeneralMacro.ANY_POSITION,
    );
    // GLFW.glfwWindowHint(
    //   GLFW_WindowMacro.TRANSPARENT_FRAMEBUFFER,
    //   GLFW_GeneralMacro.TRUE,
    // );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.DECORATED,
      this.#borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.RESIZABLE,
      this.#resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.FLOATING,
      this.#alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.FOCUS_ON_SHOW,
      this.#isFocused ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );

    GLFW_DEBUG('Set window hints for new window');
  }

  #bindWindowCallbacks() {
    if (this.#disposeCallbacks) {
      this.#disposeCallbacks();
      this.#disposeCallbacks = null;
    }
    if (!this.#windowPtr) return;

    const windowPosCB = buildCallback(
      glfwWindowPositionCallback,
      (win, xpos, ypos) => {
        if (this.#windowPtr !== win) return;

        this.#x = xpos;
        this.#y = ypos;
        if (
          this.#state !== 'fullscreen' &&
          this.#state !== 'windowed-fullscreen'
        ) {
          this.#savedX = xpos;
          this.#savedY = ypos;
        }

        this.#dispatchEvent('window-move');
      },
    );
    const windowSizeCB = buildCallback(
      glfwWindowSizeCallback,
      (win, width, height) => {
        if (this.#windowPtr !== win) return;
        this.#width = width;
        this.#height = height;
        if (
          this.#state !== 'fullscreen' &&
          this.#state !== 'windowed-fullscreen'
        ) {
          this.#savedWidth = width;
          this.#savedHeight = height;
        }
        this.#dispatchEvent('window-resize');
      },
    );
    const windowFocusCB = buildCallback(
      glfwWindowFocusCallback,
      (win, focused) => {
        if (this.#windowPtr !== win) return;
        this.#isFocused = Boolean(focused);
        this.#dispatchEvent(focused ? 'window-focus' : 'window-blur');
      },
    );
    const windowIconifyCB = buildCallback(
      glfwWindowIconifyCallback,
      (win, iconified) => {
        if (this.#windowPtr !== win) return;

        if (iconified) {
          this.#state = 'minimized';
        }

        this.#loadWindowSize();
        this.#dispatchEvent(iconified ? 'window-minimized' : 'window-restored');
      },
    );
    const windowMaximizeCB = buildCallback(
      glfwWindowMaximizeCallback,
      (win, maximized) => {
        if (this.#windowPtr !== win) return;
        if (maximized) {
          this.#state = 'maximized';
        }
        this.#loadWindowSize();
        this.#dispatchEvent(maximized ? 'window-maximized' : 'window-restored');
      },
    );
    const windowContentScaleCB = buildCallback(
      glfwWindowContentScaleCallback,
      (win, xscale, yscale) => {
        if (this.#windowPtr !== win) return;
        this.#xScale = xscale;
        this.#yScale = yscale;
        this.#dispatchEvent('window-display-changed');
      },
    );
    const windowFramebufferSizeCB = buildCallback(
      glfwFrameBufferSizeCallback,
      (win, width, height) => {
        if (this.#windowPtr !== win) return;
        if (this.#bufferWidth !== width || this.#bufferHeight !== height) {
          this.markAsDirty();
        }
        this.#bufferWidth = width;
        this.#bufferHeight = height;
      },
    );
    const windowCloseCB = buildCallback(glfwWindowCloseCallback, (win) => {
      if (this.#windowPtr !== win) return;
      this.disable();
      this.dispose();
    });

    GLFW.glfwSetWindowPosCallback(this.#windowPtr, windowPosCB.ptr);
    GLFW.glfwSetWindowSizeCallback(this.#windowPtr, windowSizeCB.ptr);
    GLFW.glfwSetWindowFocusCallback(this.#windowPtr, windowFocusCB.ptr);
    GLFW.glfwSetWindowIconifyCallback(this.#windowPtr, windowIconifyCB.ptr);
    GLFW.glfwSetWindowMaximizeCallback(this.#windowPtr, windowMaximizeCB.ptr);
    GLFW.glfwSetWindowContentScaleCallback(
      this.#windowPtr,
      windowContentScaleCB.ptr,
    );
    GLFW.glfwSetFramebufferSizeCallback(
      this.#windowPtr,
      windowFramebufferSizeCB.ptr,
    );
    GLFW.glfwSetWindowCloseCallback(this.#windowPtr, windowCloseCB.ptr);

    this.#disposeCallbacks = () => {
      GLFW.glfwSetWindowPosCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowSizeCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowFocusCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowIconifyCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowMaximizeCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowContentScaleCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetFramebufferSizeCallback(this.#windowPtr, 0 as Pointer);
      GLFW.glfwSetWindowCloseCallback(this.#windowPtr, 0 as Pointer);
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

  #loadFramebufferSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#i32_aux2),
      ptr(this.#i32_aux1),
    );
    this.#bufferWidth = this.#i32_aux2[0]!;
    this.#bufferHeight = this.#i32_aux1[0]!;
  }

  #loadWindowPosition() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowPos(
      this.#windowPtr,
      ptr(this.#i32_aux2),
      ptr(this.#i32_aux1),
    );
    this.#x = this.#i32_aux2[0]!;
    this.#y = this.#i32_aux1[0]!;
    this.#savedX = this.#x;
    this.#savedY = this.#y;
  }

  #loadWindowSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowSize(
      this.#windowPtr,
      ptr(this.#i32_aux2),
      ptr(this.#i32_aux1),
    );
    this.#width = this.#i32_aux2[0]!;
    this.#height = this.#i32_aux1[0]!;
    this.#savedWidth = this.#width;
    this.#savedHeight = this.#height;
  }

  #loadWindowScale() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowContentScale(
      this.#windowPtr,
      ptr(this.#f32_aux1),
      ptr(this.#f32_aux2),
    );
    this.#xScale = this.#f32_aux1[0]!;
    this.#yScale = this.#f32_aux2[0]!;
  }

  #dispatchEvent(eventKey: keyof WindowEventMap) {
    console.log('ev', eventKey);
    const event = new WindowEvent({
      currentDisplayId: GLFW.glfwGetWindowMonitor(this.#windowPtr) ?? 0,
      windowId: this.#windowPtr ?? 0,
      height: this.#height,
      width: this.#width,
      x: this.#x,
      y: this.#y,
      timestamp: new Date(),
      type: eventKey,
    });
    (this as Window).emit(eventKey, event);
  }

  #rebuildStacks() {
    const nextStack: Node[] = [];
    const nextStack3D: Node3D[] = [];
    this.traverse(
      (n) => {
        if (n !== this && n instanceof Node) {
          nextStack.push(n as Node);
          if (n instanceof Node3D) {
            nextStack3D.push(n as Node3D);
          }
        }
      },
      { ignoreType: Window as any },
    );
    this.#stack = nextStack;
    this.#stack3D = nextStack3D;
    this.#scheduleDirty = false;
  }

  #appTriggerProcessStack(delta: number) {
    if (!this.isEnabled || this.isDisposed) return;
    if (this.#scheduleDirty) this.#rebuildStacks();

    this._process(delta);

    if (this.isDisposed) return;

    for (const node of this.#stack) {
      if (node.isEnabled) {
        node._process(delta);
      }
    }

    if (this.isDirty) {
      this.#renderer.rebuildFrame();
      this.markAsClean();
    }
    this.#renderer.render(this.#stack3D);
  }
}
