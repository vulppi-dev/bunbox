import { ptr, type Pointer } from 'bun:ffi';
import { GLFW } from '../src/dynamic-libs/loader';
import { describe, expect, it, afterAll } from 'bun:test';

describe('GLFW window test', () => {
  let initialized = false;
  let windowHandle: Pointer | null = null;

  it('open window 2 seconds', async () => {
    const titleBuffer = Buffer.from('Bunbox GLFW Window\0', 'utf8');
    const titlePointer = ptr(titleBuffer);

    expect(GLFW.glfwInit(), 'GLFW initialization failed').toBe(1);
    if (GLFW.glfwInit() === 0) return;

    initialized = true;
    const version = GLFW.glfwGetVersionString();
    console.log(`[GLFW] Running with version: ${version}`);
    const window = GLFW.glfwCreateWindow(800, 600, titlePointer, null, null);

    expect(window, 'GLFW window creation failed').not.toBeNull();
    if (!window) return;
    windowHandle = window;

    GLFW.glfwMakeContextCurrent(windowHandle);
    GLFW.glfwSwapInterval(1);
    console.log(
      '[GLFW] Window opened for 2 seconds. Close it manually or wait...',
    );
    const start = performance.now();

    while (GLFW.glfwWindowShouldClose(windowHandle) === 0) {
      GLFW.glfwPollEvents();
      GLFW.glfwSwapBuffers(windowHandle);

      if (performance.now() - start > 2000) {
        console.log('[GLFW] Auto-closing window after 2 seconds.');
        break;
      }

      await Bun.sleep(16);
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
