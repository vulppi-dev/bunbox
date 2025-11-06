import { dlopen } from 'bun:ffi';
import { LLGL_PATH } from '../paths';
import * as LLGL_FUNCTIONS from './functions';

if (!LLGL_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

const { symbols: LLGL, close: llglClose } = dlopen(LLGL_PATH, {
  ...LLGL_FUNCTIONS,
});

process.on('beforeExit', () => {
  llglClose();
});

export * from './structs';
export * from './enums';
export * from './utils';
export { LLGL };
