import { embeddedFiles } from 'bun';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { findProjectRoot } from '../utils/path';

const MODULE_DIR = findProjectRoot(import.meta.url);

const GLFW_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/macos/libglfw.dylib',
    x64: 'assets/x64/macos/libglfw.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libglfw.so',
    x64: 'assets/x64/linux/libglfw.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/glfw3.dll',
    x64: 'assets/x64/win32/glfw3.dll',
  },
};

const BGFX_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/macos/libbgfx.dylib',
    x64: 'assets/x64/macos/libbgfx.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libbgfx.so',
    x64: 'assets/x64/linux/libbgfx.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/bgfx.dll',
    x64: 'assets/x64/win32/bgfx.dll',
  },
};

const FREE_TYPE_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/macos/libfreetype.dylib',
    x64: 'assets/x64/macos/libfreetype.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libfreetype.so',
    x64: 'assets/x64/linux/libfreetype.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/freetype.dll',
    x64: 'assets/x64/win32/freetype.dll',
  },
};

async function getDynamicLibPath(path?: string) {
  if (!path) return null;
  const relative = join('../..', path);
  if (existsSync(relative)) return relative;
  const absolute = resolve(MODULE_DIR, path);
  if (existsSync(absolute)) return absolute;
  const url = new URL(join('../..', 'engine', path), import.meta.url);

  console.log('---LOADER DEBUG START---');
  console.log(import.meta.url);
  console.log(url.toString());
  console.log(embeddedFiles);
  console.log('---LOADER DEBUG END---');
  return url;
}

export const GLFW_PATH = await getDynamicLibPath(
  GLFW_LIBS[process.platform]?.[process.arch],
);
export const BGFX_PATH = await getDynamicLibPath(
  BGFX_LIBS[process.platform]?.[process.arch],
);
export const FREE_TYPE_PATH = await getDynamicLibPath(
  FREE_TYPE_LIBS[process.platform]?.[process.arch],
);

if (!GLFW_PATH || !BGFX_PATH || !FREE_TYPE_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}
