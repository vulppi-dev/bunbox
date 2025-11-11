import { GLFW } from '@bunbox/glfw';
import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { Color, Vector2 } from '../math';
import type { AbstractCamera, Light, Mesh } from '../nodes';

export interface RendererOptions {
  msaa?: 1 | 2 | 4 | 8;
}

export abstract class AbstractRenderer implements Disposable {
  private __windowPtr: Pointer;

  private __width: Int32Array;
  private __height: Int32Array;

  protected _clearColor: Color = new Color(0, 0, 0, 1);

  constructor(window: Pointer, options?: RendererOptions) {
    // Prepare auxiliary buffers
    this.__width = new Int32Array(1);
    this.__height = new Int32Array(1);

    // Initialize window
    this.__windowPtr = window;
  }

  get width(): number {
    return this.__width[0]!;
  }

  get height(): number {
    return this.__height[0]!;
  }

  rebuildFrame(): void {
    this.__loadFramebufferSize();
  }

  private __loadFramebufferSize() {
    if (!this.__windowPtr) {
      return new Vector2();
    }
    GLFW.glfwGetFramebufferSize(
      this.__windowPtr,
      ptr(this.__width),
      ptr(this.__height),
    );
  }

  protected _getWindow() {
    return this.__windowPtr;
  }

  getClearColor(): Color {
    return this._clearColor;
  }

  setClearColor(color: Color): void {
    this._clearColor = color;
  }

  abstract dispose(): void | Promise<void>;
  abstract render(
    cameras: AbstractCamera[],
    meshes: Mesh[],
    lights: Light[],
    delta: number,
  ): void;
}
