import { dlopen } from 'bun:ffi';
import { BGFX_PATH } from '../paths';
import * as BGFX_FUNCS from './functions';

if (!BGFX_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

const { symbols: BGFX, close: bgfxClose } = dlopen(BGFX_PATH, BGFX_FUNCS);

process.on('beforeExit', () => {
  bgfxClose();
});

export * from './callbacks';
export * from './structs';
export * from './enums';
export { BGFX };
