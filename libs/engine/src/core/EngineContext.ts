import { getGlfwErrorDescription, GLFW, glfwErrorCallback } from '@bunbox/glfw';
import { getInstanceBuffer, instantiate, setupStruct } from '@bunbox/struct';
import {
  getResultMessage,
  makeVersion,
  VK,
  VK_WHOLE_SIZE,
  vkApplicationInfo,
  vkInstanceCreateInfo,
  vkPresentInfoKHR,
  VkResult,
  vkSubmitInfo,
} from '@bunbox/vk';
import { cc, CString, JSCallback, ptr, type Pointer } from 'bun:ffi';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { EngineError, RenderError } from '../errors';
import { GLFW_DEBUG, VK_DEBUG } from '../singleton/logger';
import { buildCallback, cstr } from '../utils/buffer';
import { getEnv } from '../utils/env';
import {
  VkCommandBuffer,
  VkCommandPool,
  VkDevice,
  VkSwapchain,
  VkSync,
} from '../vulkan';
import { AssetsStorage } from './AssetsStorage';
import { FRAME_LOOP, type World } from './World';
import {
  CONTEXT_attachWindowWorld,
  CONTEXT_dispose,
  CONTEXT_disposeWindowResources,
  CONTEXT_prepare,
  CONTEXT_rebuildWindowResources,
} from './_symbols';

// Setup struct pointer/string conversions globally
setupStruct({
  pointerToString(ptr) {
    return new CString(Number(ptr) as Pointer).toString();
  },
  stringToPointer(str) {
    return BigInt(ptr(cstr(str)));
  },
});

const tempCC = join(
  mkdtempSync(join(tmpdir(), 'bunbox-vk-instance-extensions-')),
  'instanceExtensions.c',
);
writeFileSync(
  tempCC,
  /* C */ `
int instanceExtensions(const char * const **extensions) {
  static const char * const list[] = {
    "VK_KHR_surface",
    "VK_KHR_win32_surface",
    "VK_EXT_swapchain_colorspace",
    "VK_EXT_debug_utils"
  };

  *extensions = list;
  return (int)(sizeof list / sizeof list[0]);
}

int instanceExtensionsDarwin(const char * const **extensions) {
   static const char * const list[] = {
    "VK_KHR_surface",
    "VK_KHR_win32_surface",
    "VK_EXT_swapchain_colorspace",
    "VK_EXT_debug_utils",
    "VK_KHR_portability_enumeration",
    "VK_KHR_portability_subset"
  };

  *extensions = list;
  return (int)(sizeof list / sizeof list[0]);
}
`,
);

const { symbols: CC, close: closeCC } = cc({
  source: tempCC,
  symbols: {
    instanceExtensions: {
      args: ['ptr'],
      returns: 'i32',
    },
    instanceExtensionsDarwin: {
      args: ['ptr'],
      returns: 'i32',
    },
  },
});

process.on('beforeExit', () => {
  closeCC();
});

type WindowPack = {
  device: VkDevice;
  swapchain?: VkSwapchain;
  commandPool?: VkCommandPool;
  commandBuffers?: VkCommandBuffer[];
  sync?: VkSync;
};

export class EngineContext {
  // GLFW handlers
  private static __glfwInitialized = false;
  private static __errorCallback: JSCallback | null = null;

  // Vulkan handlers
  private static __vulkanInitialized = false;
  private static __vulkanInstance: Pointer | null = null;

  // Contexts handlers
  private static __loopInitialized = false;
  private static __contexts = new Set<EngineContext>();

