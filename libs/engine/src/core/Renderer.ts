import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  cstr,
  GLFW,
  GLFW_GeneralMacro,
  LLGL,
  llglRendererInfoStruct,
  llglRenderSystemDescriptorStruct,
  llglSwapChainDescriptorStruct,
} from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { Vector2 } from '../math';
import type { Mesh } from '../nodes';
import type { RenderPassConfig } from './RenderPassConfig';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { LLGL_DEBUG } from '../singleton/logger';

type ContextHandler = {
  device: Pointer;
  context: Pointer;
};

export class Renderer implements Disposable {
  static #rendererCount = 0;
  static #systemLoaded = false;

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

  #width: Int32Array;
  #height: Int32Array;

  #swapChainPtr: Pointer | null = null;

  // Auxiliary data
  constructor(window: Pointer) {
    // Prepare auxiliary buffers
    this.#width = new Int32Array(1);
    this.#height = new Int32Array(1);

    // Initialize window
    this.#windowPtr = window;

    Renderer.#rendererCount++;

    if (!Renderer.#systemLoaded) {
      LLGL_DEBUG('Loading Vulkan render system...');
      const result = LLGL.llglLoadRenderSystem(ptr(cstr('Vulkan')));
      if (!result) {
        throw new DynamicLibError(
          'Failed to load Vulkan render system',
          'LLGL',
        );
      }
      Renderer.#systemLoaded = true;
    }

    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    Renderer.#rendererCount--;

    if (!Renderer.#rendererCount) {
      LLGL.llglUnloadRenderSystem();
      Renderer.#systemLoaded = false;
    }
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

    const swapChainDesc = instantiate(llglSwapChainDescriptorStruct);

    swapChainDesc.resolution.width = width;
    swapChainDesc.resolution.height = height;
    swapChainDesc.colorBits = 32;
    swapChainDesc.depthBits = 24;
    swapChainDesc.stencilBits = 8;
    swapChainDesc.samples = 1;
    swapChainDesc.swapBuffers = 1;

    // Create swap chain
    this.#swapChainPtr = LLGL.llglCreateSwapChainExt(
      ptr(getInstanceBuffer(swapChainDesc)),
    );

    const renderInfo = instantiate(llglRendererInfoStruct);
    LLGL.llglGetRendererInfo(ptr(getInstanceBuffer(renderInfo)));

    LLGL_DEBUG(`Renderer: ${renderInfo.rendererName}`);
    LLGL_DEBUG(`Device: ${renderInfo.deviceName}`);
    LLGL_DEBUG(`Vendor: ${renderInfo.vendorName}`);
    LLGL_DEBUG(`Shading language: ${renderInfo.shadingLanguageName}`);

    LLGL.llglSetVsyncInterval(this.#swapChainPtr, 1);
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
