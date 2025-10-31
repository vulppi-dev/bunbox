import { type Disposable } from '@bunbox/utils';
import { ptr, type Pointer } from 'bun:ffi';
import {
  BGFX,
  BGFX_Clear,
  BGFX_MaximumLimits,
  BGFX_RenderType,
  BGFX_TextureFormat,
  GLFW,
} from '../../dynamic-libs';
import { DynamicLibError } from '../../errors';
import type { Node3D } from '../../nodes';
import { Vector2 } from '../../math';
import { BGFX_DEBUG } from '../../singleton/logger';

const VIEW_IDS_SET = new Set(Array.from({ length: 254 }, (_, i) => i + 1));

export function getRendererName(r: BGFX_RenderType): string {
  switch (r) {
    case BGFX_RenderType.Direct3D11:
      return 'Direct3D11';
    case BGFX_RenderType.Direct3D12:
      return 'Direct3D12';
    case BGFX_RenderType.Metal:
      return 'Metal';
    case BGFX_RenderType.OpenGLES:
      return 'OpenGLES';
    case BGFX_RenderType.OpenGL:
      return 'OpenGL';
    case BGFX_RenderType.Vulkan:
      return 'Vulkan';
    default:
      return `Unknown(${r})`;
  }
}

export class Renderer implements Disposable {
  static getNativeWindowHandler(window: Pointer): Pointer | null {
    switch (process.platform) {
      case 'win32':
        return GLFW.glfwGetWin32Window(window);
      case 'linux':
        return GLFW.glfwGetX11Window(window);
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
  #viewId: number;
  #fbHandle: number = BGFX_MaximumLimits.MAX_UINT16;

  // Reusable buffers
  #width: Int32Array = new Int32Array(1);
  #height: Int32Array = new Int32Array(1);

  // Reusable struct buffers

  constructor(window: Pointer) {
    this.#windowPtr = window;
    if (VIEW_IDS_SET.size === 0) {
      throw new DynamicLibError('Maximum number of view IDs reached', 'BGFX');
    }
    this.#viewId = VIEW_IDS_SET.values().next().value!;
    VIEW_IDS_SET.delete(this.#viewId);
    this.rebuildFrame();
  }

  dispose(): void | Promise<void> {
    BGFX.bgfx_set_view_frame_buffer(
      this.#viewId,
      BGFX_MaximumLimits.MAX_UINT16,
    );
    VIEW_IDS_SET.add(this.#viewId);
    if (this.#fbHandle !== BGFX_MaximumLimits.MAX_UINT16) {
      BGFX.bgfx_destroy_frame_buffer(this.#fbHandle);
      this.#fbHandle = BGFX_MaximumLimits.MAX_UINT16;
    }
  }

  rebuildFrame(): void {
    const windowHandler = Renderer.getNativeWindowHandler(this.#windowPtr);
    this.#loadFramebufferSize();
    const frameSize = this.#getSize();

    if (this.#fbHandle !== BGFX_MaximumLimits.MAX_UINT16) {
      BGFX.bgfx_set_view_frame_buffer(
        this.#viewId,
        BGFX_MaximumLimits.MAX_UINT16,
      );
      BGFX.bgfx_destroy_frame_buffer(this.#fbHandle);
      this.#fbHandle = BGFX_MaximumLimits.MAX_UINT16;
    }
    BGFX_DEBUG(
      `Rebuilding framebuffer for window: ${windowHandler} (${frameSize.x}x${frameSize.y})`,
    );

    const fbHandle = BGFX.bgfx_create_frame_buffer_from_nwh(
      windowHandler,
      frameSize.x,
      frameSize.y,
      BGFX_TextureFormat.Count,
      BGFX_TextureFormat.Count,
    );

    if (fbHandle === BGFX_MaximumLimits.MAX_UINT16) {
      console.error('Failed to create framebuffer from native window handle');
      return;
    }

    this.#fbHandle = fbHandle;
    BGFX.bgfx_set_view_frame_buffer(this.#viewId, fbHandle);
    BGFX_DEBUG(`Framebuffer rebuilt with handle: ${fbHandle}`);
  }

  render(_nodes: Node3D[]): void {
    if (this.#fbHandle === BGFX_MaximumLimits.MAX_UINT16) return;
    const frameSize = this.#getSize();

    BGFX.bgfx_set_view_clear(
      this.#viewId,
      BGFX_Clear.COLOR | BGFX_Clear.DEPTH,
      0xff0000ff,
      1.0,
      0,
    );
    BGFX.bgfx_set_view_rect(this.#viewId, 0, 0, frameSize.x, frameSize.y);
    BGFX.bgfx_touch(this.#viewId);
  }

  #getSize(): Vector2 {
    return new Vector2(this.#width[0], this.#height[0]);
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
}
