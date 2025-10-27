import { type Pointer } from 'bun:ffi';
import { GLFW } from '../dynamic-libs';
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
