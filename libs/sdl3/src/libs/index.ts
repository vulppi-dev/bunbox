import "./SDL3/darwin/libiconv.dylib" with { type: 'file' };
import "./SDL3/linux/arm64/libiconv.so.2" with { type: 'file' };
import "./SDL3/linux/ppc64/libiconv.so.2" with { type: 'file' };
import "./SDL3/linux/x64/libiconv.so.2" with { type: 'file' };

import SDL3Darwin from "./SDL3/darwin/libSDL3.dylib" with { type: 'file' };
import SDL3LinuxArm64 from "./SDL3/linux/arm64/libSDL3.so" with { type: 'file' };
import SDL3LinuxPpc64 from "./SDL3/linux/ppc64/libSDL3.so" with { type: 'file' };
import SDL3LinuxX64 from "./SDL3/linux/x64/libSDL3.so" with { type: 'file' };
import SDL3Win32Arm64 from "./SDL3/win32/arm64/SDL3.dll" with { type: 'file' };
import SDL3Win32X64 from "./SDL3/win32/x64/SDL3.dll" with { type: 'file' };

import { dlopen } from 'bun:ffi';
import * as functions from '../libs/functions';

export * from '@bunbox/naga';
export { cstr } from '@bunbox/struct';
export { CString, JSCallback, ptr } from 'bun:ffi';


const SDL_LIBS: Record<string, any> = {
  darwin: SDL3Darwin,
  linux: {
    arm64: SDL3LinuxArm64,
    ppc64: SDL3LinuxPpc64,
    x64: SDL3LinuxX64,
  },
  win32: {
    arm64: SDL3Win32Arm64,
    x64: SDL3Win32X64,
  },
};

const SDL_PATH = process.platform === 'darwin' ? SDL_LIBS[process.platform]:
SDL_LIBS[process.platform]?.[process.arch];

if(!SDL_PATH) {
  throw new Error(`Unsupported platform or architecture: ${process.platform} ${process.arch}`);
}

const { symbols: SDL, close } = dlopen(SDL_PATH, {
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
  ...functions.INTRINSICS_BINDINGS,
  ...functions.IO_STREAM_BINDINGS,
  ...functions.JOYSTICK_BINDINGS,
  ...functions.KEYBOARD_BINDINGS,
  ...functions.KEYCODE_BINDINGS,
  ...functions.LOCALE_BINDINGS,
  ...functions.LOG_BINDINGS,
  ...functions.MAIN_BINDINGS,
  ...functions.MESSAGEBOX_BINDINGS,
  ...functions.METAL_BINDINGS,
  ...functions.MISC_BINDINGS,
  ...functions.MOUSE_BINDINGS,
  ...functions.MUTEX_BINDINGS,
  ...functions.PEN_BINDINGS,
  ...functions.PIXELS_BINDINGS,
  ...functions.PLATFORM_BINDINGS,
  ...functions.POWER_BINDINGS,
  ...functions.PROCESS_BINDINGS,
  ...functions.PROPERTIES_BINDINGS,
  ...functions.RECT_BINDINGS,
  ...functions.RENDER_BINDINGS,
  ...functions.SCANCODE_BINDINGS,
  ...functions.SENSOR_BINDINGS,
  ...functions.SHARED_OBJECT_BINDINGS,
  ...functions.STD_BINDINGS,
  ...functions.STORAGE_BINDINGS,
  ...functions.SURFACE_BINDINGS,
  ...functions.SYSTEM_BINDINGS,
  ...functions.THREAD_BINDINGS,
  ...functions.TIME_BINDINGS,
  ...functions.TIMER_BINDINGS,
  ...functions.TOUCH_BINDINGS,
  ...functions.TRAY_BINDINGS,
  ...functions.VERSION_BINDINGS,
  ...functions.VIDEO_BINDINGS,
  ...functions.VULKAN_BINDINGS,
})

process.on('exit', () => {
  close()
})

export { SDL };

