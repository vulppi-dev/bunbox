import { dlopen } from 'bun:ffi';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

import { embeddedFiles } from 'bun';
import { readdir } from 'fs/promises';
import * as functions from '../libs/functions';
import { findProjectRoot } from '../utils/path';

export * from '@bunbox/naga';
export { cstr } from '@bunbox/struct';
export { CString, JSCallback, ptr } from 'bun:ffi';

const MODULE_DIR = findProjectRoot(import.meta.url);

const SDL_LIBS: Record<string, any> = {
  darwin: {
    arm64: 'assets/darwin/libSDL3.dylib',
    x64: 'assets/darwin/libSDL3.dylib',
  },
  linux: {
    arm64: 'assets/linux/arm64/libSDL3.so',
    x64: 'assets/linux/x64/libSDL3.so',
  },
  win32: {
    arm64: 'assets/win32/arm64/SDL3.dll',
    x64: 'assets/win32/x64/SDL3.dll',
  },
};

const SDL_PATH = await (async (path?: string) => {
  if (!path) return null;
  const relative = join('../..', path);
  if (existsSync(relative)) return relative;
  const absolute = resolve(MODULE_DIR, path);
  if (existsSync(absolute)) return absolute;
  const url = new URL(join('../..', 'sdl3', path), import.meta.url);
  console.debug(import.meta.url);
  console.debug(url.toString());
  console.debug(embeddedFiles);
  return url;
})(SDL_LIBS[process.platform]?.[process.arch]);

if (!SDL_PATH) {
  throw new Error(
    `Unsupported platform or architecture: ${process.platform} ${process.arch}`,
  );
}

export const { symbols: SDL, close: SDL_Close } = dlopen(SDL_PATH, {
  ...functions.ASSERT_BINDINGS,
  ...functions.ASYNC_IO_BINDINGS,
  ...functions.ATOMIC_BINDINGS,
  ...functions.AUDIO_BINDINGS,
  ...functions.BITS_BINDINGS,
  ...functions.BLENDMODE_BINDINGS,
  ...functions.CAMERA_BINDINGS,
  ...functions.CLIPBOARD_BINDINGS,
  ...functions.CPU_INFO_BINDINGS,
  ...functions.DIALOG_BINDINGS,
  ...functions.ENDIAN_BINDINGS,
  ...functions.ERROR_BINDINGS,
  ...functions.EVENTS_BINDINGS,
  ...functions.FILESYSTEM_BINDINGS,
  ...functions.GAMEPAD_BINDINGS,
  ...functions.GPU_BINDINGS,
  ...functions.GUID_BINDINGS,
  ...functions.HAPTIC_BINDINGS,
  ...functions.HIDAPI_BINDINGS,
  ...functions.HINT_BINDINGS,
  ...functions.INIT_BINDINGS,
  ...functions.IO_STREAM_BINDINGS,
  ...functions.JOYSTICK_BINDINGS,
  ...functions.KEYBOARD_BINDINGS,
  ...functions.LOCALE_BINDINGS,
  ...functions.LOG_BINDINGS,
  ...functions.MAIN_BINDINGS,
  ...functions.MESSAGEBOX_BINDINGS,
  ...functions.METAL_BINDINGS,
  ...functions.MISC_BINDINGS,
  ...functions.MOUSE_BINDINGS,
  ...functions.MUTEX_BINDINGS,
  ...functions.PIXELS_BINDINGS,
  ...functions.PLATFORM_BINDINGS,
  ...functions.POWER_BINDINGS,
  ...functions.PROCESS_BINDINGS,
  ...functions.PROPERTIES_BINDINGS,
  ...functions.RECT_BINDINGS,
  ...functions.RENDER_BINDINGS,
  ...functions.SENSOR_BINDINGS,
  ...functions.SHARED_OBJECT_BINDINGS,
  ...functions.STD_BINDINGS,
  ...functions.STORAGE_BINDINGS,
  ...functions.SURFACE_BINDINGS,
  ...functions.TIME_BINDINGS,
  ...functions.TIMER_BINDINGS,
  ...functions.TOUCH_BINDINGS,
  ...functions.TRAY_BINDINGS,
  ...functions.VERSION_BINDINGS,
  ...functions.VIDEO_BINDINGS,
  ...functions.VULKAN_BINDINGS,
});

process.on('exit', () => {
  SDL_Close();
});
