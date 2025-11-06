import { GLFW, GLFW_GeneralMacro } from '@bunbox/glfw';
import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../errors';
import { Vector2 } from '../math';

export abstract class AbstractRenderer implements Disposable {
  static #rendererCount = new Map<string, number>();

  protected static _increaseRendererCount(systemType: string) {
    const currentCount = AbstractRenderer.#rendererCount.get(systemType) || 0;
    AbstractRenderer.#rendererCount.set(systemType, currentCount + 1);
    return currentCount + 1;
  }

  protected static _decreaseRendererCount(systemType: string) {
    const currentCount = AbstractRenderer.#rendererCount.get(systemType) || 0;
    if (currentCount > 0) {
      AbstractRenderer.#rendererCount.set(systemType, currentCount - 1);
    }
    return currentCount - 1;
  }

  protected static _isWayland(): boolean {
    const platform = GLFW.glfwGetPlatform();
    return platform === GLFW_GeneralMacro.PLATFORM_WAYLAND;
  }

  protected static _getNativeWindow(window: Pointer) {
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

    AbstractRenderer._increaseRendererCount(this._systemType());

    if (!this._isSystemLoaded()) {
      this._initiateSystem();
    }

    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    const count = AbstractRenderer._decreaseRendererCount(this._systemType());

    if (count === 0) {
      this._releaseSystem();
    }
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

  abstract render(meshes: any[], delta: number): void;
  protected abstract _systemType(): string;
  protected abstract _isSystemLoaded(): boolean;
  protected abstract _rebuildSwapChain(width: number, height: number): void;
  protected abstract _initiateSystem(): void;
  protected abstract _releaseSystem(): void;
}
