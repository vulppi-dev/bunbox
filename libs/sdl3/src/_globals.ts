import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT_PATH = join(fileURLToPath(new URL('.', import.meta.url)), '..');

Object.defineProperty(globalThis, 'ROOT_PATH', {
  configurable: false,
  enumerable: true,
  writable: false,
  value: ROOT_PATH,
});

declare global {
  const ROOT_PATH: string;
}
