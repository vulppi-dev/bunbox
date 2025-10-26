import { instantiate, setupStruct } from '@bunbox/struct';
import { type Pointer, CString, JSCallback, ptr } from 'bun:ffi';
import {
  BGFX,
  BGFX_Clear,
  BGFX_DebugFlags,
  BGFX_Reset,
  BGFX_TextureFormat,
  bgfxInitStruct,
  bgfxStatsStruct,
  cstr,
  GLFW,
  GLFW_WindowMacro,
  glfwErrorCallback,
} from '../src/dynamic-libs';

setupStruct({
  pointerToString(ptr) {
    return new CString(Number(ptr) as Pointer).toString();
  },
  stringToPointer(str) {
    return BigInt(ptr(cstr(str)));
  },
});

const errorCallback = new JSCallback(
  (errorCode: number, description: string) => {
    console.error(`[GLFW][Error ${errorCode}]: ${description}`);
  },
  glfwErrorCallback,
);

GLFW.glfwSetErrorCallback(errorCallback.ptr);

await (async () => {
  if (GLFW.glfwInit() === 0) {
    throw new Error('[GLFW] initialization failed');
  }

  const version = GLFW.glfwGetVersionString();
  console.log(`[GLFW] Running with version: ${version}`);

  // Configure window hints for BGFX (no OpenGL context needed)
  GLFW.glfwWindowHint(GLFW_WindowMacro.CLIENT_API, 0);

  // Create window
  const window = GLFW.glfwCreateWindow(
    800,
    600,
    cstr('Bunbox GLFW + BGFX Integration Example'),
    null,
    null,
  );

  if (!window) {
    throw new Error('[GLFW] window creation failed');
  }
  console.log('[GLFW] Window created successfully');

  console.log('[BGFX] Preparing to initialize BGFX');
  BGFX.bgfx_render_frame(-1);

  // Get native window handle - this is what BGFX needs
  const nativeWindowHandle = GLFW.glfwGetWin32Window(window);
  if (!nativeWindowHandle) {
    throw new Error('[GLFW] Failed to get native window handle');
  }
  console.log(`[Native] Window handle obtained: ${nativeWindowHandle}`);

  const [bgfxInit, bgfxInitBfr] = instantiate(bgfxInitStruct);
  bgfxInit.platformData.nwh = BigInt(nativeWindowHandle);
  const heightBfr = new Uint16Array(1);
  const widthBfr = new Uint16Array(1);

  GLFW.glfwGetWindowSize(window, ptr(widthBfr), ptr(heightBfr));
  console.log(`[GLFW] Window size: ${widthBfr[0]}x${heightBfr[0]}`);

  bgfxInit.resolution.width = widthBfr[0]!;
  bgfxInit.resolution.height = heightBfr[0]!;
  bgfxInit.resolution.reset = BGFX_Reset.RESET_VSYNC;

  if (!BGFX.bgfx_init(ptr(bgfxInitBfr))) {
    throw new Error('[BGFX] Initialization failed');
  }
  console.log('[BGFX] Initialized successfully');

  // Enable debug text rendering
  BGFX.bgfx_set_debug(BGFX_DebugFlags.DEBUG_TEXT);
  console.log('[BGFX] Debug text enabled');

  const viewId = 0;
  // Set clear color to magenta (0xFF00FFFF in RGBA format)
  BGFX.bgfx_set_view_clear(
    viewId,
    BGFX_Clear.COLOR | BGFX_Clear.DEPTH,
    0xff00ffff,
    1.0,
    0,
  );
  console.log('[BGFX] View clear color set to magenta (0xFF00FFFF)');

  BGFX.bgfx_set_view_rect(
    viewId,
    0,
    0,
    bgfxInit.resolution.width,
    bgfxInit.resolution.height,
  );
  console.log(
    `[BGFX] View rect configured: ${bgfxInit.resolution.width}x${bgfxInit.resolution.height}`,
  );

  while (true) {
    GLFW.glfwPollEvents();
    if (GLFW.glfwWindowShouldClose(window)) {
      break;
    }

    const oldHeight = heightBfr[0]!;
    const oldWidth = widthBfr[0]!;
    GLFW.glfwGetWindowSize(window, ptr(widthBfr), ptr(heightBfr));
    const width = widthBfr[0]!;
    const height = heightBfr[0]!;

    if (oldHeight !== height || oldWidth !== width) {
      BGFX.bgfx_reset(
        width,
        height,
        BGFX_Reset.RESET_VSYNC,
        BGFX_TextureFormat.Count,
      );
      BGFX.bgfx_set_view_rect(viewId, 0, 0, width, height);
    }
    BGFX.bgfx_touch(viewId);

    BGFX.bgfx_dbg_text_clear(0, false);

    BGFX.bgfx_frame(false);
    // Small delay to simulate frame time
    await Bun.sleep(16);
  }

  BGFX.bgfx_shutdown();
  GLFW.glfwDestroyWindow(window);
  GLFW.glfwTerminate();
  console.log('[BGFX] Shutdown complete, GLFW terminated');
})().catch((err: any) => {
  console.error('[Error]', err);
});