  private static __initializeGLFW() {
    if (EngineContext.__glfwInitialized) return;
    GLFW_DEBUG('Initializing GLFW for first window creation');
    EngineContext.__errorCallback = buildCallback(
      glfwErrorCallback,
      (errorCode, description) => {
        GLFW_DEBUG(getGlfwErrorDescription(errorCode), description);
      },
    );
    GLFW.glfwSetErrorCallback(EngineContext.__errorCallback.ptr);

    if (GLFW.glfwInit() === 0) {
      EngineContext.__errorCallback.close();
      EngineContext.__errorCallback = null;
      throw new EngineError('initialization failed', 'Context');
    }
    GLFW_DEBUG('GLFW initialized successfully');

    const glfwVersion = GLFW.glfwGetVersionString();
    GLFW_DEBUG(`Version: ${glfwVersion}`);

    if (!GLFW.glfwVulkanSupported()) {
      throw new EngineError('Vulkan is not supported', 'Context');
    }
    GLFW_DEBUG(`Chose Vulkan as the graphics API`);
    this.__glfwInitialized = true;
  }

  private static __disposeGLFW() {
    GLFW.glfwSetErrorCallback(0 as Pointer);
    GLFW.glfwTerminate();
    EngineContext.__errorCallback?.close();
    EngineContext.__errorCallback = null;
    EngineContext.__glfwInitialized = false;
  }

  private static __initializeVulkan() {
    if (EngineContext.__vulkanInitialized) return;

    const extensionsPtr = new BigUint64Array(1);
    const extensionCount =
      process.platform === 'darwin'
        ? CC.instanceExtensionsDarwin(ptr(extensionsPtr))
        : CC.instanceExtensions(ptr(extensionsPtr));

    const appInfo = instantiate(vkApplicationInfo);
    appInfo.pApplicationName = getEnv('APP_NAME', 'Bunbox App');
    appInfo.applicationVersion = Number(getEnv('APP_VERSION', '1'));
    appInfo.pEngineName = 'Bunbox Engine';
    appInfo.engineVersion = 1;
    appInfo.apiVersion = makeVersion(1, 4, 0);

    const createInfo = instantiate(vkInstanceCreateInfo);
    createInfo.pApplicationInfo = BigInt(ptr(getInstanceBuffer(appInfo)));
    createInfo.enabledExtensionCount = extensionCount;
    createInfo.ppEnabledExtensionNames = extensionsPtr[0]!;
    createInfo.enabledLayerCount = 0;
    createInfo.ppEnabledLayerNames = 0n;

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateInstance(
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new EngineError(getResultMessage(result), 'Context');
    }
    EngineContext.__vulkanInstance = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG('Vulkan instance created successfully');
    EngineContext.__vulkanInitialized = true;
  }

  private static __disposeVulkan() {
    if (!EngineContext.__vulkanInstance) return;

    VK.vkDestroyInstance(EngineContext.__vulkanInstance, null);
    VK_DEBUG('Destroyed Vulkan instance');
    EngineContext.__vulkanInstance = null;
    EngineContext.__vulkanInitialized = false;
  }

  private static __initializeMainLoop() {
    if (EngineContext.__loopInitialized) return;

    GLFW_DEBUG('Starting main loop');

    EngineContext.__loopInitialized = true;

    let prev = performance.now();

    const loop = () => {
      if (!EngineContext.__loopInitialized) return;
      const time = performance.now();
      const delta = time - prev;
      prev = time;

      GLFW.glfwPollEvents();

      for (const ctx of EngineContext.__contexts) {
        ctx.__triggerProcessStack(delta, time);
      }
      setTimeout(loop, 4 /* approx 240fps max */);
    };
    setTimeout(loop, 0);
  }

  private static __disposeMainLoop() {
    EngineContext.__loopInitialized = false;
    GLFW_DEBUG('Main loop stopped');
  }

  private __windows = new Set<bigint>();
  private __windowsPack: Map<bigint, WindowPack> = new Map();
  private __windowsWorlds: Map<bigint, World> = new Map();
  private __windowsFrameIndices: Map<bigint, number> = new Map();

  private __assetsStorage = new AssetsStorage();

  // Aux holders
  private __imageIndexHolder = new Uint32Array(1);

  [CONTEXT_prepare]() {
    if (!EngineContext.__glfwInitialized) {
      EngineContext.__initializeGLFW();
    }
    if (!EngineContext.__vulkanInitialized) {
      EngineContext.__initializeVulkan();
    }
    if (!EngineContext.__loopInitialized) {
      EngineContext.__initializeMainLoop();
    }
    EngineContext.__contexts.add(this);
  }

