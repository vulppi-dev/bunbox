import { instantiate, setupStruct } from '@bunbox/struct';
import { type Pointer, CString, JSCallback, ptr } from 'bun:ffi';
import {
  BGFX,
  BGFX_Clear,
  BGFX_DebugFlags,
  BGFX_Reset,
  BGFX_TextureFormat,
  bgfxInitStruct,
  bgfxPlatformDataStruct,
  bgfxStatsStruct,
  cstr,
  GLFW,
  GLFW_WindowMacro,
  glfwErrorCallback,
} from '../src/dynamic-libs';

const wAux = new Int32Array(1);
const hAux = new Int32Array(1);

function beforeStart() {
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
}

function getWindowSize(window: Pointer) {
  GLFW.glfwGetWindowSize(window, ptr(wAux), ptr(hAux));
  return { width: wAux[0]!, height: hAux[0]! };
}

function getFramebufferSize(window: Pointer) {
  GLFW.glfwGetFramebufferSize(window, ptr(wAux), ptr(hAux));
  return { width: wAux[0]!, height: hAux[0]! };
}

function frame(width: number, height: number, resized: boolean) {
  if (width === 0 || height === 0) {
    BGFX.bgfx_frame(false);
    return;
  }

  if (resized) {
    BGFX.bgfx_reset(
      width,
      height,
      BGFX_Reset.RESET_VSYNC,
      BGFX_TextureFormat.Count,
    );
    BGFX.bgfx_set_view_rect(0, 0, 0, width, height);
  }
  BGFX.bgfx_touch(0);

  BGFX.bgfx_frame(false);
}

function getNativeWindowHandler(window: Pointer) {
  switch (process.platform) {
    case 'win32':
      return GLFW.glfwGetWin32Window(window);
    case 'linux':
      return GLFW.glfwGetX11Window(window);
    case 'darwin':
      return GLFW.glfwGetCocoaWindow(window);
    default:
      throw new Error(`Unsupported platform: ${process.platform}`);
  }
}

function bindGlfwToBgfx(window: Pointer) {
  const nativeWindowHandle = getNativeWindowHandler(window);
  if (!nativeWindowHandle) {
    throw new Error('[GLFW] Failed to get native window handle');
  }

  const [bgfxPlatformData, bgfxPlatformDataBfr] = instantiate(
    bgfxPlatformDataStruct,
  );
  const [bgfxInit, bgfxInitBfr] = instantiate(bgfxInitStruct);
  const initPtr = ptr(bgfxInitBfr);
  BGFX.bgfx_init_ctor(initPtr);

  const { width, height } = getWindowSize(window);

  bgfxInit.resolution.width = width;
  bgfxInit.resolution.height = height;
  bgfxInit.resolution.reset = BGFX_Reset.RESET_VSYNC;

  bgfxPlatformData.nwh = BigInt(nativeWindowHandle);
  if (process.platform === 'linux') {
    bgfxPlatformData.ndt = BigInt(GLFW.glfwGetX11Display()!);
  }

  bgfxInit.platformData = bgfxPlatformData;

  BGFX.bgfx_set_platform_data(ptr(bgfxPlatformDataBfr));
  return BGFX.bgfx_init(initPtr);
}

async function start(color: number) {
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

  if (!bindGlfwToBgfx(window)) {
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
    color,
    1.0,
    0,
  );
  let { height, width } = getWindowSize(window);

  BGFX.bgfx_set_view_rect(viewId, 0, 0, width, height);
  console.log(`[BGFX] View rect configured: ${width}x${height}`);

  while (true) {
    GLFW.glfwPollEvents();
    if (GLFW.glfwWindowShouldClose(window)) {
      break;
    }

    const newSizeW = getWindowSize(window);
    const newSize = getFramebufferSize(window);
    const resized = newSize.height !== height || newSize.width !== width;
    frame(newSize.width, newSize.height, resized);

    // Small delay to simulate frame time
    await Bun.sleep(16);
  }

  BGFX.bgfx_shutdown();
  GLFW.glfwDestroyWindow(window);
  GLFW.glfwTerminate();
  console.log('[BGFX] Shutdown complete, GLFW terminated');
}

beforeStart();
start(0xff00ffff).catch((err: any) => {
  console.error('[Error]', err);
});
