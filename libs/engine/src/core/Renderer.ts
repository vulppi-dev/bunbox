import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { GLFW, GLFW_GeneralMacro } from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { Color, Vector2 } from '../math';
import type { Mesh } from '../nodes';
import type { RenderPassConfig } from './RenderPassConfig';

export class Renderer implements Disposable {
  static getNativeWindowHandler(window: Pointer): Pointer | null {
    switch (process.platform) {
      case 'win32':
        return GLFW.glfwGetWin32Window(window);
      case 'linux':
        const p = GLFW.glfwGetPlatform();

        return GLFW_GeneralMacro.PLATFORM_WAYLAND === p
          ? GLFW.glfwGetWaylandWindow(window)
          : GLFW.glfwGetX11Window(window);
      case 'darwin':
        return GLFW.glfwGetCocoaWindow(window);
      default:
        throw new DynamicLibError(
          `Unsupported platform: ${process.platform}`,
          'GLFW',
        );
    }
  }

  #windowPtr: Pointer;

  // Base window clear surface
  #clearColor: Color = new Color(0, 0, 0, 1);

  // Cached window framebuffer size
  #width: Int32Array;
  #height: Int32Array;

  // Auxiliary data
  #ptr_aux: BigUint64Array;

  constructor(window: Pointer) {
    // Prepare auxiliary buffers
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);

    this.#ptr_aux = new BigUint64Array(1);

    // Initialize window
    this.#windowPtr = window;

    this.rebuildFrame();
  }

  get clearColor(): Color {
    return this.#clearColor;
  }

  set clearColor(color: Color) {
    this.#clearColor = color;
  }

  /**
   * Add a render pass with configuration
   */
  addRenderPass(config: RenderPassConfig): any {}

  /**
   * Remove a render pass
   */
  removeRenderPass(renderPass: any): boolean {
    return true;
  }

  clearAdditionalPasses(): void {}

  /**
   * Replace a render pass with another
   */
  replaceRenderPass(oldPass: any, newConfig: RenderPassConfig): boolean {
    return true;
  }

  dispose(): void | Promise<void> {}

  rebuildFrame(): void {
    this.#loadFramebufferSize();

    const width = this.#width[0]!;
    const height = this.#height[0]!;
  }

  render(meshes: Mesh[], delta: number): void {}

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

  #querySurfaceFormat(): number {
    return 0;
  }
}
