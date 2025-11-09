import type { Pointer } from 'bun:ffi';
import { GLFW_ErrorCodes, GLFW_GeneralMacro } from './enums';
import { GLFW } from './loader';

export function getGlfwErrorDescription(errorCode: GLFW_ErrorCodes): string {
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

export function isWayland(): boolean {
  const platform = GLFW.glfwGetPlatform();
  return platform === GLFW_GeneralMacro.PLATFORM_WAYLAND;
}

export function getNativeWindow(window: Pointer): [bigint, bigint] {
  switch (process.platform) {
    case 'win32': {
      return [BigInt(GLFW.glfwGetWin32Window(window) || 0), 0n];
    }
    case 'linux': {
      if (isWayland()) {
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
      return [0n, 0n];
  }
}
