import { isWayland } from '@bunbox/glfw';
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
  VK_TRUE,
  vkApplicationInfo,
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
import { cc, ptr, type Pointer } from 'bun:ffi';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DynamicLibError } from '../../errors';
import {
  decreaseCounter,
  getCounter,
  increaseCounter,
} from '../../global/counter';
import { VK_DEBUG } from '../../singleton/logger';
import { cstr, undoCstr } from '../../utils/buffer';
import { getEnv } from '../../utils/env';

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
    "VK_EXT_debug_utils"
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

export class VkDevice implements Disposable {
  private static __instance: Pointer | null = null;

  private static __createInstance() {
    if (VkDevice.__instance) return;

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
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    VkDevice.__instance = Number(pointerHolder[0]!) as Pointer;
  }

  private static __destroyInstance() {
    if (!VkDevice.__instance) return;

    VK.vkDestroyInstance(VkDevice.__instance, null);
    VK_DEBUG('Destroyed Vulkan instance');
    VkDevice.__instance = null;
  }

  // MARK: Instance Properties

  private __nativeWindow: bigint;
  private __display: bigint;
  private __surface: bigint = 0n;
  private __logicalDevice: Pointer | null = null;

  private __familyQueue: Pointer | null = null;

  private __physicalDevice: Pointer | null = null;
  private __physicalDeviceProperties: PhysicalDeviceProps | null = null;

  constructor(nativeWindow: bigint, display: bigint) {
    this.__nativeWindow = nativeWindow;
    this.__display = display;

    VkDevice.__createInstance();
    this.__createSurface();
    this.__pickPhysicalDevice();
    this.__createLogicalDevice();

    increaseCounter('VkDevice');
  }

  get physicalDevice() {
    return this.__physicalDevice!;
  }

  get physicalDeviceProperties() {
    return this.__physicalDeviceProperties!;
  }

  get logicalDevice() {
    return this.__logicalDevice!;
  }

  get surface() {
    return this.__surface!;
  }

  get familyQueue() {
    return this.__familyQueue!;
  }

  dispose() {
    decreaseCounter('VkDevice');
    if (this.__logicalDevice) {
      VK.vkDestroyDevice(this.__logicalDevice, null);
      VK_DEBUG('Logical device destroyed');
      this.__logicalDevice = null;
    }
    if (this.__surface) {
      VK.vkDestroySurfaceKHR(VkDevice.__instance!, this.__surface, null);
      this.__surface = 0n;
      VK_DEBUG(`Destroyed VkSurfaceKHR for VkDevice`);
    }

    if (!getCounter('VkDevice')) {
      VK_DEBUG(`No more VkDevice instances, cleaning up Vulkan instance`);
      VkDevice.__destroyInstance();
    }
  }

