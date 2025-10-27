import type { EventMap } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  BGFX,
  BGFX_Clear,
  BGFX_MaximumLimits,
  BGFX_TextureFormat,
  cstr,
  GLFW,
  GLFW_GeneralMacro,
  GLFW_InitMacro,
  GLFW_WindowMacro,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { Vector2 } from '../math';
import { Node } from './Node';
import { getNativeWindowHandler } from './_common';

export type WindowProperties = {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};

const MAX_WINDOWS_COUNT = 256;
const VIEW_IDS = new Set<number>(
  Array.from({ length: MAX_WINDOWS_COUNT - 1 }, (_, i) => i + 1),
);

export class Window<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<P, M, T> {
  static #activeWindows: number = 1;

  #windowPtr: Pointer | null = null;
  #fbHandlePtr: number = BGFX_MaximumLimits.MAX_UINT16;

  #viewId: number = -1;

  #title: string;
  #x: number = 0;
  #y: number = 0;
  #width: number = 0;
  #height: number = 0;

  #stack: Node[] = [];
  #scheduleDirty: boolean = true;

  #heightAux: Int32Array = new Int32Array(1);
  #widthAux: Int32Array = new Int32Array(1);

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

  getWindowSize() {
    if (!this.#windowPtr) {
      return new Vector2();
    }
    GLFW.glfwGetWindowSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    return new Vector2(this.#widthAux[0], this.#heightAux[0]);
  }

  getFramebufferSize() {
    if (!this.#windowPtr) {
      return new Vector2();
    }
    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#widthAux),
      ptr(this.#heightAux),
    );
    return new Vector2(this.#widthAux[0], this.#heightAux[0]);
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

    const myViewId = VIEW_IDS.values().next().value!;
    VIEW_IDS.delete(myViewId);
    this.#viewId = myViewId;

    const unsubscribes = [
      (this as Window).subscribe('window-resize', (ev) => {
        this.#x = ev.x;
        this.#y = ev.y;
        this.#width = ev.width;
        this.#height = ev.height;
        this.markAsDirty();
      }),
    ];

    this.#rebuildStacks();
    this.#rebuildFrameBuffer();

    this.on('dispose', () => {
      unsubscribes.forEach((fn) => fn());
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

    const windowHandler = getNativeWindowHandler(this.#windowPtr);
    const fSize = this.getFramebufferSize();
    if (this.#fbHandlePtr !== BGFX_MaximumLimits.MAX_UINT16) {
      BGFX.bgfx_set_view_frame_buffer(
        this.#viewId,
        BGFX_MaximumLimits.MAX_UINT16,
      );
      BGFX.bgfx_destroy_frame_buffer(this.#fbHandlePtr);
      this.#fbHandlePtr = BGFX_MaximumLimits.MAX_UINT16;
    }
    this.loggerCall(
      `Rebuilding framebuffer for window: ${this.#title} (${fSize.x}x${fSize.y})`,
      'info',
      'BGFX',
    );

    const fbHandle = BGFX.bgfx_create_frame_buffer_from_nwh(
      windowHandler,
      fSize.x,
      fSize.y,
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
      BGFX_Clear.COLOR | BGFX_Clear.DEPTH,
      0xff0000ff,
      1.0,
      0,
    );
    BGFX.bgfx_set_view_rect(this.#viewId, 0, 0, this.#width, this.#height);

    // TODO: implement render logic
  }
}

/*
glfwSetWindowPosCallback
glfwSetWindowSizeCallback
glfwSetWindowCloseCallback
glfwSetWindowRefreshCallback
glfwSetWindowFocusCallback
glfwSetWindowIconifyCallback
glfwSetWindowMaximizeCallback
glfwSetFramebufferSizeCallback
glfwSetWindowContentScaleCallback
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
glfwGetFramebufferSize
glfwGetWindowContentScale
glfwGetWindowMonitor
glfwGetKey
glfwGetMouseButton
glfwGetCursorPos

# Get/Set
glfwGetWindowTitle
glfwSetWindowTitle

glfwGetWindowPos
glfwSetWindowPos

glfwGetWindowSize
glfwSetWindowSize

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
