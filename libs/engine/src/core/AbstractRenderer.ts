import { GLFW } from '@bunbox/glfw';
import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { Vector2 } from '../math';
import type { AbstractCamera, Light, Mesh } from '../nodes';

export interface RendererOptions {
  msaa?: 1 | 2 | 4 | 8;
}

export abstract class AbstractRenderer implements Disposable {
  #windowPtr: Pointer;

  #width: Int32Array;
  #height: Int32Array;

  constructor(window: Pointer, options?: RendererOptions) {
    // Prepare auxiliary buffers
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);

    // Initialize window
    this.#windowPtr = window;
    this._prepare(options);
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

  abstract dispose(): void | Promise<void>;
  abstract render(
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
    delta: number,
  ): void;
  protected abstract _prepare(options?: RendererOptions): void | Promise<void>;
  protected abstract _rebuildSwapChain(width: number, height: number): void;
}
