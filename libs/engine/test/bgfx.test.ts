import { ptr, type Pointer } from 'bun:ffi';
import { GLFW, BGFX, cstr } from '../src/dynamic-libs';
import { describe, expect, it, afterAll } from 'bun:test';
import {
  bool,
  struct,
  u16,
  u32,
  u64,
  ptrAny,
  u8,
  toBuffer,
} from '@bunbox/struct';

const writeHandler = {
  stringToPointer(value: string) {
    return BigInt(ptr(cstr(value)));
  },
};

const bgfxPlatformDataStruct = struct({
  ndt: ptrAny(),
  nwh: ptrAny(),
  context: ptrAny(),
  backBuffer: ptrAny(),
  backBufferDS: ptrAny(),
  type: u32(),
});

const bgfxResolutionStruct = struct({
  format: u32(),
  width: u32(),
  height: u32(),
  reset: u32(),
  numBackBuffers: u8(),
  maxFrameLatency: u8(),
  debugTextScale: u8(),
});

const bgfxInitStruct = struct({
  type: u32(),
  vendorId: u16(),
  deviceId: u16(),
  capabilities: u64(),
  debug: bool(),
  profile: bool(),
  platformData: bgfxPlatformDataStruct,
  resolution: bgfxResolutionStruct,
  callback: ptrAny(),
  allocator: ptrAny(),
  limits: struct({
    maxEncoders: u16(),
    minResourceCbSize: u32(),
    transientVbSize: u32(),
    transientIbSize: u32(),
  }),
});

describe('GLFW window test', () => {
  let initialized = false;
  let windowHandle: Pointer | null = null;

  it('open window 2 seconds', async () => {
    expect(GLFW.glfwInit(), 'GLFW initialization failed').toBe(1);
    if (GLFW.glfwInit() === 0) return;

    initialized = true;
    const version = GLFW.glfwGetVersionString();
    console.log(`[GLFW] Running with version: ${version}`);
    const window = GLFW.glfwCreateWindow(
      800,
      600,
      cstr('Bunbox GLFW Window'),
      null,
      null,
    );

    expect(window, 'GLFW window creation failed').not.toBeNull();
    if (!window) return;
    windowHandle = window;

    GLFW.glfwMakeContextCurrent(windowHandle);
    GLFW.glfwSwapInterval(1);
    console.log(
      '[GLFW] Window opened for 2 seconds. Close it manually or wait...',
    );

    BGFX.bgfx_render_frame();

    // Initialize BGFX set platform data windows

    const platformDataPtr = GLFW.glfwGetWin32Window(windowHandle);

    const bgfxInit = toBuffer(
      bgfxInitStruct,
      {
        platformData: {
          nwh: BigInt(platformDataPtr || 0n),
        } as any,
        resolution: {
          width: 800,
          height: 600,
          reset: 0x00000001,
        } as any,
      },
      writeHandler,
    );

    const bgfxInitResult = BGFX.bgfx_init(ptr(bgfxInit));
    expect(bgfxInitResult, 'BGFX initialization failed').toBe(true);
    if (!bgfxInitResult) return;

    while (GLFW.glfwWindowShouldClose(windowHandle) === 0) {
      GLFW.glfwPollEvents();
      GLFW.glfwSwapBuffers(windowHandle);
    }
  });

  afterAll(() => {
    if (windowHandle) {
      GLFW.glfwDestroyWindow(windowHandle);
    }

    if (initialized) {
      GLFW.glfwTerminate();
    }
  });
});
