import { type Pointer } from 'bun:ffi';
import { BGFX_RenderType, GLFW } from '../dynamic-libs';
import { DynamicLibError } from '../errors';

export function getNativeWindowHandler(window: Pointer): Pointer | null {
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

const MAIN_WINDOW_KEY = Symbol('MAIN_WINDOW_KEY');

export const MAIN_WINDOW = {
  [MAIN_WINDOW_KEY]: null as null | Pointer,
  set(ptr: Pointer | null) {
    this[MAIN_WINDOW_KEY] = ptr;
  },
  get() {
    return this[MAIN_WINDOW_KEY];
  },
};
