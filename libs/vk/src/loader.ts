import { dlopen } from 'bun:ffi';
import * as VK_FUNCTIONS from './functions';
import { VK_PATH } from './paths';
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

const {
  symbols: VK,
  // eslint-disable-next-line
  close: vkClose,
} = dlopen(VK_PATH, {
  ...VK_FUNCTIONS,
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

export { VK };
