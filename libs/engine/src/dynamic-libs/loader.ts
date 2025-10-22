import { findProjectRoot } from '../utils/path';
import { dlopen } from 'bun:ffi';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { embeddedFiles } from 'bun';

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
  console.debug(import.meta.url);
  console.debug(url.toString());
  console.debug(embeddedFiles);
  return url;
}

const GLFW_PATH = await getDynamicLibPath(
  GLFW_LIBS[process.platform]?.[process.arch],
);
const BGFX_PATH = await getDynamicLibPath(
  BGFX_LIBS[process.platform]?.[process.arch],
);
const FREE_TYPE_PATH = await getDynamicLibPath(
  FREE_TYPE_LIBS[process.platform]?.[process.arch],
);

if (!GLFW_PATH || !BGFX_PATH || !FREE_TYPE_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

console.log(`[Loader] GLFW: ${GLFW_PATH}`);
console.log(`[Loader] BGFX: ${BGFX_PATH}`);
console.log(`[Loader] FreeType: ${FREE_TYPE_PATH}`);

const { symbols: GLFW, close: glfwClose } = dlopen(GLFW_PATH, {
  glfwInit: { args: [], returns: 'int' },
  glfwTerminate: { args: [], returns: 'void' },
  glfwGetVersionString: { args: [], returns: 'cstring' },
  glfwCreateWindow: {
    args: ['int', 'int', 'pointer', 'pointer', 'pointer'],
    returns: 'pointer',
  },
  glfwMakeContextCurrent: { args: ['pointer'], returns: 'void' },
  glfwWindowShouldClose: { args: ['pointer'], returns: 'int' },
  glfwPollEvents: { args: [], returns: 'void' },
  glfwSwapBuffers: { args: ['pointer'], returns: 'void' },
  glfwDestroyWindow: { args: ['pointer'], returns: 'void' },
  glfwSwapInterval: { args: ['int'], returns: 'void' },
  glfwGetWin32Window: { args: ['pointer'], returns: 'pointer' },
  glfwWindowHint: { args: ['int', 'int'], returns: 'void' },
});

const { symbols: BGFX, close: bgfxClose } = dlopen(BGFX_PATH, {
  bgfx_init: { args: ['pointer'], returns: 'bool' },
  bgfx_shutdown: { args: [], returns: 'void' },
  bgfx_reset: { args: ['u32', 'u32', 'u32', 'u32'], returns: 'void' },
  bgfx_frame: { args: ['bool'], returns: 'u32' },
  bgfx_set_view_clear: {
    args: ['u16', 'u16', 'u32', 'f32', 'u8'],
    returns: 'void',
  },
  bgfx_set_view_rect: {
    args: ['u16', 'u16', 'u16', 'u16', 'u16'],
    returns: 'void',
  },
  bgfx_touch: { args: ['u16'], returns: 'void' },
  bgfx_dbg_text_clear: { args: ['u8', 'bool'], returns: 'void' },
  bgfx_dbg_text_printf: {
    args: ['u16', 'u16', 'u8', 'cstring'],
    returns: 'void',
  },
  bgfx_set_debug: { args: ['u32'], returns: 'void' },
  bgfx_get_renderer_type: { args: [], returns: 'int' },
  bgfx_render_frame: { args: ['i32'], returns: 'u32' },
  bgfx_set_platform_data: { args: ['pointer'], returns: 'void' },
  bgfx_get_caps: { args: [], returns: 'pointer' },
  bgfx_set_view_mode: { args: ['u16', 'int'], returns: 'void' },
  bgfx_set_view_name: { args: ['u16', 'cstring'], returns: 'void' },
  bgfx_vertex_layout_begin: {
    args: ['pointer', 'int'],
    returns: 'pointer',
  },
});

const { symbols: FREE_TYPE, close: freeTypeClose } = dlopen(FREE_TYPE_PATH, {
  FT_Init_FreeType: { args: ['pointer'], returns: 'int' },
  FT_Done_FreeType: { args: ['pointer'], returns: 'int' },
  FT_New_Face: {
    args: ['pointer', 'cstring', 'i32', 'pointer'],
    returns: 'int',
  },
  FT_Done_Face: { args: ['pointer'], returns: 'int' },
  FT_Set_Pixel_Sizes: { args: ['pointer', 'u32', 'u32'], returns: 'int' },
  FT_Load_Char: { args: ['pointer', 'u64', 'i32'], returns: 'int' },
  FT_Render_Glyph: { args: ['pointer', 'int'], returns: 'int' },
  FT_Get_Char_Index: { args: ['pointer', 'u64'], returns: 'u32' },
});

process.on('exit', () => {
  glfwClose();
  bgfxClose();
  freeTypeClose();
});

export { GLFW, BGFX, FREE_TYPE };
