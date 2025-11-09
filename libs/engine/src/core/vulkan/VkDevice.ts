import { CString, JSCallback, linkSymbols, ptr, type Pointer } from 'bun:ffi';
import {
  getResultMessage,
  makeVersion,
  VK,
  vkApplicationInfo,
  VkDebugUtilsMessageSeverityFlagsEXT,
  VkDebugUtilsMessageTypeFlagsEXT,
  vkDebugUtilsMessengerCallback,
  vkDebugUtilsMessengerCallbackDataEXT,
  vkDebugUtilsMessengerCreateInfoEXT,
  vkInstanceCreateInfo,
  vkLayerProperties,
  vkMetalSurfaceCreateInfoEXT,
  vkPhysicalDeviceProperties,
  vkQueueFamilyProperties,
  VkQueueFlagBits,
  VkResult,
  VkStructureType,
  vkWaylandSurfaceCreateInfoKHR,
  vkWin32SurfaceCreateInfoKHR,
  vkXcbSurfaceCreateInfoKHR,
  vkXlibSurfaceCreateInfoKHR,
} from '@bunbox/vk';
import {
  getInstanceBuffer,
  instanceToJSON,
  instantiate,
  sizeOf,
  type InferField,
} from '@bunbox/struct';
import {
  buildCallback,
  cstr,
  pointerCopyBuffer,
  undoCstr,
} from '../../utils/buffer';
import { VK_DEBUG } from '../../singleton/logger';
import { getEnv } from '../../utils/env';
import { GLFW } from '@bunbox/glfw';
import { DynamicLibError } from '../../errors';
import type { Disposable } from '@bunbox/utils';
import {
  decreaseCounter,
  getCounter,
  increaseCounter,
} from '../../global/counter';

const VALIDATION_LAYERS = ['VK_LAYER_KHRONOS_validation'];

type PhysicalDeviceProps = {
  deviceName: string;
  deviceType: number;
  deviceID: number;
  vendorID: number;
  apiVersion: number;
  driverVersion: number;
  limit: InferField<typeof vkPhysicalDeviceProperties>['limits'];
  sparseProperties: InferField<
    typeof vkPhysicalDeviceProperties
  >['sparseProperties'];
};

type QueueFamilyIndices = {
  graphicsFamily: number;
  presentFamily: number;
  graphicsFamilyHasValue: boolean;
  presentFamilyHasValue: boolean;
};

export class VkDevice implements Disposable {
  static #instance: Pointer | null = null;
  static #errorCallback: JSCallback | null = null;

  // Opaque handlers
  static #debugMessenger: BigUint64Array = new BigUint64Array(1);

  static #createInstance() {
    if (VkDevice.#instance) return;

    const debugDataStruct = instantiate(vkDebugUtilsMessengerCallbackDataEXT);
    VkDevice.#errorCallback = buildCallback(
      vkDebugUtilsMessengerCallback,
      (severity, types, data, _userData) => {
        pointerCopyBuffer(data as Pointer, getInstanceBuffer(debugDataStruct));

        VK_DEBUG(
          'Vulkan Debug Message:',
          `Severity: ${severity}, Types: ${types}, Message: ${debugDataStruct.pMessage} `,
        );

        return 0;
      },
    );

    if (VK_DEBUG.enabled && !VkDevice.#isLayerSupportValid()) {
      VK_DEBUG(
        'Validation layers requested, but not available. Continuing without validation layers.',
      );
    }
    const { extensions, extPtr } = VkDevice.#getRequiredExtensions();

    const appInfo = instantiate(vkApplicationInfo);
    appInfo.sType = VkStructureType.APPLICATION_INFO;
    appInfo.pApplicationName = getEnv('APP_NAME', 'Bunbox App');
    appInfo.applicationVersion = Number(getEnv('APP_VERSION', '1'));
    appInfo.pEngineName = 'Bunbox Engine';
    appInfo.engineVersion = 1;
    appInfo.apiVersion = makeVersion(1, 4, 0);

    const createInfo = instantiate(vkInstanceCreateInfo);
    createInfo.sType = VkStructureType.INSTANCE_CREATE_INFO;
    createInfo.pApplicationInfo = BigInt(ptr(getInstanceBuffer(appInfo)));
    createInfo.enabledExtensionCount = extensions.length;
    createInfo.ppEnabledExtensionNames = BigInt(extPtr);

