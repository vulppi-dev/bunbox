import { dlopen } from 'bun:ffi';
import { WGPU_PATH } from '../paths';
import * as WGPU_FUNCTIONS from './functions';

if (!WGPU_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

const { symbols: WGPU, close: wgpuClose } = dlopen(WGPU_PATH, {
  ...WGPU_FUNCTIONS,
});

process.on('beforeExit', () => {
  wgpuClose();
});

export * from './callbacks';
export * from './structs';
export * from './enums';
export { WGPU };
