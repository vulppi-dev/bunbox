import { GLFW_ErrorCodes } from './enums';

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
