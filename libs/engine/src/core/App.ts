import { instantiate, setupStruct } from '@bunbox/struct';
import { CString, ptr, type Pointer } from 'bun:ffi';
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
  GLFW_GeneralMacro,
  GLFW_WindowHints,
  GLFW_WindowMacro,
  glfwErrorCallback,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import type { AppLogLevel } from '../types';
import { Node } from './Node';
import { Window } from './Window';
import {
  getNativeWindowHandler,
  getRendererName,
  MAIN_WINDOW,
} from './_common';

// Setup struct pointer/string conversions globally
setupStruct({
  pointerToString(ptr) {
    return new CString(Number(ptr) as Pointer).toString();
  },
  stringToPointer(str) {
    return BigInt(ptr(cstr(str)));
  },
});

/**
 * Engine application entry point. Initializes GLFW and BGFX, owns the main event loop
 * and a process loop. Add your Windows under this node.
 */
export class App extends Node {
  static #singleMainWindowInstance: App | null = null;

  #logger: ((message: string, level: AppLogLevel, tag: string) => void) | null;

  #windowStack: Window<Record<string, any>, Record<string, any>, {}>[] = [];
  #scheduleDirty: boolean = false;

  /** Create a single App instance (only one allowed per process). */
  constructor() {
    super();

    if (App.#singleMainWindowInstance) {
      throw new Error(
        'App instance already exists. Only one instance is allowed.',
      );
    }

    this.#logger = (message: string, level: AppLogLevel, tag: string) => {
      switch (level) {
        case 'verbose':
        case 'debug':
          console.debug(`[${tag}][${level.toUpperCase()}]: ${message}`);
          break;
        case 'info':
          console.info(`[${tag}][${level.toUpperCase()}]: ${message}`);
          break;
        case 'warn':
          console.warn(`[${tag}][${level.toUpperCase()}]: ${message}`);
          break;
        case 'error':
        case 'critical':
          console.error(`[${tag}][${level.toUpperCase()}]: ${message}`);
          break;
      }
    };

    const errorCallback = buildCallback(
      glfwErrorCallback,
      (errorCode, description) => {
        this.loggerCall(`(${errorCode}) ${description}`, 'error', 'GLFW');
      },
    );

    GLFW.glfwSetErrorCallback(errorCallback.ptr);
    if (GLFW.glfwInit() === 0) {
      throw new DynamicLibError('initialization failed', 'GLFW');
    }

    const glfwVersion = GLFW.glfwGetVersionString();
    this.loggerCall(`Version: ${glfwVersion}`, 'debug', 'GLFW');

    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowHints.POSITION_X, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowHints.POSITION_Y, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowHints.VISIBLE, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(
      GLFW_WindowHints.TRANSPARENT_FRAMEBUFFER,
      GLFW_GeneralMacro.TRUE,
    );
    this.loggerCall('Configure main window hints', 'debug', 'GLFW');

    const window = GLFW.glfwCreateWindow(1, 1, cstr(''), null, null);
    if (!window) {
      throw new DynamicLibError('window creation failed', 'GLFW');
    }
    this.loggerCall('Main window created', 'debug', 'GLFW');

    MAIN_WINDOW.set(window);
    const windowHandler = getNativeWindowHandler(window);
    if (!windowHandler) {
      throw new DynamicLibError('failed to get native window handle', 'GLFW');
    }
    // Render frame to ensure everything is set up
    BGFX.bgfx_render_frame(-1);
    this.loggerCall('Init with mono thread', 'debug', 'BGFX');

    const displayHandler =
      process.platform === 'linux' ? BigInt(GLFW.glfwGetX11Display()!) : 0n;

    const [bgfxPlatformData, bgfxPlatformDataBfr] = instantiate(
      bgfxPlatformDataStruct,
    );
    const [bgfxInit, bgfxInitBfr] = instantiate(bgfxInitStruct);
    const platformPtr = ptr(bgfxPlatformDataBfr);
    const initPtr = ptr(bgfxInitBfr);

