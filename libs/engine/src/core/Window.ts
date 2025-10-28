import type { EventMap, MergeEventMaps } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  BGFX,
  BGFX_Clear,
  BGFX_MaximumLimits,
  BGFX_State,
  BGFX_TextureFormat,
  buildCallback,
  cstr,
  GLFW,
  GLFW_GeneralMacro,
  GLFW_InitMacro,
  GLFW_WindowMacro,
  glfwWindowCloseCallback,
  glfwWindowContentScaleCallback,
  glfwWindowFocusCallback,
  glfwWindowIconifyCallback,
  glfwWindowMaximizeCallback,
  glfwWindowPositionCallback,
  glfwWindowRefreshCallback,
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

export type WindowProperties = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

export type WindowEventMap = {
  'window-shown': [event: WindowEvent];
  'window-hidden': [event: WindowEvent];
  'window-move': [event: WindowEvent];
  'window-resize': [event: WindowEvent];
  'window-minimized': [event: WindowEvent];
  'window-maximized': [event: WindowEvent];
  'window-restored': [event: WindowEvent];
  'window-pointer-enter': [event: WindowEvent];
  'window-pointer-leave': [event: WindowEvent];
  'window-focus': [event: WindowEvent];
  'window-blur': [event: WindowEvent];
  'window-display-changed': [event: WindowEvent];
  'window-fullscreen-enter': [event: WindowEvent];
  'window-fullscreen-leave': [event: WindowEvent];
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
  #monitor: any = null;

  #title: string;
  #x: number = 0;
  #y: number = 0;
  #width: number = 0;
  #height: number = 0;
  #bufferWidth: number = 0;
  #bufferHeight: number = 0;
  #xScale: number = 1;
  #yScale: number = 1;

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

    const { width = 800, height = 600, x = -1, y = -1 } = props || {};

    this.#title = title;
    this.#width = width;
    this.#height = height;
    this.#x = x;
    this.#y = y;

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

  set title(value: string) {
    this.#title = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowTitle(this.#windowPtr, cstr(this.#title));
    this.markAsDirty();
  }

  set x(value: number) {
    this.#x = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
    this.markAsDirty();
  }

  set y(value: number) {
    this.#y = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowPos(this.#windowPtr, this.#x, this.#y);
    this.markAsDirty();
  }

  set width(value: number) {
    this.#width = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
    this.markAsDirty();
  }

  set height(value: number) {
    this.#height = value;
    if (this.#windowPtr)
      GLFW.glfwSetWindowSize(this.#windowPtr, this.#width, this.#height);
    this.markAsDirty();
  }

  loadFramebufferSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    this.#bufferWidth = this.#widthAux[0]!;
    this.#bufferHeight = this.#heightAux[0]!;
  }

  loadWindowSize() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    this.#width = this.#widthAux[0]!;
    this.#height = this.#heightAux[0]!;
  }

  loadWindowScale() {
    if (!this.#windowPtr) return;

    GLFW.glfwGetWindowContentScale(
      this.#windowPtr,
      ptr(this.#xsAux),
      ptr(this.#ysAux),
    );
    this.#xScale = this.#xsAux[0]!;
    this.#yScale = this.#ysAux[0]!;
  }

  /**
   * # internal use only
   * @ignore internal use only
   */
  _appTriggerProcessStack(delta: number) {
    if (!this.isEnabled) return;
    if (this.#scheduleDirty) this.#rebuildStacks();

    this._process(delta);
    for (const node of this.#stack) {
      if (node.isEnabled) {
        node._process(delta);
      }
    }
    this.#render();
  }

  override _process(_deltaTime: number): void {
    if (GLFW.glfwWindowShouldClose(this.#windowPtr)) {
      this.dispose();
      return;
    }

    if (!this.isDirty) return;
    this.#rebuildFrameBuffer();
    this.unmarkAsDirty();
  }

  protected override _getType(): string {
    return 'Window';
  }

  protected override _ready(): void {
    if (this.#windowPtr) return;
    this.disable();
    this.loggerCall(`Creating window: ${this.#title}`, 'info', 'GLFW');

    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, 0);
    GLFW.glfwWindowHint(GLFW_WindowMacro.VISIBLE, GLFW_InitMacro.TRUE);
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_X,
      this.#x >= 0 ? this.#x : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.POSITION_Y,
      this.#y >= 0 ? this.#y : GLFW_GeneralMacro.ANY_POSITION,
    );
    GLFW.glfwWindowHint(
      GLFW_WindowMacro.TRANSPARENT_FRAMEBUFFER,
      GLFW_InitMacro.TRUE,
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
    this.loggerCall(`Window "${this.#title}" created`, 'debug', 'GLFW');
    this.#windowPtr = window;
    this.loadWindowSize();
    this.loadFramebufferSize();
    this.#monitor = GLFW.glfwGetWindowMonitor(window);

    const myViewId = VIEW_IDS.values().next().value!;
    VIEW_IDS.delete(myViewId);
    this.#viewId = myViewId;

    const windowPosCB = buildCallback(
      glfwWindowPositionCallback,
      (win, xpos, ypos) => {
        if (this.#windowPtr !== win) return;
        this.#x = xpos;
        this.#y = ypos;
        this.markAsDirty();
        this.#dispatchEvent('window-move');
      },
    );
    const windowSizeCB = buildCallback(
      glfwWindowSizeCallback,
      (win, width, height) => {
        if (this.#windowPtr !== win) return;
        this.#width = width;
        this.#height = height;
        this.markAsDirty();
        this.#dispatchEvent('window-resize');
      },
    );
    const windowCloseCB = buildCallback(glfwWindowCloseCallback, (win) => {
      if (this.#windowPtr !== win) return;
      this.dispose();
    });
    const windowRefreshCB = buildCallback(glfwWindowRefreshCallback, (win) => {
      if (this.#windowPtr !== win) return;
      this.#dispatchEvent('window-restored');
    });
    const windowFocusCB = buildCallback(
      glfwWindowFocusCallback,
      (win, focused) => {
        if (this.#windowPtr !== win) return;
        this.#dispatchEvent(focused ? 'window-focus' : 'window-blur');
      },
    );
    const windowIconifyCB = buildCallback(
      glfwWindowIconifyCallback,
      (win, iconified) => {
        if (this.#windowPtr !== win) return;
        this.#dispatchEvent(iconified ? 'window-minimized' : 'window-restored');
      },
    );
    const windowMaximizeCB = buildCallback(
      glfwWindowMaximizeCallback,
      (win, maximized) => {
        if (this.#windowPtr !== win) return;
        this.#dispatchEvent(
          maximized ? 'window-maximized' : 'window-minimized',
        );
      },
    );
    const windowContentScaleCB = buildCallback(
      glfwWindowContentScaleCallback,
      (win, xscale, yscale) => {
        if (this.#windowPtr !== win) return;
        this.#xScale = xscale;
        this.#yScale = yscale;
        this.loadFramebufferSize();
        this.#monitor = GLFW.glfwGetWindowMonitor(win);
        this.markAsDirty();
        this.#dispatchEvent('window-display-changed');
      },
    );

    GLFW.glfwSetWindowPosCallback(window, windowPosCB.ptr);
    GLFW.glfwSetWindowSizeCallback(window, windowSizeCB.ptr);
    GLFW.glfwSetWindowCloseCallback(window, windowCloseCB.ptr);
    GLFW.glfwSetWindowRefreshCallback(window, windowRefreshCB.ptr);
    GLFW.glfwSetWindowFocusCallback(window, windowFocusCB.ptr);
    GLFW.glfwSetWindowIconifyCallback(window, windowIconifyCB.ptr);
    GLFW.glfwSetWindowMaximizeCallback(window, windowMaximizeCB.ptr);
    GLFW.glfwSetWindowContentScaleCallback(window, windowContentScaleCB.ptr);

    this.#rebuildStacks();
    this.#rebuildFrameBuffer();

    this.on('dispose', () => {
      GLFW.glfwSetWindowPosCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowSizeCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowCloseCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowRefreshCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowFocusCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowIconifyCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowMaximizeCallback(window, 0 as Pointer);
      GLFW.glfwSetWindowContentScaleCallback(window, 0 as Pointer);
      windowPosCB.close();
      windowSizeCB.close();
      windowCloseCB.close();
      windowRefreshCB.close();
      windowFocusCB.close();
      windowIconifyCB.close();
      windowMaximizeCB.close();
      windowContentScaleCB.close();

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
        BGFX.bgfx_destroy_frame_buffer(this.#fbHandlePtr);
        this.loggerCall(
          `Framebuffer destroyed for window: ${this.#title}`,
          'debug',
          'BGFX',
        );
      }

      this.#fbHandlePtr = BGFX_MaximumLimits.MAX_UINT16;
      GLFW.glfwDestroyWindow(this.#windowPtr);
      this.loggerCall(`Window "${this.#title}" destroyed`, 'info', 'GLFW');
      this.#windowPtr = null;
    });

    this.enable();
    this.unmarkAsDirty();
  }

  #dispatchEvent(eventKey: keyof WindowEventMap) {
    console.log({ eventKey });
    const event = new WindowEvent({
      currentDisplayId: this.#monitor,
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

    this.loadFramebufferSize();
    const windowHandler = getNativeWindowHandler(this.#windowPtr);
    if (this.#fbHandlePtr !== BGFX_MaximumLimits.MAX_UINT16) {
      BGFX.bgfx_set_view_frame_buffer(
        this.#viewId,
        BGFX_MaximumLimits.MAX_UINT16,
      );
      BGFX.bgfx_destroy_frame_buffer(this.#fbHandlePtr);
      this.#fbHandlePtr = BGFX_MaximumLimits.MAX_UINT16;
    }
    this.loggerCall(
      `Rebuilding framebuffer for window: ${this.#title} (${this.#bufferWidth}x${this.#bufferHeight})`,
      'info',
      'BGFX',
    );

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
  }

  #render() {
    if (
      this.#fbHandlePtr === BGFX_MaximumLimits.MAX_UINT16 ||
      this.#viewId < 1 ||
      this.#viewId >= MAX_WINDOWS_COUNT
    )
      return;

    BGFX.bgfx_set_view_clear(
      this.#viewId,
      BGFX_Clear.COLOR | BGFX_Clear.DEPTH | BGFX_Clear.STENCIL,
      0x121212_ff,
      1.0,
      0,
    );
    BGFX.bgfx_set_view_rect(this.#viewId, 0, 0, this.#width, this.#height);
    BGFX.bgfx_set_state(BGFX_State.DEFAULT, 0);
    BGFX.bgfx_touch(this.#viewId);

    // TODO: implement render logic
  }
}

/*
glfwSetFramebufferSizeCallback
glfwSetKeyCallback
glfwSetCharCallback
glfwSetCharModsCallback
glfwSetMouseButtonCallback
glfwSetCursorPosCallback
glfwSetCursorEnterCallback
glfwSetScrollCallback
glfwSetDropCallback

glfwSetKeyCallback
glfwSetCharCallback
glfwSetCharModsCallback
glfwSetMouseButtonCallback
glfwSetCursorPosCallback
glfwSetCursorEnterCallback
glfwSetScrollCallback
glfwSetDropCallback


# Only gets
glfwGetKey
glfwGetMouseButton
glfwGetCursorPos

# Get/Set
? glfwGetWindowTitle
? glfwGetWindowPos
? glfwGetWindowSize

glfwGetWindowOpacity
glfwSetWindowOpacity

glfwGetWindowAttrib
glfwSetWindowAttrib

glfwGetWindowUserPointer
glfwSetWindowUserPointer

glfwGetInputMode
glfwSetInputMode

glfwGetClipboardString
glfwSetClipboardString

glfwWindowShouldClose
glfwSetWindowShouldClose

glfwDestroyWindow

glfwSetWindowIcon
glfwSetWindowAspectRatio
glfwIconifyWindow
glfwRestoreWindow
glfwMaximizeWindow
glfwShowWindow
glfwHideWindow
glfwFocusWindow
glfwRequestWindowAttention
glfwSetCursorPos
glfwSetCursor

*/