  findQueueFamily(device?: Pointer) {
    const d = device ?? this.__physicalDevice!;

    let graphicsFamilyHasValue = false;
    let presentFamilyHasValue = false;
    let computeFamilyHasValue = false;
    let transferFamilyHasValue = false;
    let family = -1;

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
          graphicsFamilyHasValue = true;
        }
        if (queueFamily.queueFlags & VkQueueFlagBits.COMPUTE_BIT) {
          VK_DEBUG(`Found compute queue family at index ${i}`);
          computeFamilyHasValue = true;
        }
        if (queueFamily.queueFlags & VkQueueFlagBits.TRANSFER_BIT) {
          VK_DEBUG(`Found transfer queue family at index ${i}`);
          transferFamilyHasValue = true;
        }
      }
      const presentSupport = new Uint32Array(1);
      const result = VK.vkGetPhysicalDeviceSurfaceSupportKHR(
        d,
        i,
        this.__surface!,
        ptr(presentSupport),
      );
      if (result !== VkResult.SUCCESS) {
        throw new DynamicLibError(getResultMessage(result), 'Vulkan');
      }

      if (queueFamily.queueCount > 0 && presentSupport[0]) {
        VK_DEBUG(`Found present queue family at index ${i}`);
        presentFamilyHasValue = true;
      }
      if (
        graphicsFamilyHasValue &&
        presentFamilyHasValue &&
        computeFamilyHasValue &&
        transferFamilyHasValue
      ) {
        family = i;
        break;
      }

      graphicsFamilyHasValue = false;
      presentFamilyHasValue = false;
      computeFamilyHasValue = false;
      transferFamilyHasValue = false;
    }

    return family;
  }

  getSwapChainSupport() {
    return this.__getSwapChainSupport(this.__physicalDevice!);
  }

  private __createSurface() {
    if (!VkDevice.__instance) return;

    const surfacePtr = new BigUint64Array(1);
    let result: number;

    if (process.platform === 'win32') {
      const createInfo = instantiate(vkWin32SurfaceCreateInfoKHR);
      createInfo.hinstance = this.__display;
      createInfo.hwnd = this.__nativeWindow;

      result = VK.vkCreateWin32SurfaceKHR(
        VkDevice.__instance,
        ptr(getInstanceBuffer(createInfo)),
        null,
        ptr(surfacePtr),
      );
    } else if (process.platform === 'linux') {
      if (isWayland()) {
        const createInfo = instantiate(vkWaylandSurfaceCreateInfoKHR);
        createInfo.display = this.__display;
        createInfo.surface = this.__nativeWindow;

        result = VK.vkCreateWaylandSurfaceKHR(
          VkDevice.__instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(surfacePtr),
        );
      } else {
        const createInfo = instantiate(vkXlibSurfaceCreateInfoKHR);
        createInfo.dpy = this.__display;
        createInfo.window = this.__nativeWindow;

        result = VK.vkCreateXlibSurfaceKHR(
          VkDevice.__instance,
          ptr(getInstanceBuffer(createInfo)),
          null,
          ptr(surfacePtr),
        );
      }
    } else if (process.platform === 'darwin') {
      const createInfo = instantiate(vkMetalSurfaceCreateInfoEXT);
      createInfo.pLayer = this.__nativeWindow;

      result = VK.vkCreateMetalSurfaceEXT(
        VkDevice.__instance,
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
    this.__surface = surfacePtr[0]!;
  }

  private __pickPhysicalDevice() {
    if (!VkDevice.__instance) return;

    const count = new Uint32Array(1);
    VK.vkEnumeratePhysicalDevices(VkDevice.__instance, ptr(count), null);

    if (!count[0]) {
      throw new DynamicLibError(
        'Failed to find GPUs with Vulkan support',
        'Vulkan',
      );
    }
    VK_DEBUG(`Device count: ${count[0]!}`);
    const devices = new BigUint64Array(count[0]!);
    const result = VK.vkEnumeratePhysicalDevices(
      VkDevice.__instance,
      ptr(count),
      ptr(devices),
    );
    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }

    const usableDevices: Pointer[] = [];

    for (let i = 0; i < count[0]!; i++) {
      const device = Number(devices[i]) as Pointer;
      VK_DEBUG(`Found device handle: ${device}`);
      if (this.__isDeviceSuitable(device)) {
        usableDevices.push(device);
      }
    }

    if (usableDevices.length === 0) {
      throw new DynamicLibError('Failed to find a suitable GPU!', 'Vulkan');
    }

    if (usableDevices.length === 1) {
      VK_DEBUG('Only one suitable GPU found, selecting it by default.');
      this.__physicalDevice = usableDevices[0]!;
      this.__physicalDeviceProperties = this.__getDeviceProperties(
        this.__physicalDevice,
      );
      return;
    }

    const devicesProperties = usableDevices.map((device) =>
      this.__getDeviceProperties(device),
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
    this.__physicalDevice = usableDevices[bestDeviceIndex]!;
    this.__physicalDeviceProperties = devicesProperties[bestDeviceIndex]!;
  }

  private __createLogicalDevice() {
    if (!this.__surface || !this.__physicalDevice) return;
    const family = this.findQueueFamily(this.__physicalDevice);

    const priorities = new Float32Array([1.0]);
    const queueCreateInfo = instantiate(vkDeviceQueueCreateInfo);
    queueCreateInfo.queueFamilyIndex = family;
    queueCreateInfo.queueCount = 1;
    queueCreateInfo.pQueuePriorities = BigInt(ptr(priorities));

    const deviceFeatures = instantiate(vkPhysicalDeviceFeatures);
    deviceFeatures.samplerAnisotropy = VK_TRUE;

    // Keep extension name strings alive
    const extensionNames = VALIDATION_DEVICE_EXTENSIONS.map(cstr);
    const extensionNamePtrs = new BigUint64Array(
      extensionNames.map((name) => BigInt(ptr(name))),
    );

    const createInfo = instantiate(vkDeviceCreateInfo);
    createInfo.queueCreateInfoCount = 1;
    createInfo.pQueueCreateInfos = BigInt(
      ptr(getInstanceBuffer(queueCreateInfo)),
    );
    createInfo.pEnabledFeatures = BigInt(
      ptr(getInstanceBuffer(deviceFeatures)),
    );
    createInfo.enabledExtensionCount = VALIDATION_DEVICE_EXTENSIONS.length;
    createInfo.ppEnabledExtensionNames = BigInt(ptr(extensionNamePtrs));

    const pointerHolder = new BigUint64Array(1);
    const result = VK.vkCreateDevice(
      this.__physicalDevice,
      ptr(getInstanceBuffer(createInfo)),
      null,
      ptr(pointerHolder),
    );
    if (result !== VkResult.SUCCESS) {
      throw new DynamicLibError(getResultMessage(result), 'Vulkan');
    }
    this.__logicalDevice = Number(pointerHolder[0]!) as Pointer;
    VK_DEBUG(`Logical device created: 0x${this.__logicalDevice.toString(16)}`);

    pointerHolder[0] = 0n;
    VK.vkGetDeviceQueue(this.__logicalDevice, family, 0, ptr(pointerHolder));
    const queue = Number(pointerHolder[0]!) as Pointer;

    VK_DEBUG(`Family Queue: 0x${queue.toString(16)}`);
    this.__familyQueue = queue;
  }

  private __isDeviceSuitable(device: Pointer): boolean {
    if (!this.__surface) return false;
    const family = this.findQueueFamily(device);

    if (family < 0) return false;

    const extensionsSupported = this.__isDeviceExtensionSupported(device);
    if (!extensionsSupported) return false;

    const details = this.__getSwapChainSupport(device);
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

  private __isDeviceExtensionSupported(device: Pointer) {
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

  private __getDeviceProperties(device: Pointer) {
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

  private __getSwapChainSupport(device: Pointer) {
    const capabilities = instantiate(vkSurfaceCapabilitiesKHR);
    VK.vkGetPhysicalDeviceSurfaceCapabilitiesKHR(
      device,
      this.__surface!,
      ptr(getInstanceBuffer(capabilities)),
    );

    const count = new Uint32Array(1);
    VK.vkGetPhysicalDeviceSurfaceFormatsKHR(
      device,
      this.__surface!,
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
      this.__surface!,
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
      this.__surface!,
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
      this.__surface!,
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
