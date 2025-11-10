import { GLFW, isWayland } from '@bunbox/glfw';
import {
  getInstanceBuffer,
  instanceToJSON,
  instantiate,
  sizeOf,
  type InferField,
} from '@bunbox/struct';
import type { Disposable } from '@bunbox/utils';
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
  vkDeviceCreateInfo,
  vkDeviceQueueCreateInfo,
  vkInstanceCreateInfo,
  vkLayerProperties,
  vkMetalSurfaceCreateInfoEXT,
  vkPhysicalDeviceFeatures,
  vkPhysicalDeviceProperties,
  VkPhysicalDeviceType,
  vkQueueFamilyProperties,
  VkQueueFlagBits,
  VkResult,
  vkSurfaceCapabilitiesKHR,
  vkSurfaceFormatKHR,
  vkWaylandSurfaceCreateInfoKHR,
  vkWin32SurfaceCreateInfoKHR,
  vkXlibSurfaceCreateInfoKHR,
} from '@bunbox/vk';
import { CString, JSCallback, linkSymbols, ptr, type Pointer } from 'bun:ffi';
import { DynamicLibError } from '../../errors';
import {
  decreaseCounter,
  getCounter,
  increaseCounter,
} from '../../global/counter';
import { VK_DEBUG } from '../../singleton/logger';
import {
  buildCallback,
  cstr,
  pointerCopyBuffer,
  undoCstr,
} from '../../utils/buffer';
import { getEnv } from '../../utils/env';

