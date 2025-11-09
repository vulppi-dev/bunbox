import { GLFW, GLFW_GeneralMacro } from '@bunbox/glfw';
import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../errors';
import { Vector2 } from '../math';

export abstract class AbstractRenderer implements Disposable {
  protected static _isWayland(): boolean {
    const platform = GLFW.glfwGetPlatform();
    return platform === GLFW_GeneralMacro.PLATFORM_WAYLAND;
  }

  protected static _getNativeWindow(window: Pointer): [bigint, bigint] {
    switch (process.platform) {
      case 'win32': {
        return [BigInt(GLFW.glfwGetWin32Window(window) || 0), 0n];
      }
      case 'linux': {
        if (AbstractRenderer._isWayland()) {
          return [
            BigInt(GLFW.glfwGetWaylandWindow(window) || 0),
            BigInt(GLFW.glfwGetWaylandDisplay() || 0),
          ];
        } else {
          return [
            BigInt(GLFW.glfwGetX11Window(window) || 0),
            BigInt(GLFW.glfwGetX11Display() || 0),
          ];
        }
      }
      case 'darwin': {
        return [BigInt(GLFW.glfwGetCocoaWindow(window) || 0), 0n];
      }
      default:
        throw new DynamicLibError(
          `Unsupported platform: ${process.platform}`,
          'GLFW',
        );
    }
  }

  #windowPtr: Pointer;

  #width: Int32Array;
  #height: Int32Array;

  constructor(window: Pointer) {
    // Prepare auxiliary buffers
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);

    // Initialize window
    this.#windowPtr = window;
    this._prepare();
    this.rebuildFrame();
  }

  rebuildFrame(): void {
    this.#loadFramebufferSize();
    const width = this.#width[0]!;
    const height = this.#height[0]!;
    this._rebuildSwapChain(width, height);
  }

  #loadFramebufferSize() {
    if (!this.#windowPtr) {
      return new Vector2();
    }
    GLFW.glfwGetFramebufferSize(
      this.#windowPtr,
      ptr(this.#width),
      ptr(this.#height),
    );
  }

  protected _getWindow() {
    return this.#windowPtr;
  }

  protected _getNativeWindow() {
    return AbstractRenderer._getNativeWindow(this.#windowPtr);
  }

  abstract dispose(): void | Promise<void>;
  abstract render(meshes: any[], delta: number): void;
  protected abstract _prepare(): void | Promise<void>;
  protected abstract _rebuildSwapChain(width: number, height: number): void;
}