  [CONTEXT_dispose]() {
    if (this.__windows.size === 0) {
      this.__assetsStorage.clear();
      EngineContext.__contexts.delete(this);
    }
    if (EngineContext.__contexts.size === 0) {
      EngineContext.__disposeMainLoop();
      EngineContext.__disposeVulkan();
      EngineContext.__disposeGLFW();
    }
  }

  [CONTEXT_attachWindowWorld](window: bigint, world: World | null): void {
    // TODO: transition world system in future

    if (world) this.__windowsWorlds.set(window, world);
    else this.__windowsWorlds.delete(window);
  }

  [CONTEXT_rebuildWindowResources](
    window: bigint,
    display: bigint,
    width: number,
    height: number,
  ): void {
    this.__windows.add(window);

    let pack = this.__windowsPack.get(window);
    if (!pack) {
      pack = {
        device: new VkDevice(EngineContext.__vulkanInstance!, window, display),
      };
      this.__windowsPack.set(window, pack);
      this.__windowsFrameIndices.set(window, 0);
    }

    // clear old swapchain if exists
    if (pack.swapchain) {
      pack.swapchain.dispose();
      pack.swapchain = undefined;
    }
    if (width <= 0 || height <= 0) {
      return;
    }
    pack.swapchain = new VkSwapchain(pack.device, width, height);

    const imageCount = pack.swapchain.imageCount;
    const frameCount = pack.swapchain.frameCount;

    if (
      pack.sync &&
      pack.swapchain.frameCount !== pack.sync.maxFramesInFlight
    ) {
      pack.sync.dispose();
      pack.sync = undefined;
    }

    if (!pack.sync) {
      pack.sync = new VkSync(pack.device.logicalDevice, frameCount, imageCount);
    } else if (pack.sync.maxImagesInFlight !== imageCount) {
      pack.sync.updateImagesCount(imageCount);
    }

    if (!pack.commandPool) {
      pack.commandPool = new VkCommandPool(
        pack.device.logicalDevice,
        pack.device.findQueueFamily(),
      );
    }

    if (!pack.commandBuffers || pack.commandBuffers.length !== frameCount) {
      pack.commandBuffers?.forEach((cmdBuf) => cmdBuf.dispose());
      const newCmdBuffers: VkCommandBuffer[] = [];
      for (let i = 0; i < frameCount; i++) {
        const cmdBuf = new VkCommandBuffer(
          pack.device.logicalDevice,
          pack.commandPool.instance,
        );
        newCmdBuffers.push(cmdBuf);
      }
      pack.commandBuffers = newCmdBuffers;
    }
  }

  [CONTEXT_disposeWindowResources](window: bigint): void {
    const pack = this.__windowsPack.get(window);
    if (pack) {
      pack.sync?.waitDeviceIdle();

      // TODO: dispose other resources associated with swapchain

      pack.swapchain?.dispose();
      pack.sync?.dispose();
      pack.commandBuffers?.forEach((cmdBuf) => cmdBuf.dispose());
      pack.commandPool?.dispose();
      pack.device.dispose();
    }
    this.__windowsFrameIndices.delete(window);
    this.__windowsPack.delete(window);
    this.__windows.delete(window);
  }

