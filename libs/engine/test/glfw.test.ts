import { ptr, type Pointer } from 'bun:ffi';
import { GLFW } from '../src/dynamic-libs';
import { describe, expect, it, afterAll } from 'bun:test';
import { cstr } from '../src/dynamic-libs';

describe('GLFW window test', () => {
  let initialized = false;
  let windowHandle: Pointer | null = null;

  it('open window 4 seconds', async () => {
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

    console.log(
      '[GLFW] Window opened for 4 seconds. Close it manually or wait...',
    );
    const start = performance.now();

    while (GLFW.glfwWindowShouldClose(window) === 0) {
      GLFW.glfwPollEvents();

      if (performance.now() - start > 10000) {
        console.log('[GLFW] Auto-closing window after 4 seconds.');
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