    if (VK_DEBUG.enabled) {
      createInfo.enabledLayerCount = VALIDATION_LAYERS.length;
      createInfo.ppEnabledLayerNames = BigInt(
        ptr(
          new BigUint64Array(VALIDATION_LAYERS.map(cstr).map(ptr).map(BigInt)),
        ),
      );

      const debugCreateInfo = VkDevice.#getDebugMessenger();
      createInfo.pNext = BigInt(ptr(getInstanceBuffer(debugCreateInfo)));
    } else {
      createInfo.enabledLayerCount = 0;
      createInfo.ppEnabledLayerNames = 0n;
      createInfo.pNext = 0n;
    }

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateInstance(
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    VkDevice.#instance = Number(pointerHolder[0]!) as Pointer;

    VkDevice.#setupDebugMessenger();
  }

  static #destroyInstance() {
    if (!VkDevice.#instance) return;

    // Destroy debug messenger if it exists
    if (VK_DEBUG.enabled && VkDevice.#debugMessenger[0]) {
      const funcPtr = VK.vkGetInstanceProcAddr(
        VkDevice.#instance,
        ptr(cstr('vkDestroyDebugUtilsMessengerEXT')),
      );

      if (funcPtr) {
        const lib = linkSymbols({
          destroyDebugFunc: {
            args: ['ptr', 'ptr', 'ptr'],
            return: 'void',
            ptr: funcPtr,
          },
        });
        lib.symbols.destroyDebugFunc(
          VkDevice.#instance,
          Number(VkDevice.#debugMessenger[0]) as Pointer,
          null,
        );
        lib.close();
        VK_DEBUG('Destroyed debug messenger');
      }
      VkDevice.#debugMessenger[0] = 0n;
    }

    // Destroy Vulkan instance
    VK.vkDestroyInstance(VkDevice.#instance, null);
    VK_DEBUG('Destroyed Vulkan instance');
    VkDevice.#instance = null;

    // Clean up error callback
    if (VkDevice.#errorCallback) {
      VkDevice.#errorCallback.close();
      VkDevice.#errorCallback = null;
    }
  }

  static #setupDebugMessenger() {
    if (!VK_DEBUG.enabled || !VkDevice.#instance) return;
    const createInfo = VkDevice.#getDebugMessenger();

    const funcPtr = VK.vkGetInstanceProcAddr(
      VkDevice.#instance,
      ptr(cstr('vkCreateDebugUtilsMessengerEXT')),
    );

    let result: number = VkResult.SUCCESS;

    if (funcPtr) {
      const lib = linkSymbols({
        debugFunc: {
          args: ['ptr', 'ptr', 'ptr', 'ptr'],
          return: 'i32',
          ptr: funcPtr,
        },
      });
      result =
        lib.symbols.debugFunc(
          VkDevice.#instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(VkDevice.#debugMessenger),
        ) ?? VkResult.ERROR_EXTENSION_NOT_PRESENT;

      lib.close();
    } else {
      result = VkResult.ERROR_EXTENSION_NOT_PRESENT;
    }

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
  }

  static #isLayerSupportValid() {
    const count = new Uint32Array(1);
    VK.vkEnumerateInstanceLayerProperties(ptr(count), null);

    const size = sizeOf(vkLayerProperties);
    const buffer = new Uint8Array(count[0]! * size);

    VK.vkEnumerateInstanceLayerProperties(ptr(count), ptr(buffer));

    const layers: InferField<typeof vkLayerProperties>[] = [];
    for (let i = 0; i < count[0]!; i++) {
      const layer = instantiate(vkLayerProperties, buffer, i);
      layers.push(layer);
    }
    const formattedLayers = layers.map((layer) => ({
      layerName: undoCstr(layer.layerName),
      specVersion: layer.specVersion,
      implementationVersion: layer.implementationVersion,
      description: undoCstr(layer.description),
    }));

    const names = formattedLayers.map((layer) => layer.layerName);
    VK_DEBUG('Vulkan Layers:', names.join(', '));

    return VALIDATION_LAYERS.every((layer) => names.includes(layer));
  }

  static #getRequiredExtensions() {
    const count = new Uint32Array(1);
    const extPtr = GLFW.glfwGetRequiredInstanceExtensions(ptr(count));

    if (!extPtr || !count[0]) {
      throw new DynamicLibError(
        'Failed to get required GLFW extensions',
        'Vulkan',
      );
    }

    const extPtrBfr = new BigUint64Array(count[0]!);
    pointerCopyBuffer(extPtr, extPtrBfr.buffer);

    const exts: string[] = [];
    for (let i = 0; i < count[0]!; i++) {
      const p = Number(extPtrBfr[i]!) as Pointer;
      exts.push(new CString(p).toString());
    }

    return { extensions: exts, extPtr };
  }

