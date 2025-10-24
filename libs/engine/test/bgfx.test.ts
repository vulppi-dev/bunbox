import { type Pointer, JSCallback } from 'bun:ffi';
import { afterAll, describe, expect, it, setDefaultTimeout } from 'bun:test';
import {
  cstr,
  GLFW,
  GLFW_ENUMS,
  type GLFW_TYPES,
  BGFX,
} from '../src/dynamic-libs';

setDefaultTimeout(20000);

describe('GLFW window test', () => {
  let isInitGlfw = false;
  let isInitBgfx = false;
  let windowHandle: Pointer | null = null;

  it('open window GLFW + BGFX', async () => {
    const errorCallback = new JSCallback(
      (errorCode, description) => {
        console.error(`[GLFW][Error ${errorCode}]: ${description}`);
      },
      {
        args: ['u32', 'cstring'],
        returns: 'void',
      },
    );

    GLFW.glfwSetErrorCallback(errorCallback.ptr);

    expect(GLFW.glfwInit(), 'GLFW initialization failed').toBe(1);
    if (GLFW.glfwInit() === 0) return;

    GLFW.glfwWindowHint(GLFW_ENUMS.WindowMacro.CLIENT_API, 0); // GLFW_NO_API

    isInitGlfw = true;
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
  });

  afterAll(() => {
    if (windowHandle) {
      GLFW.glfwDestroyWindow(windowHandle);
    }

    if (isInitGlfw) {
      GLFW.glfwTerminate();
    }
  });
});
