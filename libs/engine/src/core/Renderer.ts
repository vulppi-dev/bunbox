import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import { GLFW, GLFW_GeneralMacro } from '../dynamic-libs';
import { DynamicLibError } from '../errors';
import { Color, Vector2 } from '../math';
import type { Mesh } from '../nodes';
import type { RenderPassConfig } from './RenderPassConfig';
import { getInstanceBuffer, instantiate } from '@bunbox/struct';
import { WGPU_DEBUG } from '../singleton/logger';

export class Renderer implements Disposable {
  static #instancePtr: Pointer = 0 as Pointer;
  static #rendererCount = 0;

  static #getInstance(): Pointer {
    if (Renderer.#instancePtr) {
      return Renderer.#instancePtr;
    }

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

  static getSurfaceDescriptor(window: Pointer) {
    // switch (process.platform) {
    //   case 'win32': {
    //     const desc = instantiate(wgpuSurfaceSourceWindowsHWNDStruct);
    //     desc.chain.sType = WGPU_SType.SurfaceSourceWindowsHWND;
    //     desc.hinstance = 0n;
    //     desc.hwnd = BigInt(GLFW.glfwGetWin32Window(window) || 0);
    //     return desc;
    //   }
    //   case 'linux': {
    //     if (Renderer.isWayland()) {
    //       const desc = instantiate(wgpuSurfaceSourceWaylandSurfaceStruct);
    //       desc.chain.sType = WGPU_SType.SurfaceSourceWaylandSurface;
    //       desc.display = BigInt(GLFW.glfwGetWaylandDisplay() || 0);
    //       desc.surface = BigInt(GLFW.glfwGetWaylandWindow(window) || 0);
    //       return desc;
    //     } else {
    //       const desc = instantiate(wgpuSurfaceSourceXlibWindowStruct);
    //       desc.chain.sType = WGPU_SType.SurfaceSourceXlibWindow;
    //       desc.display = BigInt(GLFW.glfwGetX11Display() || 0);
    //       desc.window = BigInt(GLFW.glfwGetX11Window(window) || 0);
    //       return desc;
    //     }
    //   }
    //   case 'darwin': {
    //     const desc = instantiate(wgpuSurfaceSourceMetalLayerStruct);
    //     desc.chain.sType = WGPU_SType.SurfaceSourceMetalLayer;
    //     desc.layer = BigInt(GLFW.glfwGetCocoaWindow(window) || 0);
    //     return desc;
    //   }
    //   default:
    //     throw new DynamicLibError(
    //       `Unsupported platform: ${process.platform}`,
    //       'GLFW',
    //     );
    // }
  }

  #windowPtr: Pointer;
  #surfacePtr: Pointer;

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

    WGPU_DEBUG('Creating renderer for window:');
    const instance = Renderer.#getInstance();
    const surfaceDesc = Renderer.getSurfaceDescriptor(this.#windowPtr);
    const surfaceDescriptor = instantiate(wgpuSurfaceDescriptorStruct);
    surfaceDescriptor.nextInChain = BigInt(ptr(getInstanceBuffer(surfaceDesc)));
    const surfacePtr = WGPU.wgpuInstanceCreateSurface(
      instance,
      ptr(getInstanceBuffer(surfaceDescriptor)),
    );
    if (!surfacePtr) {
      throw new DynamicLibError('Failed to create WGPU surface', 'WGPU');
    }
    WGPU_DEBUG(`  Surface pointer: 0x${surfacePtr.toString(16)}`);
    this.#surfacePtr = surfacePtr;

    Renderer.#rendererCount++;
    this.rebuildFrame();

    this.prepare();
  }

  dispose(): void | Promise<void> {
    Renderer.#rendererCount--;
    WGPU_DEBUG('Disposing renderer for window:');

    if (this.#adapterPtr) {
      WGPU_DEBUG(`  Adapter pointer: 0x${this.#adapterPtr.toString(16)}`);
      WGPU.wgpuAdapterRelease(this.#adapterPtr);
      this.#adapterPtr = null;
    }

    WGPU_DEBUG(`  Surface pointer: 0x${this.#surfacePtr.toString(16)}`);
    WGPU.wgpuSurfaceRelease(this.#surfacePtr);

    if (!Renderer.#rendererCount && !Renderer.#instancePtr) {
      WGPU_DEBUG('Disposing WGPU instance:');
      WGPU_DEBUG(`  Instance pointer: 0x${Renderer.#instancePtr.toString(16)}`);
      WGPU.wgpuInstanceRelease(Renderer.#instancePtr);
      Renderer.#instancePtr = 0 as Pointer;
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

  async prepare() {
    const adapter = await requestAdapter(this.#windowPtr, this.#surfacePtr);
    this.#adapterPtr = adapter;
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
