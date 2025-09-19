import './SDL3/darwin/libiconv.dylib' with { type: 'file' };
import './SDL3/linux/arm64/libiconv.so.2' with { type: 'file' };
import './SDL3/linux/x64/libiconv.so.2' with { type: 'file' };

import SDL3Darwin from './SDL3/darwin/libSDL3.dylib' with { type: 'file' };
import SDL3LinuxArm64 from './SDL3/linux/arm64/libSDL3.so' with { type: 'file' };
import SDL3LinuxX64 from './SDL3/linux/x64/libSDL3.so' with { type: 'file' };
import SDL3Win32Arm64 from './SDL3/win32/arm64/SDL3.dll' with { type: 'file' };
import SDL3Win32X64 from './SDL3/win32/x64/SDL3.dll' with { type: 'file' };

import { dlopen } from 'bun:ffi';
import * as functions from '../libs/functions';

import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

export * from '@bunbox/naga';
export { cstr } from '@bunbox/struct';
export { CString, JSCallback, ptr } from 'bun:ffi';

const SDL_LIBS: Record<string, any> = {
  darwin: {
    arm64: SDL3Darwin,
    x64: SDL3Darwin,
  },
  linux: {
    arm64: SDL3LinuxArm64,
    x64: SDL3LinuxX64,
  },
  win32: {
    arm64: SDL3Win32Arm64,
    x64: SDL3Win32X64,
  },
};

const SDL_PATH = ((path?: string) => {
  if (!path) return null;
  if (existsSync(path)) return path;
  const relative = resolve(dirname(fileURLToPath(import.meta.url)), path);
  if (existsSync(relative)) return relative;
  return null;
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