  private __triggerProcessStack(delta: number, time: number) {
    for (const [window, world] of this.__windowsWorlds.entries()) {
      const pack = this.__windowsPack.get(window);
      if (
        !pack ||
        !pack.device ||
        !pack.swapchain ||
        !pack.sync ||
        !pack.commandBuffers
      ) {
        continue;
      }
      const frameIndex = this.__windowsFrameIndices.get(window)!;
      const acquireResult = VK.vkAcquireNextImageKHR(
        pack.device.logicalDevice,
        pack.swapchain.instance,
        VK_WHOLE_SIZE,
        pack.sync.getImageAvailableSemaphore(frameIndex),
        0,
        ptr(this.__imageIndexHolder),
      );

      if (acquireResult === VkResult.ERROR_OUT_OF_DATE_KHR) {
        continue;
      }

      if (
        acquireResult !== VkResult.SUCCESS &&
        acquireResult !== VkResult.SUBOPTIMAL_KHR
      ) {
        throw new RenderError(getResultMessage(acquireResult), 'Vulkan');
      }

      const imageIndex = this.__imageIndexHolder[0]!;
      pack.sync.waitIfImageInFlight(imageIndex);
      pack.sync.tagImageWithFrameFence(imageIndex, frameIndex);
      pack.sync.resetFence(frameIndex);
      const commandBuffer = pack.commandBuffers[frameIndex]!;

      world?.[FRAME_LOOP](
        window,
        {
          device: pack.device,
          swapchain: pack.swapchain,
          commandBuffer,
          imageIndex,
        },
        this.__assetsStorage,
        time,
        delta,
      );

      const signal = this.__submit(
        pack.sync,
        commandBuffer.instance,
        pack.device.familyQueue,
        frameIndex,
      );

      this.__present(
        pack.swapchain.instance,
        signal,
        pack.device.familyQueue,
        imageIndex,
      );

      this.__windowsFrameIndices.set(
        window,
        (frameIndex + 1) % pack.swapchain.frameCount,
      );
    }
  }

  private __submit(
    sync: VkSync,
    cmd: Pointer,
    queue: Pointer,
    frameIndex: number,
  ) {
    const waitSemaphores = new BigUint64Array([
      BigInt(sync.getImageAvailableSemaphore(frameIndex)),
    ]);
    const waitStages = new Uint32Array([VkSync.DEFAULT_WAIT_STAGE]);
    const commandBufferArray = new BigUint64Array([
      BigInt(cmd),
    ]);
    const signalSemaphores = new BigUint64Array([
      BigInt(sync.getRenderFinishedSemaphore(frameIndex)),
    ]);
    const signal = BigInt(ptr(signalSemaphores));

    const submitInfo = instantiate(vkSubmitInfo);
    submitInfo.waitSemaphoreCount = 1;
    submitInfo.pWaitSemaphores = BigInt(ptr(waitSemaphores));
    submitInfo.pWaitDstStageMask = BigInt(ptr(waitStages));
    submitInfo.commandBufferCount = 1;
    submitInfo.pCommandBuffers = BigInt(ptr(commandBufferArray));
    submitInfo.signalSemaphoreCount = 1;
    submitInfo.pSignalSemaphores = BigInt(ptr(signalSemaphores));

    const submitResult = VK.vkQueueSubmit(
      queue,
      1,
      ptr(getInstanceBuffer(submitInfo)),
      sync.getInFlightFence(frameIndex),
    );

    if (submitResult !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(submitResult), 'Vulkan');
    }

    return signal;
  }

  private __present(
    swapchain: Pointer,
    signal: bigint,
    queue: Pointer,
    imageIndex: number,
  ) {
    const swapchains = new BigUint64Array([
      BigInt(swapchain),
    ]);
    const imageIndices = new Uint32Array([imageIndex]);

    const presentInfo = instantiate(vkPresentInfoKHR);
    presentInfo.waitSemaphoreCount = 1;
    presentInfo.pWaitSemaphores = signal;
    presentInfo.swapchainCount = 1;
    presentInfo.pSwapchains = BigInt(ptr(swapchains));
    presentInfo.pImageIndices = BigInt(ptr(imageIndices));
    presentInfo.pResults = 0n;

    const presentResult = VK.vkQueuePresentKHR(
      queue,
      ptr(getInstanceBuffer(presentInfo)),
    );

    if (
      presentResult === VkResult.ERROR_OUT_OF_DATE_KHR ||
      presentResult === VkResult.SUBOPTIMAL_KHR
    ) {
      return;
    }

    if (presentResult !== VkResult.SUCCESS) {
      throw new RenderError(getResultMessage(presentResult), 'Vulkan');
    }
  }
}