    BGFX.bgfx_init_ctor(initPtr);
    this.loggerCall('init struct constructed', 'debug', 'BGFX');

    bgfxPlatformData.nwh = BigInt(windowHandler);
    bgfxPlatformData.ndt = displayHandler;
    BGFX.bgfx_set_platform_data(platformPtr);
    this.loggerCall('platform data set', 'debug', 'BGFX');

    this.loggerCall('Verifying background', 'debug', 'BGFX');
    const renderersSupportedBfr = new Int32Array(16);
    const count = BGFX.bgfx_get_supported_renderers(
      16,
      ptr(renderersSupportedBfr),
    );
    const renderersSupported = Array.from(
      renderersSupportedBfr.slice(0, count),
    );
    this.loggerCall(
      `Supported renderers: ${renderersSupported
        .map(getRendererName)
        .join(', ')}`,
      'debug',
      'BGFX',
    );

    bgfxInit.platformData = bgfxPlatformData;
    bgfxInit.resolution.width = 64;
    bgfxInit.resolution.height = 64;
    bgfxInit.resolution.reset = BGFX_Reset.VSYNC;
    bgfxInit.type = renderersSupported.includes(BGFX_RenderType.Direct3D12)
      ? BGFX_RenderType.Direct3D12
      : renderersSupported.includes(BGFX_RenderType.Metal)
        ? BGFX_RenderType.Metal
        : BGFX_RenderType.Vulkan;
    this.loggerCall(
      `Selected renderer: ${getRendererName(bgfxInit.type)}`,
      'info',
      'BGFX',
    );

    if (!BGFX.bgfx_init(initPtr)) {
      throw new DynamicLibError('BGFX initialization failed', 'BGFX');
    }
    this.loggerCall('BGFX initialized', 'info', 'BGFX');
    BGFX.bgfx_set_view_frame_buffer(0, BGFX_MaximumLimits.MAX_UINT16);

    const unsubscribes = [
      this.subscribe('add-child', (node) => {
        this.#scheduleDirty = node instanceof Window;
      }),
      this.subscribe('remove-child', (node) => {
        this.#scheduleDirty = node instanceof Window;
      }),
    ];

    this.on('dispose', () => {
      MAIN_WINDOW.set(null);
      unsubscribes.forEach((fn) => fn());
      this.#windowStack = [];
      BGFX.bgfx_shutdown();
      this.loggerCall('BGFX shutdown', 'debug', 'BGFX');
      GLFW.glfwDestroyWindow(window);
      this.loggerCall('Main window destroyed', 'debug', 'GLFW');
      GLFW.glfwSetErrorCallback(0 as Pointer);
      errorCallback.close();
      GLFW.glfwTerminate();
      this.loggerCall('GLFW terminated', 'debug', 'GLFW');
      App.#singleMainWindowInstance = null;
    });

    process.on('beforeExit', () => {
      this.dispose();
    });

    App.#singleMainWindowInstance = this;

    this.#startProcessLooper();
  }

  setLogger(
    logger: ((message: string, level: AppLogLevel, tag: string) => void) | null,
  ) {
    this.#logger = logger;
  }

  override loggerCall(message: string, level: AppLogLevel, tag: string): this {
    this.#logger?.(message, level, tag);
    return this;
  }

  protected override _getType(): string {
    return 'MainWindow';
  }

  #triggerWindowStack(delta: number) {
    if (this.#scheduleDirty) {
      this.#windowStack = this.findByType(Window);
      this.#scheduleDirty = false;
    }
    for (const node of this.#windowStack) {
      if (node.isEnabled) node._appTriggerProcessStack(delta);
    }
    BGFX.bgfx_frame(false);
  }

  async #startProcessLooper() {
    let now = performance.now();
    let prev = now;
    let delta = 0;

    while (!this.isDisposed) {
      GLFW.glfwPollEvents();

      now = performance.now();
      delta = now - prev;

      this.#triggerWindowStack(delta);

      prev = now;
      await Bun.sleep(16);
    }
  }
}
