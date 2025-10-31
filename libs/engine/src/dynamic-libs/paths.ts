import { embeddedFiles } from 'bun';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { findProjectRoot } from '../utils/path';
import { fileURLToPath } from 'url';

const MODULE_DIR = findProjectRoot(import.meta.url);

const GLFW_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/darwin/libglfw.dylib',
    x64: 'assets/x64/darwin/libglfw.dylib',
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
    arm64: 'assets/arm64/darwin/libbgfx.dylib',
    x64: 'assets/x64/darwin/libbgfx.dylib',
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

const WGPU_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/darwin/libwgpu_native.dylib',
    x64: 'assets/x64/darwin/libwgpu_native.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libwgpu_native.so',
    x64: 'assets/x64/linux/libwgpu_native.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/wgpu_native.dll',
    x64: 'assets/x64/win32/wgpu_native.dll',
  },
};

async function getDynamicLibPath(path?: string) {
  if (!path) return null;
  const relative = join('../..', path);
  if (existsSync(relative)) return relative;
  const absolute = resolve(MODULE_DIR, path);
  if (existsSync(absolute)) return absolute;
  return path;
}

export const GLFW_PATH = await getDynamicLibPath(
  GLFW_LIBS[process.platform]?.[process.arch],
);
export const BGFX_PATH = await getDynamicLibPath(
  BGFX_LIBS[process.platform]?.[process.arch],
);
export const WGPU_PATH = await getDynamicLibPath(
  WGPU_LIBS[process.platform]?.[process.arch],
);
