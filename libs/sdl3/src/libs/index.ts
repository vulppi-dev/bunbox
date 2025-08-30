import "./SDL3/linux/arm64/libiconv.so.2" with { type: 'file' };
import "./SDL3/linux/ppc64/libiconv.so.2" with { type: 'file' };
import "./SDL3/linux/x64/libiconv.so.2" with { type: 'file' };
import "./SDL3/darwin/libiconv.dylib" with { type: 'file' };

import SDL3Darwin from "./SDL3/darwin/libSDL3.dylib" with { type: 'file' };
import SDL3LinuxArm64 from "./SDL3/linux/arm64/libSDL3.so" with { type: 'file' };
import SDL3LinuxPpc64 from "./SDL3/linux/ppc64/libSDL3.so" with { type: 'file' };
import SDL3LinuxX64 from "./SDL3/linux/x64/libSDL3.so" with { type: 'file' };
import SDL3Win32Arm64 from "./SDL3/win32/arm64/SDL3.dll" with { type: 'file' };
import SDL3Win32X64 from "./SDL3/win32/x64/SDL3.dll" with { type: 'file' };

import { dlopen } from 'bun:ffi'
import * as functions from '../libs/functions'

export { ptr, JSCallback, CString } from 'bun:ffi'
export { cstr } from '@bunbox/struct'
export * from '@bunbox/naga'

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
  ...functions.ERROR_BINDINGS,
  ...functions.EVENTS_BINDINGS,
  ...functions.GPU_BINDINGS,
  ...functions.INIT_BINDINGS,
  ...functions.IO_STREAM_BINDINGS,
  ...functions.RENDER_BINDINGS,
  ...functions.STD_BINDINGS,
  ...functions.TIMER_BINDINGS,
  ...functions.VIDEO_BINDINGS,
})

process.on('exit', () => {
  close()
})

export { SDL }
