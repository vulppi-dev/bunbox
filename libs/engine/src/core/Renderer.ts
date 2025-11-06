import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { GLFW, GLFW_GeneralMacro } from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { Vector2 } from '../math';
import type { Mesh } from '../nodes';
import type { RenderPassConfig } from './RenderPassConfig';

type ContextHandler = {
  device: Pointer;
  context: Pointer;
};

export class Renderer implements Disposable {
  static #context: ContextHandler | null = null;
  static #rendererCount = 0;

  static #getContext(window: Pointer): ContextHandler {
    if (Renderer.#context) {
      return Renderer.#context;
    }
    const [nhw, display] = Renderer.getNativeWindow(window);
    // const desc = instantiate();
    // DILIGENT.diligentCreateDeviceAndContext(DILIGENT_RenderDeviceType.VULKAN);
    return null as any;

    // const instanceDescriptor = instantiate(wgpuInstanceDescriptorStruct);
    // const instancePtr = WGPU.wgpuCreateInstance(
    //   ptr(getInstanceBuffer(instanceDescriptor)),
    // );
    // if (!instancePtr) {
    //   throw new DynamicLibError('Failed to create WGPU instance', 'WGPU');
    // }
    // Renderer.#instancePtr = instancePtr;
    // return instancePtr;
  }

  static isWayland(): boolean {
    const platform = GLFW.glfwGetPlatform();
    return platform === GLFW_GeneralMacro.PLATFORM_WAYLAND;
  }

  static getNativeWindow(window: Pointer) {
    switch (process.platform) {
      case 'win32': {
        return [BigInt(GLFW.glfwGetWin32Window(window) || 0), 0n];
      }
      case 'linux': {
        if (Renderer.isWayland()) {
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

  // Async initialized pointers
  #adapterPtr: Pointer | null = null;

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
    this.#loadFramebufferSize();

    Renderer.#rendererCount++;
    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    Renderer.#rendererCount--;

    // if (!Renderer.#rendererCount && !Renderer.#instancePtr) {
    //   Renderer.#instancePtr = 0 as Pointer;
    // }
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