  static #getDebugMessenger() {
    const debugCreateInfo = instantiate(vkDebugUtilsMessengerCreateInfoEXT);
    debugCreateInfo.sType =
      VkStructureType.DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    debugCreateInfo.messageSeverity =
      VkDebugUtilsMessageSeverityFlagsEXT.VERBOSE;
    debugCreateInfo.messageType = VkDebugUtilsMessageTypeFlagsEXT.VALIDATION;
    debugCreateInfo.pfnUserCallback = BigInt(VkDevice.#errorCallback!.ptr ?? 0);
    return debugCreateInfo;
  }

  // MARK: Instance Properties

  #window: Pointer;
  #nativeWindow: bigint;
  #display: bigint;
  #surface: Pointer | null = null;

  #physicalDevices: Pointer[] = [];
  #physicalDevicesProperties: PhysicalDeviceProps[] = [];

  constructor(window: Pointer, nativeWindow: bigint, display: bigint) {
    this.#window = window;
    this.#nativeWindow = nativeWindow;
    this.#display = display;

    VkDevice.#createInstance();
    this.#createSurface();
    this.#pickPhysicalDevice();

    increaseCounter('VkDevice');
  }

  dispose() {
    decreaseCounter('VkDevice');
    if (this.#surface) {
      VK.vkDestroySurfaceKHR(VkDevice.#instance!, this.#surface, null);
      this.#surface = null;
      VK_DEBUG(`Destroyed VkSurfaceKHR for VkDevice`);
    }

    if (!getCounter('VkDevice')) {
      VK_DEBUG(`No more VkDevice instances, cleaning up Vulkan instance`);
      VkDevice.#destroyInstance();
    }
  }

  #createSurface() {
    if (!VkDevice.#instance) return;

    const surfacePtr = new BigUint64Array(1);
    let result: number;

    if (process.platform === 'win32') {
      const createInfo = instantiate(vkWin32SurfaceCreateInfoKHR);
      createInfo.sType = VkStructureType.WIN32_SURFACE_CREATE_INFO_KHR;
      createInfo.pNext = 0n;
      createInfo.flags = 0;
      createInfo.hinstance = this.#display;
      createInfo.hwnd = this.#nativeWindow;

      result = VK.vkCreateWin32SurfaceKHR(
        VkDevice.#instance,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(surfacePtr),
      );
    } else if (process.platform === 'linux') {
      // Try Wayland first
      if (this.#display) {
        const createInfo = instantiate(vkWaylandSurfaceCreateInfoKHR);
        createInfo.sType = VkStructureType.WAYLAND_SURFACE_CREATE_INFO_KHR;
        createInfo.pNext = 0n;
        createInfo.flags = 0;
        createInfo.display = this.#display;
        createInfo.surface = this.#nativeWindow;

        result = VK.vkCreateWaylandSurfaceKHR(
          VkDevice.#instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(surfacePtr),
        );
      } else {
        // Fallback to Xlib
        const createInfo = instantiate(vkXlibSurfaceCreateInfoKHR);
        createInfo.sType = VkStructureType.XLIB_SURFACE_CREATE_INFO_KHR;
        createInfo.pNext = 0n;
        createInfo.flags = 0;
        createInfo.dpy = this.#display;
        createInfo.window = this.#nativeWindow;

        result = VK.vkCreateXlibSurfaceKHR(
          VkDevice.#instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(surfacePtr),
        );
      }
    } else if (process.platform === 'darwin') {
      const createInfo = instantiate(vkMetalSurfaceCreateInfoEXT);
      createInfo.sType = VkStructureType.METAL_SURFACE_CREATE_INFO_EXT;
      createInfo.pNext = 0n;
      createInfo.flags = 0;
      createInfo.pLayer = this.#nativeWindow;

      result = VK.vkCreateMetalSurfaceEXT(
        VkDevice.#instance,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(surfacePtr),
      );
    } else {
      throw new DynamicLibError(
        `Unsupported platform: ${process.platform}`,
        'Vulkan',
      );
    }

    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.#surface = Number(surfacePtr[0]!) as Pointer;
  }

  #pickPhysicalDevice() {
    if (!VkDevice.#instance) return;

    const count = new Uint32Array(1);
    VK.vkEnumeratePhysicalDevices(VkDevice.#instance, ptr(count), null);

    if (!count[0]) {
      throw new DynamicLibError(
        'Failed to find GPUs with Vulkan support',
        'Vulkan',
      );
    }
    VK_DEBUG(`Device count: ${count[0]!}`);
    const devices = new BigUint64Array(count[0]!);
    VK.vkEnumeratePhysicalDevices(VkDevice.#instance, ptr(count), ptr(devices));

    const usableDevices: Pointer[] = [];

    for (let i = 0; i < count[0]!; i++) {
      const device = Number(devices[i]) as Pointer;
      VK_DEBUG(`Found device handle: ${device}`);
      if (this.#isDeviceSuitable(device)) {
        usableDevices.push(device);
      }
    }

    if (usableDevices.length === 0) {
      throw new DynamicLibError('Failed to find a suitable GPU!', 'Vulkan');
    }

    this.#physicalDevices = usableDevices;
    this.#physicalDevicesProperties = usableDevices.map((device) => {
      const props = instantiate(vkPhysicalDeviceProperties);
      VK.vkGetPhysicalDeviceProperties(device, ptr(getInstanceBuffer(props)));

      return {
        deviceName: undoCstr(props.deviceName),
        deviceType: props.deviceType,
        deviceID: props.deviceID,
        vendorID: props.vendorID,
        apiVersion: props.apiVersion,
        driverVersion: props.driverVersion,
        limit: instanceToJSON(props.limits),
        sparseProperties: instanceToJSON(props.sparseProperties),
      };
    });
  }

  #isDeviceSuitable(device: Pointer): boolean {
    if (!this.#surface) return false;
    const indices = this.#findQueueFamilies(device, this.#surface);

    // QueueFamilyIndices indices = findQueueFamilies(device);
    // bool extensionsSupported = checkDeviceExtensionSupport(device);
    // bool swapChainAdequate = false;
    // if (extensionsSupported) {
    //   SwapChainSupportDetails swapChainSupport = querySwapChainSupport(device);
    //   swapChainAdequate = !swapChainSupport.formats.empty() && !swapChainSupport.presentModes.empty();
    // }
    // VkPhysicalDeviceFeatures supportedFeatures;
    // vkGetPhysicalDeviceFeatures(device, &supportedFeatures);
    // return indices.isComplete() && extensionsSupported && swapChainAdequate &&
    //        supportedFeatures.samplerAnisotropy;

    // TODO: Implement device suitability check
    return true;
  }

  #findQueueFamilies(device: Pointer, surface: Pointer) {
    const indices: QueueFamilyIndices = {
      graphicsFamily: -1,
      presentFamily: -1,
      graphicsFamilyHasValue: false,
      presentFamilyHasValue: false,
    };

    const count = new Uint32Array(1);
    VK.vkGetPhysicalDeviceQueueFamilyProperties(device, ptr(count), null);

    const size = sizeOf(vkQueueFamilyProperties);
    const buffer = new Uint8Array(count[0]! * size);
    VK.vkGetPhysicalDeviceQueueFamilyProperties(
      device,
      ptr(count),
      ptr(buffer),
    );

    const queueFamilies: InferField<typeof vkQueueFamilyProperties>[] = [];
    for (let i = 0; i < count[0]!; i++) {
      const queueFamily = instantiate(vkQueueFamilyProperties, buffer, i);
      queueFamilies.push(queueFamily);
    }

    for (let i = 0; i < queueFamilies.length; i++) {
      const queueFamily = queueFamilies[i]!;
      if (
        queueFamily.queueCount > 0 &&
        queueFamily.queueFlags & VkQueueFlagBits.GRAPHICS_BIT
      ) {
        VK_DEBUG(`Found graphics queue family at index ${i}`);
        indices.graphicsFamily = i;
        indices.graphicsFamilyHasValue = true;
      }
      const presentSupport = new Uint8Array(1);
      VK.vkGetPhysicalDeviceSurfaceSupportKHR(
        device,
        i,
        surface,
        ptr(presentSupport),
      );
      if (queueFamily.queueCount > 0 && !presentSupport[0]) {
        VK_DEBUG(`Found present queue family at index ${i}`);
        indices.presentFamily = i;
        indices.presentFamilyHasValue = true;
      }
      if (indices.graphicsFamilyHasValue && indices.presentFamilyHasValue) {
        break;
      }
    }

    return indices;
  }
}
