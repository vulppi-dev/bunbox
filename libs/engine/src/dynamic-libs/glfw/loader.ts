import { dlopen } from 'bun:ffi';
import { GLFW_PATH } from '../paths';
import * as GLFW_FUNCTIONS from './functions';
import {
  DARWIN_FUNCTIONS,
  LINUX_FUNCTIONS,
  WINDOWS_FUNCTIONS,
} from './platform-functions';

if (!GLFW_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

const { symbols: GLFW, close: glfwClose } = dlopen(GLFW_PATH, {
  ...GLFW_FUNCTIONS,
  ...((process.platform === 'win32'
    ? WINDOWS_FUNCTIONS
    : {}) as typeof WINDOWS_FUNCTIONS),
  ...((process.platform === 'linux'
    ? LINUX_FUNCTIONS
    : {}) as typeof LINUX_FUNCTIONS),
  ...((process.platform === 'darwin'
    ? DARWIN_FUNCTIONS
    : {}) as typeof DARWIN_FUNCTIONS),
});

process.on('beforeExit', () => {
  glfwClose();
});

export * from './callbacks';
export * from './structs';
export * from './enums';
export { GLFW };
