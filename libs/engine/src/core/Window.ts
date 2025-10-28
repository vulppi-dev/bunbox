import { instantiate } from '@bunbox/struct';
import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import { ptr, toBuffer, type Pointer } from 'bun:ffi';
import {
  BGFX,
  BGFX_MaximumLimits,
  BGFX_TextureFormat,
  buildCallback,
  cstr,
  GLFW,
  GLFW_GeneralMacro,
  GLFW_WindowHints,
  GLFW_WindowMacro,
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
import { Node } from './Node';
import { getNativeWindowHandler } from './_common';

const MAX_WINDOWS_COUNT = 256;
const VIEW_IDS = new Set<number>(
  Array.from({ length: MAX_WINDOWS_COUNT - 1 }, (_, i) => i + 1),
);

export type WindowState = 'minimized' | 'maximized' | 'normal';

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

export class Window<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<P, M, MergeEventMaps<T, WindowEventMap>> {
  static #activeWindows: number = 1;

  #windowPtr: Pointer | null = null;
  #fbHandlePtr: number = BGFX_MaximumLimits.MAX_UINT16;

  #viewId: number = -1;

  #title: string;
  #x: number = 0;
  #y: number = 0;
  #width: number = 0;
  #height: number = 0;
  #bufferWidth: number = 0;
  #bufferHeight: number = 0;
  #xScale: number = 1;
  #yScale: number = 1;
  #opacity: number = 1.0;
  #borderless: boolean = false;
  #resizable: boolean = true;
  #alwaysOnTop: boolean = false;
  #isFocused: boolean = false;
  #state: WindowState = 'normal';

  #stack: Node[] = [];
  #scheduleDirty: boolean = true;

  #heightAux: Int32Array = new Int32Array(1);
  #widthAux: Int32Array = new Int32Array(1);
  #xsAux: Float32Array = new Float32Array(1);
  #ysAux: Float32Array = new Float32Array(1);

  constructor(title: string, props?: WindowProperties) {
    super();

    if (Window.#activeWindows >= MAX_WINDOWS_COUNT) {
      throw new DynamicLibError('maximum number of windows reached', 'GLFW');
    }
    Window.#activeWindows++;

    const {
      width = 800,
      height = 600,
      x = -1,
      y = -1,
      borderless = false,
      resizable = true,
      opacity = 1.0,
      state = 'normal',
      alwaysOnTop = false,
    } = props || {};

    this.#title = title;
    this.#width = width;
    this.#height = height;
    this.#x = x;
    this.#y = y;
    this.#borderless = borderless;
    this.#resizable = resizable;
    this.#opacity = opacity;
    this.#state = state;
    this.#alwaysOnTop = alwaysOnTop;

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
      Window.#activeWindows--;
      unsubscribes.forEach((fn) => fn());
      this.#stack = [];
    });

    this.disable();
  }

  /** Unique view ID associated with this window. */
  get viewId() {
    return this.#viewId;
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

  set x(value: number) {
    this.#x = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
  }

  set y(value: number) {
    this.#y = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
  }

  set width(value: number) {
    this.#width = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
  }

  set height(value: number) {
    this.#height = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
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
        GLFW_WindowHints.DECORATED,
        this.#borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
      );
    }
  }

  set isResizable(value: boolean) {
    this.#resizable = value;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowHints.RESIZABLE,
        this.#resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  set isAlwaysOnTop(value: boolean) {
    this.#alwaysOnTop = value;
    if (this.#windowPtr) {
      GLFW.glfwSetWindowAttrib(
        this.#windowPtr,
        GLFW_WindowHints.FLOATING,
        this.#alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
      );
    }
  }

  fullscreen(windowed: boolean = false) {
    if (!this.#windowPtr) return;

    this.#destroyFramebuffer();

    const monitor = GLFW.glfwGetPrimaryMonitor();
    if (!monitor) {
      throw new DynamicLibError('failed to get window monitor', 'GLFW');
    }
    const mode = GLFW.glfwGetVideoMode(monitor);
    if (!mode) {
      throw new DynamicLibError('failed to get video mode', 'GLFW');
    }

    const [modeStr, modeBfr] = instantiate(glfwVideoModeStruct);
    const modeOrigin = toBuffer(mode, 0, modeBfr.byteLength);
    modeOrigin.copy(new Uint8Array(modeBfr));

    if (windowed) {
      this.isBorderless = true;
      this.#x = 0;
      this.#y = 0;
      this.#width = modeStr.width;
      this.#height = modeStr.height;
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
    } else {
      GLFW.glfwSetWindowMonitor(
        this.#windowPtr,
        monitor,
        0,
        0,
        modeStr.width,
        modeStr.height,
        GLFW_GeneralMacro.DONT_CARE,
      );
    }
  }

  minimize() {
    if (this.#windowPtr) {
      GLFW.glfwIconifyWindow(this.#windowPtr);
      this.#state = 'minimized';
    }
  }

  restore() {
    if (this.#windowPtr) {
      GLFW.glfwRestoreWindow(this.#windowPtr);
      this.#state = 'normal';
    }
  }

  maximize() {
    if (this.#windowPtr) {
      GLFW.glfwMaximizeWindow(this.#windowPtr);
      this.#state = 'maximized';
    }
  }

  /**
   * # internal use only
   * @ignore internal use only
   */
  _appTriggerProcessStack(delta: number) {
    if (!this.isEnabled || this.isDisposed) return;
    if (this.#scheduleDirty) this.#rebuildStacks();

    this._process(delta);

    if (this.isDisposed) return;

    for (const node of this.#stack) {
      if (node.isEnabled) {
        node._process(delta);
      }
    }
    this.#render();
  }

  override _process(_deltaTime: number): void {
    if (this.isDisposed) return;
    if (GLFW.glfwWindowShouldClose(this.#windowPtr)) {
      this.dispose();
      return;
    }
  }

  protected override _getType(): string {
    return 'Window';
  }

  protected override _ready(): void {
    if (this.#windowPtr) return;
    this.disable();
    this.loggerCall(`Creating window: ${this.#title}`, 'info', 'GLFW');

    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, GLFW_GeneralMacro.FALSE);
    GLFW.glfwWindowHint(GLFW_WindowHints.VISIBLE, GLFW_GeneralMacro.TRUE);
    GLFW.glfwWindowHint(
      GLFW_WindowHints.POSITION_X,
      this.#x >= 0 ? this.#x : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.POSITION_Y,
      this.#y >= 0 ? this.#y : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.TRANSPARENT_FRAMEBUFFER,
      GLFW_GeneralMacro.TRUE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.DECORATED,
      this.#borderless ? GLFW_GeneralMacro.FALSE : GLFW_GeneralMacro.TRUE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.RESIZABLE,
      this.#resizable ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.FLOATING,
      this.#alwaysOnTop ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowHints.FOCUS_ON_SHOW,
      this.#isFocused ? GLFW_GeneralMacro.TRUE : GLFW_GeneralMacro.FALSE,
    );

    this.loggerCall('Configure window hints', 'debug', 'GLFW');

    const window = GLFW.glfwCreateWindow(
      this.#width,
      this.#height,
      cstr(this.#title),
      null,
      null,
    );
    if (!window) {
      throw new DynamicLibError('window creation failed', 'GLFW');
    }

    switch (this.#state) {
      case 'minimized':
        this.minimize();
        break;
      case 'maximized':
        this.maximize();
        break;
      case 'normal':
        this.restore();
        break;
    }

    this.loggerCall(`Window "${this.#title}" created`, 'debug', 'GLFW');
    this.#windowPtr = window;
    // Apply initial properties
    this.opacity = this.#opacity;

    this.#loadWindowSize();
    this.#loadFramebufferSize();
    this.#loadWindowScale();

    const myViewId = VIEW_IDS.values().next().value!;
    VIEW_IDS.delete(myViewId);
    this.#viewId = myViewId;

    const windowPosCB = buildCallback(
      glfwWindowPositionCallback,
      (win, xpos, ypos) => {
        if (this.#windowPtr !== win) return;
        this.#x = xpos;
        this.#y = ypos;
        this.#dispatchEvent('window-move');
      },
    );
    const windowSizeCB = buildCallback(
      glfwWindowSizeCallback,
      (win, width, height) => {
        if (this.#windowPtr !== win) return;
        this.#width = width;
        this.#height = height;
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
        this.#state = iconified ? 'minimized' : 'normal';
        this.#loadWindowSize();
        this.#dispatchEvent(iconified ? 'window-minimized' : 'window-restored');
      },
    );
    const windowMaximizeCB = buildCallback(
      glfwWindowMaximizeCallback,
      (win, maximized) => {
        if (this.#windowPtr !== win) return;
        this.#state = maximized ? 'maximized' : 'normal';
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

    GLFW.glfwSetWindowPosCallback(window, windowPosCB.ptr);
    GLFW.glfwSetWindowSizeCallback(window, windowSizeCB.ptr);
    GLFW.glfwSetWindowFocusCallback(window, windowFocusCB.ptr);
    GLFW.glfwSetWindowIconifyCallback(window, windowIconifyCB.ptr);
    GLFW.glfwSetWindowMaximizeCallback(window, windowMaximizeCB.ptr);
    GLFW.glfwSetWindowContentScaleCallback(window, windowContentScaleCB.ptr);
    GLFW.glfwSetFramebufferSizeCallback(window, windowFramebufferSizeCB.ptr);
    GLFW.glfwSetWindowCloseCallback(window, windowCloseCB.ptr);

    this.on('dispose', () => {
      GLFW.glfwSetWindowPosCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowSizeCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowFocusCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowIconifyCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowMaximizeCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowContentScaleCallback(window, 0 as Pointer);
      GLFW.glfwSetFramebufferSizeCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowCloseCallback(window, 0 as Pointer);
      windowPosCB.close();
      windowSizeCB.close();
      windowFocusCB.close();
      windowIconifyCB.close();
      windowMaximizeCB.close();
      windowContentScaleCB.close();
      windowFramebufferSizeCB.close();
      windowCloseCB.close();

      BGFX.bgfx_set_view_frame_buffer(
        this.#viewId,
        BGFX_MaximumLimits.MAX_UINT16,
      );
      VIEW_IDS.add(myViewId);
      this.loggerCall(
        `Releasing view ID ${this.#viewId} for window: ${this.#title}`,
        'info',
        'BGFX',
      );

      if (this.#fbHandlePtr !== BGFX_MaximumLimits.MAX_UINT16) {
        this.#destroyFramebuffer();
      }

      GLFW.glfwDestroyWindow(this.#windowPtr);
      this.loggerCall(`Window "${this.#title}" destroyed`, 'info', 'GLFW');
      this.#windowPtr = null;
    });

    this.#rebuildStacks();
    this.enable();
  }

  #destroyFramebuffer() {
    BGFX.bgfx_set_view_frame_buffer(
      this.#viewId,
      BGFX_MaximumLimits.MAX_UINT16,
    );
    BGFX.bgfx_destroy_frame_buffer(this.#fbHandlePtr);
    this.#fbHandlePtr = BGFX_MaximumLimits.MAX_UINT16;
    this.loggerCall(
      `Framebuffer destroyed for window: ${this.#title}`,
      'debug',
      'BGFX',
    );
  }

  #loadFramebufferSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    this.#bufferWidth = this.#widthAux[0]!;
    this.#bufferHeight = this.#heightAux[0]!;
  }

  #loadWindowSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    this.#width = this.#widthAux[0]!;
    this.#height = this.#heightAux[0]!;
  }

  #loadWindowScale() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowContentScale(
      this.#windowPtr,
      ptr(this.#xsAux),
      ptr(this.#ysAux),
    );
    this.#xScale = this.#xsAux[0]!;
    this.#yScale = this.#ysAux[0]!;
  }

  #dispatchEvent(eventKey: keyof WindowEventMap) {
    console.log('ev', eventKey);
    const event = new WindowEvent({
      currentDisplayId: GLFW.glfwGetWindowMonitor(this.#windowPtr) ?? 0,
      windowId: this.viewId,
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
    this.traverse(
      (n) => {
        if (n !== this && n instanceof Node) nextStack.push(n as Node);
      },
      { ignoreType: Window as any },
    );
    this.#stack = nextStack;
    this.#scheduleDirty = false;
  }

  #rebuildFrameBuffer() {
    if (!this.#windowPtr) return;
    if (!this.#bufferHeight || !this.#bufferWidth) {
      this.loggerCall(
        `Skipping framebuffer rebuild for window: ${this.#title} due to zero size (${this.#bufferWidth}x${this.#bufferHeight})`,
        'warn',
        'BGFX',
      );
      return false;
    }

    if (this.#fbHandlePtr !== BGFX_MaximumLimits.MAX_UINT16) {
      this.#destroyFramebuffer();
    }

    this.loggerCall(
      `Rebuilding framebuffer for window: ${this.#title} (${this.#bufferWidth}x${this.#bufferHeight})`,
      'info',
      'BGFX',
    );

    const windowHandler = getNativeWindowHandler(this.#windowPtr);
    const fbHandle = BGFX.bgfx_create_frame_buffer_from_nwh(
      windowHandler,
      this.#bufferWidth,
      this.#bufferHeight,
      BGFX_TextureFormat.Count,
      BGFX_TextureFormat.Count,
    );
    if (fbHandle === BGFX_MaximumLimits.MAX_UINT16) {
      throw new DynamicLibError('framebuffer creation failed', 'BGFX');
    }
    this.#fbHandlePtr = fbHandle;
    this.loggerCall(
      `Framebuffer created for window: ${this.#title} (handle: ${fbHandle})`,
      'debug',
      'BGFX',
    );

    BGFX.bgfx_set_view_frame_buffer(this.#viewId, fbHandle);
    this.loggerCall(
      `Framebuffer assigned to view ID ${this.#viewId} for window: ${this.#title}`,
      'debug',
      'BGFX',
    );
    return true;
  }

  #render() {
    if (this.isDirty || this.#fbHandlePtr === BGFX_MaximumLimits.MAX_UINT16) {
      const success = this.#rebuildFrameBuffer();
      if (success) this.unmarkAsDirty();

      return;
    }

    // BGFX.bgfx_set_view_clear(
    //   this.#viewId,
    //   BGFX_Clear.COLOR | BGFX_Clear.DEPTH | BGFX_Clear.STENCIL,
    //   0xff30aa_ff,
    //   1.0,
    //   0,
    // );
    // BGFX.bgfx_set_view_rect(
    //   this.#viewId,
    //   0,
    //   0,
    //   this.#bufferWidth,
    //   this.#bufferHeight,
    // );
    BGFX.bgfx_touch(this.#viewId);
  }
}
