/// <reference types="@types/bun" />

import { dlopen, ptr } from 'bun:ffi';

const libraryPaths = {
  win32: './libs/windows-x64/windows/x64/glfw3.dll',
  linux: './libs/linux-x64/linux/x64/libglfw.so',
  darwin: './libs/macos-arm64/macos/arm64/libglfw.dylib',
} as const;

const libraryPath = libraryPaths[process.platform as keyof typeof libraryPaths];

if (!libraryPath) {
  throw new Error(`Unsupported platform: ${process.platform}`);
}

const lib = dlopen(libraryPath, {
  glfwInit: { args: [], returns: 'int' },
  glfwTerminate: { args: [], returns: 'void' },
  glfwGetVersionString: { args: [], returns: 'cstring' },
  glfwCreateWindow: {
    args: ['int', 'int', 'pointer', 'pointer', 'pointer'],
    returns: 'pointer',
  },
  glfwMakeContextCurrent: { args: ['pointer'], returns: 'void' },
  glfwWindowShouldClose: { args: ['pointer'], returns: 'int' },
  glfwPollEvents: { args: [], returns: 'void' },
  glfwSwapBuffers: { args: ['pointer'], returns: 'void' },
  glfwDestroyWindow: { args: ['pointer'], returns: 'void' },
  glfwSwapInterval: { args: ['int'], returns: 'void' },
});

type WindowHandle = NonNullable<
  ReturnType<typeof lib.symbols.glfwCreateWindow>
>;

async function runExample(): Promise<void> {
  let initialized = false;
  let windowHandle: WindowHandle | null = null;

  const titleBuffer = Buffer.from('Bunbox GLFW Window\0', 'utf8');
  const titlePointer = ptr(titleBuffer);

  try {
    if (lib.symbols.glfwInit() === 0) {
      throw new Error('GLFW initialization failed');
    }

    initialized = true;

    const version = lib.symbols.glfwGetVersionString();
    console.log(`[GLFW] Running with version: ${version}`);

    const window = lib.symbols.glfwCreateWindow(
      800,
      600,
      titlePointer,
      null,
      null,
    );
    if (!window) {
      throw new Error('Failed to create GLFW window');
    }

    windowHandle = window;

    lib.symbols.glfwMakeContextCurrent(windowHandle);
    lib.symbols.glfwSwapInterval(1);

    console.log(
      '[GLFW] Window opened for 5 seconds. Close it manually or wait...',
    );

    const start = Date.now();
    while (lib.symbols.glfwWindowShouldClose(windowHandle) === 0) {
      lib.symbols.glfwPollEvents();
      lib.symbols.glfwSwapBuffers(windowHandle);

      if (Date.now() - start > 5000) {
        console.log('[GLFW] Auto-closing window after 5 seconds.');
        break;
      }

      await Bun.sleep(16);
    }
  } finally {
    if (windowHandle) {
      lib.symbols.glfwDestroyWindow(windowHandle);
    }

    if (initialized) {
      lib.symbols.glfwTerminate();
    }

    lib.close();
  }
}

if (import.meta.main) {
  runExample().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
