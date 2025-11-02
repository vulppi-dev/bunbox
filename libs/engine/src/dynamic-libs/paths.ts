import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { findProjectRoot } from '../utils/path';

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

const VK_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'libvulkan.1.dylib',
    x64: 'libvulkan.1.dylib',
  },
  linux: {
    arm64: 'libvulkan.so.1',
    x64: 'libvulkan.so.1',
  },
  win32: {
    arm64: 'vulkan-1.dll',
    x64: 'vulkan-1.dll',
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

const FREE_TYPE_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/darwin/libfreetype.dylib',
    x64: 'assets/x64/darwin/libfreetype.dylib',
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
  return path;
}

export const GLFW_PATH = await getDynamicLibPath(
  GLFW_LIBS[process.platform]?.[process.arch],
);

// Don't need getDynamicLibPath for Vulkan, as it should be installed system-wide
export const VK_PATH = VK_LIBS[process.platform]?.[process.arch];

export const BGFX_PATH = await getDynamicLibPath(
  BGFX_LIBS[process.platform]?.[process.arch],
);

export const FREE_TYPE_PATH = await getDynamicLibPath(
  FREE_TYPE_LIBS[process.platform]?.[process.arch],
);
