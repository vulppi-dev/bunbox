import { dlopen } from 'bun:ffi';
import { VK_PATH } from '../paths';
import * as VK_FUNCS from './functions';
import {
  DARWIN_FUNCTIONS,
  LINUX_FUNCTIONS,
  WINDOWS_FUNCTIONS,
} from './platform-functions';

if (!VK_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

const { symbols: VK, close: vkClose } = dlopen(VK_PATH, {
  ...VK_FUNCS,
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
  vkClose();
});

export * from './callbacks';
export * from './structs';
export * from './enums';
export * from './utils';
export { VK };
