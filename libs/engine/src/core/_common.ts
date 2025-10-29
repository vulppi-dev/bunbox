import { type Pointer } from 'bun:ffi';
import { BGFX_RenderType, GLFW, GLFW_ErrorCodes } from '../dynamic-libs';
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

export function getGLFWErrorDescription(errorCode: number): string {
  switch (errorCode) {
    case GLFW_ErrorCodes.API_UNAVAILABLE:
      return 'GLFW API unavailable';
    case GLFW_ErrorCodes.CURSOR_UNAVAILABLE:
      return 'GLFW Cursor unavailable';
    case GLFW_ErrorCodes.FEATURE_UNAVAILABLE:
      return 'GLFW Feature unavailable';
    case GLFW_ErrorCodes.FEATURE_UNIMPLEMENTED:
      return 'GLFW Feature unimplemented';
    case GLFW_ErrorCodes.FORMAT_UNAVAILABLE:
      return 'GLFW Format unavailable';
    case GLFW_ErrorCodes.INVALID_ENUM:
      return 'GLFW Invalid enum';
    case GLFW_ErrorCodes.INVALID_VALUE:
      return 'GLFW Invalid value';
    case GLFW_ErrorCodes.NOT_INITIALIZED:
      return 'GLFW Not initialized';
    case GLFW_ErrorCodes.NO_CURRENT_CONTEXT:
      return 'GLFW No current context';
    case GLFW_ErrorCodes.NO_ERROR:
      return 'GLFW No error';
    case GLFW_ErrorCodes.NO_WINDOW_CONTEXT:
      return 'GLFW No window context';
    case GLFW_ErrorCodes.OUT_OF_MEMORY:
      return 'GLFW Out of memory';
    case GLFW_ErrorCodes.PLATFORM_ERROR:
      return 'GLFW Platform error';
    case GLFW_ErrorCodes.PLATFORM_UNAVAILABLE:
      return 'GLFW Platform unavailable';
    case GLFW_ErrorCodes.VERSION_UNAVAILABLE:
      return 'GLFW Version unavailable';
    default:
      return `Unknown GLFW error code: ${errorCode}`;
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