const INSTANCE_LAYERS_ADD = [
  'VK_EXT_debug_utils',
  'VK_EXT_swapchain_colorspace',
  ...(process.platform === 'darwin'
    ? ['VK_KHR_portability_enumeration', 'VK_KHR_portability_subset']
    : []),
];
const VALIDATION_LAYERS = [
  'VK_LAYER_KHRONOS_validation',
];
const VALIDATION_DEVICE_EXTENSIONS = [
  'VK_KHR_swapchain',
];

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
  computeFamily: number;
  transferFamily: number;
  graphicsFamilyHasValue: boolean;
  presentFamilyHasValue: boolean;
  computeFamilyHasValue: boolean;
  transferFamilyHasValue: boolean;
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
    appInfo.pApplicationName = getEnv('APP_NAME', 'Bunbox App');
    appInfo.applicationVersion = Number(getEnv('APP_VERSION', '1'));
    appInfo.pEngineName = 'Bunbox Engine';
    appInfo.engineVersion = 1;
    appInfo.apiVersion = makeVersion(1, 4, 0);

    const createInfo = instantiate(vkInstanceCreateInfo);
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

    VK.vkDestroyInstance(VkDevice.#instance, null);
    VK_DEBUG('Destroyed Vulkan instance');
    VkDevice.#instance = null;

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

    return {
      extensions: [
        ...exts,
        // TODO:...INSTANCE_LAYERS_ADD, --- FUTURE FIX ---
      ],
      extPtr,
    };
  }

  static #getDebugMessenger() {
    const debugCreateInfo = instantiate(vkDebugUtilsMessengerCreateInfoEXT);
    debugCreateInfo.messageSeverity =
      VkDebugUtilsMessageSeverityFlagsEXT.VERBOSE;
    debugCreateInfo.messageType = VkDebugUtilsMessageTypeFlagsEXT.VALIDATION;
    debugCreateInfo.pfnUserCallback = BigInt(VkDevice.#errorCallback!.ptr ?? 0);
    return debugCreateInfo;
  }

  // MARK: Instance Properties

  #nativeWindow: bigint;
  #display: bigint;
  #surface: Pointer | null = null;
  #logicalDevice: Pointer | null = null;

  #graphicsQueue: Pointer | null = null;
  #presentQueue: Pointer | null = null;

  #physicalDevice: Pointer | null = null;
  #physicalDeviceProperties: PhysicalDeviceProps | null = null;

  constructor(nativeWindow: bigint, display: bigint) {
    this.#nativeWindow = nativeWindow;
    this.#display = display;

    VkDevice.#createInstance();
    this.#createSurface();
    this.#pickPhysicalDevice();
    this.#createLogicalDevice();

    increaseCounter('VkDevice');
  }

  get physicalDevice() {
    return this.#physicalDevice!;
  }

  get physicalDeviceProperties() {
    return this.#physicalDeviceProperties!;
  }

  get logicalDevice() {
    return this.#logicalDevice!;
  }

  get surface() {
    return this.#surface!;
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

  findQueueFamilies(device?: Pointer) {
    const d = device ?? this.#physicalDevice!;

    const indices: QueueFamilyIndices = {
      graphicsFamily: -1,
      presentFamily: -1,
      computeFamily: -1,
      transferFamily: -1,
      graphicsFamilyHasValue: false,
      presentFamilyHasValue: false,
      computeFamilyHasValue: false,
      transferFamilyHasValue: false,
    };

    const count = new Uint32Array(1);
    VK.vkGetPhysicalDeviceQueueFamilyProperties(d, ptr(count), null);

    const size = sizeOf(vkQueueFamilyProperties);
    const buffer = new Uint8Array(count[0]! * size);
    VK.vkGetPhysicalDeviceQueueFamilyProperties(d, ptr(count), ptr(buffer));

    const queueFamilies: InferField<typeof vkQueueFamilyProperties>[] = [];
    for (let i = 0; i < count[0]!; i++) {
      const queueFamily = instantiate(vkQueueFamilyProperties, buffer, i);
      queueFamilies.push(queueFamily);
    }

    for (let i = 0; i < queueFamilies.length; i++) {
      const queueFamily = queueFamilies[i]!;
      if (queueFamily.queueCount > 0) {
        if (queueFamily.queueFlags & VkQueueFlagBits.GRAPHICS_BIT) {
          VK_DEBUG(`Found graphics queue family at index ${i}`);
          indices.graphicsFamily = i;
          indices.graphicsFamilyHasValue = true;
        }
        if (queueFamily.queueFlags & VkQueueFlagBits.COMPUTE_BIT) {
          VK_DEBUG(`Found compute queue family at index ${i}`);
          indices.computeFamily = i;
          indices.computeFamilyHasValue = true;
        }
        if (queueFamily.queueFlags & VkQueueFlagBits.TRANSFER_BIT) {
          VK_DEBUG(`Found transfer queue family at index ${i}`);
          indices.transferFamily = i;
          indices.transferFamilyHasValue = true;
        }
      }
      const presentSupport = new Uint8Array(1);
      VK.vkGetPhysicalDeviceSurfaceSupportKHR(
        d,
        i,
        this.#surface!,
        ptr(presentSupport),
      );
      if (queueFamily.queueCount > 0 && presentSupport[0]) {
        VK_DEBUG(`Found present queue family at index ${i}`);
        indices.presentFamily = i;
        indices.presentFamilyHasValue = true;
      }
      if (
        indices.graphicsFamilyHasValue &&
        indices.presentFamilyHasValue &&
        indices.computeFamilyHasValue &&
        indices.transferFamilyHasValue
      ) {
        break;
      }
    }

    return indices;
  }

  getSwapChainSupport() {
    return this.#getSwapChainSupport(this.#physicalDevice!);
  }

  #createSurface() {
    if (!VkDevice.#instance) return;

    const surfacePtr = new BigUint64Array(1);
    let result: number;

    if (process.platform === 'win32') {
      const createInfo = instantiate(vkWin32SurfaceCreateInfoKHR);
      createInfo.hinstance = this.#display;
      createInfo.hwnd = this.#nativeWindow;

      result = VK.vkCreateWin32SurfaceKHR(
        VkDevice.#instance,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(surfacePtr),
      );
    } else if (process.platform === 'linux') {
      if (isWayland()) {
        const createInfo = instantiate(vkWaylandSurfaceCreateInfoKHR);
        createInfo.display = this.#display;
        createInfo.surface = this.#nativeWindow;

        result = VK.vkCreateWaylandSurfaceKHR(
          VkDevice.#instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(surfacePtr),
        );
      } else {
        const createInfo = instantiate(vkXlibSurfaceCreateInfoKHR);
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

    if (usableDevices.length === 1) {
      VK_DEBUG('Only one suitable GPU found, selecting it by default.');
      this.#physicalDevice = usableDevices[0]!;
      this.#physicalDeviceProperties = this.#getDeviceProperties(
        this.#physicalDevice,
      );
      return;
    }

    const devicesProperties = usableDevices.map((device) =>
      this.#getDeviceProperties(device),
    );
    let bestDeviceIndex = -1;
    let bestScore = 0;
    const deviceTypeScore = (type: number) => {
      switch (type) {
        case VkPhysicalDeviceType.DISCRETE_GPU:
          return 3;
        case VkPhysicalDeviceType.INTEGRATED_GPU:
          return 2;
        case VkPhysicalDeviceType.VIRTUAL_GPU:
          return 1;
        default:
          return 0;
      }
    };

    // Pick device with best type `(discrete GPU > integrated > virtual/CPU) * 2 weight` and greatest vram.
    for (let i = 0; i < devicesProperties.length; i++) {
      if (bestDeviceIndex === -1) {
        bestDeviceIndex = i;
        bestScore =
          deviceTypeScore(devicesProperties[i]!.deviceType) * 2 +
          devicesProperties[i]!.limit.maxMemoryAllocationCount / 1024 / 1024;
        continue;
      }

      const currentDevice = devicesProperties[i]!;
      const currentScore =
        deviceTypeScore(currentDevice.deviceType) * 2 +
        currentDevice.limit.maxMemoryAllocationCount / 1024 / 1024;

      if (bestScore < currentScore) {
        bestScore = currentScore;
        bestDeviceIndex = i;
        continue;
      }
    }
    this.#physicalDevice = usableDevices[bestDeviceIndex]!;
    this.#physicalDeviceProperties = devicesProperties[bestDeviceIndex]!;
  }

  #createLogicalDevice() {
    if (!this.#surface || !this.#physicalDevice) return;
    const indices = this.findQueueFamilies(this.#physicalDevice);
    const queueCreateInfos: InferField<typeof vkDeviceQueueCreateInfo>[] = [];
    // TODO: Future create with compute and transfer queues
    for (const family of [indices.graphicsFamily, indices.presentFamily]) {
      const queueCreateInfo = instantiate(vkDeviceQueueCreateInfo);
      queueCreateInfo.queueFamilyIndex = family;
      queueCreateInfo.queueCount = 1;
      queueCreateInfo.pQueuePriorities = BigInt(ptr(new Float32Array([1.0])));
      queueCreateInfos.push(queueCreateInfo);
    }

    const deviceFeatures = instantiate(vkPhysicalDeviceFeatures);
    deviceFeatures.samplerAnisotropy = 1;

    const createInfo = instantiate(vkDeviceCreateInfo);
    createInfo.queueCreateInfoCount = queueCreateInfos.length;
    createInfo.pQueueCreateInfos = BigInt(
      ptr(getInstanceBuffer(queueCreateInfos)),
    );
    createInfo.pEnabledFeatures = BigInt(
      ptr(getInstanceBuffer(deviceFeatures)),
    );

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateDevice(
      this.#physicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );
    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.#logicalDevice = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Logical device created: 0x${this.#logicalDevice.toString(16)}`);

    VK.vkGetDeviceQueue(
      this.#logicalDevice,
      indices.graphicsFamily,
      0,
      ptr(pointerHolder),
    );
    const graphicsQueue = Number(pointerHolder[0]!) as Pointer;
    VK.vkGetDeviceQueue(
      this.#logicalDevice,
      indices.presentFamily,
      0,
      ptr(pointerHolder),
    );
    const presentQueue = Number(pointerHolder[0]!) as Pointer;

    VK_DEBUG(`Graphics Queue: 0x${graphicsQueue.toString(16)}`);
    VK_DEBUG(`Present Queue: 0x${presentQueue.toString(16)}`);
    this.#graphicsQueue = graphicsQueue;
    this.#presentQueue = presentQueue;
  }

  #isDeviceSuitable(device: Pointer): boolean {
    if (!this.#surface) return false;
    const indices = this.findQueueFamilies(device);

    if (
      !(
        indices.graphicsFamilyHasValue &&
        indices.presentFamilyHasValue &&
        indices.computeFamilyHasValue &&
        indices.transferFamilyHasValue
      )
    )
      return false;

    const extensionsSupported = this.#isDeviceExtensionSupported(device);
    if (!extensionsSupported) return false;

    const details = this.#getSwapChainSupport(device);
    if (details.formats.length === 0 || details.presentModes.length === 0)
      return false;

    const supportedFeatures = instantiate(vkPhysicalDeviceFeatures);
    VK.vkGetPhysicalDeviceFeatures(
      device,
      ptr(getInstanceBuffer(supportedFeatures)),
    );
    if (!supportedFeatures.samplerAnisotropy) return false;

    return true;
  }

  #isDeviceExtensionSupported(device: Pointer) {
    const counter = new Uint32Array(1);
    VK.vkEnumerateDeviceExtensionProperties(device, null, ptr(counter), null);

    const size = sizeOf(vkLayerProperties);
    const buffer = new Uint8Array(counter[0]! * size);

    VK.vkEnumerateDeviceExtensionProperties(
      device,
      null,
      ptr(counter),
      ptr(buffer),
    );

    const extensions: string[] = [];
    for (let i = 0; i < counter[0]!; i++) {
      const extension = instantiate(vkLayerProperties, buffer, i);
      extensions.push(undoCstr(extension.layerName));
    }

    return VALIDATION_DEVICE_EXTENSIONS.every((ext) =>
      extensions.includes(ext),
    );
  }

  #getDeviceProperties(device: Pointer) {
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
  }

  #getSwapChainSupport(device: Pointer) {
    const capabilities = instantiate(vkSurfaceCapabilitiesKHR);
    VK.vkGetPhysicalDeviceSurfaceCapabilitiesKHR(
      device,
      this.#surface!,
      ptr(getInstanceBuffer(capabilities)),
    );

    const count = new Uint32Array(1);
    VK.vkGetPhysicalDeviceSurfaceFormatsKHR(
      device,
      this.#surface!,
      ptr(count),
      null,
    );

    if (!count[0]) {
      return {
        capabilities,
        formats: [],
        presentModes: [],
      };
    }
    const formatSize = sizeOf(vkSurfaceFormatKHR);
    const formatBuffer = new Uint8Array(count[0]! * formatSize);
    VK.vkGetPhysicalDeviceSurfaceFormatsKHR(
      device,
      this.#surface!,
      ptr(count),
      ptr(formatBuffer),
    );

    const formats: InferField<typeof vkSurfaceFormatKHR>[] = [];
    for (let i = 0; i < count[0]!; i++) {
      const format = instantiate(vkSurfaceFormatKHR, formatBuffer, i);
      formats.push(format);
    }

    count[0] = 0;
    VK.vkGetPhysicalDeviceSurfacePresentModesKHR(
      device,
      this.#surface!,
      ptr(count),
      null,
    );

    if (!count[0]) {
      return {
        capabilities,
        formats,
        presentModes: [],
      };
    }
    const presentModeBuffer = new Uint32Array(count[0]!);
    VK.vkGetPhysicalDeviceSurfacePresentModesKHR(
      device,
      this.#surface!,
      ptr(count),
      ptr(presentModeBuffer),
    );

    const presentModes: number[] = [];
    for (let i = 0; i < count[0]!; i++) {
      presentModes.push(presentModeBuffer[i]!);
    }

    return {
      capabilities,
      formats,
      presentModes,
    };
  }
}
