import { type Pointer, CString, JSCallback, ptr } from 'bun:ffi';
import { afterAll, describe, expect, it, setDefaultTimeout } from 'bun:test';
import { cstr, GLFW, GLFW_WindowMacro } from '../src/dynamic-libs';
import { setupStruct } from '@bunbox/struct';

setDefaultTimeout(20000);

setupStruct({
  pointerToString(ptr) {
    return new CString(Number(ptr) as Pointer).toString();
  },
  stringToPointer(str) {
    return BigInt(ptr(cstr(str)));
  },
});

describe('GLFW window preparation for BGFX', () => {
  let isInitGlfw = false;
  let windowHandle: Pointer | null = null;

  it('should initialize GLFW and create window suitable for BGFX', () => {
    // Setup GLFW error callback
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

    // Initialize GLFW
    expect(GLFW.glfwInit(), 'GLFW initialization failed').toBe(1);
    if (GLFW.glfwInit() === 0) return;

    isInitGlfw = true;
    const version = GLFW.glfwGetVersionString();
    console.log(`[GLFW] Running with version: ${version}`);

    // Configure window hints for BGFX (no OpenGL context needed)
    GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, 0); // GLFW_NO_API - Important for BGFX!

    // Create window
    const window = GLFW.glfwCreateWindow(
      800,
      600,
      cstr('Bunbox GLFW + BGFX Integration Example'),
      null,
      null,
    );

    expect(window, 'GLFW window creation failed').not.toBeNull();
    if (!window) return;
    windowHandle = window;

    console.log('[GLFW] Window created successfully');
    console.log('[GLFW] Window is ready for BGFX initialization');
  });

  it('should get native window handle for BGFX', () => {
    if (!windowHandle) {
      throw new Error('Window not created');
    }

    // Get native window handle - this is what BGFX needs
    const nativeWindowHandle = GLFW.glfwGetWin32Window(windowHandle);
    expect(
      nativeWindowHandle,
      'Failed to get native window handle',
    ).not.toBeNull();

    console.log(`[Native] Window handle obtained: ${nativeWindowHandle}`);
    console.log(
      '[Info] This handle would be passed to BGFX via platformData.nwh',
    );
  });

  it('should demonstrate window event loop', async () => {
    if (!windowHandle) {
      throw new Error('Window not created');
    }

    // Simulate a simple render loop that would include BGFX rendering
    const framesToRun = 5;
    console.log(`[Loop] Running event loop for ${framesToRun} frames...`);

    for (let frame = 0; frame < framesToRun; frame++) {
      // Poll GLFW events - required for window to remain responsive
      GLFW.glfwPollEvents();

      // Check if window should close
      if (GLFW.glfwWindowShouldClose(windowHandle)) {
        console.log('[GLFW] Window close requested by user');
        break;
      }

      console.log(`[Loop] Frame ${frame + 1}/${framesToRun}`);
      console.log('  -> In a real app, BGFX rendering would happen here');

      // Small delay to simulate frame time
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('[Loop] Event loop completed successfully');
  });

  afterAll(() => {
    if (windowHandle) {
      console.log('[Cleanup] Destroying window...');
      GLFW.glfwDestroyWindow(windowHandle);
    }

    if (isInitGlfw) {
      console.log('[Cleanup] Terminating GLFW...');
      GLFW.glfwTerminate();
    }

    console.log('[Cleanup] Done!');
  });
});
