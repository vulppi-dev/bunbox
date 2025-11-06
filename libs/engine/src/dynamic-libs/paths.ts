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

const DILIGENT_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/darwin/libGraphicsEngine.dylib',
    x64: 'assets/x64/darwin/libGraphicsEngine.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libGraphicsEngine.so',
    x64: 'assets/x64/linux/libGraphicsEngine.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/GraphicsEngine.dll',
    x64: 'assets/x64/win32/GraphicsEngine.dll',
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

const LLGL_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/arm64/darwin/libLLGL.dylib',
    x64: 'assets/x64/darwin/libLLGL.dylib',
  },
  linux: {
    arm64: 'assets/arm64/linux/libLLGL.so',
    x64: 'assets/x64/linux/libLLGL.so',
  },
  win32: {
    arm64: 'assets/arm64/win32/LLGL.dll',
    x64: 'assets/x64/win32/LLGL.dll',
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

export const DILIGENT_PATH = await getDynamicLibPath(
  DILIGENT_LIBS[process.platform]?.[process.arch],
);

export const FREE_TYPE_PATH = await getDynamicLibPath(
  FREE_TYPE_LIBS[process.platform]?.[process.arch],
);

export const LLGL_PATH = await getDynamicLibPath(
  LLGL_LIBS[process.platform]?.[process.arch],
);
