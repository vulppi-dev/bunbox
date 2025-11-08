import { CString, JSCallback, ptr, type Pointer } from 'bun:ffi';
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
  VkResult,
  VkStructureType,
} from '@bunbox/vk';
import {
  getInstanceBuffer,
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

const VALIDATION_LAYERS = ['VK_LAYER_KHRONOS_validation'];

export class VkDevice {
  static #instance: Pointer | null = null;

  static #errorCallback: JSCallback | null = null;

  static #createInstance() {
    if (VkDevice.#instance) return;

    if (VK_DEBUG.enabled && !this.#isLayerSupportValid()) {
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
  }

  static #getRequiredExtensions() {
    const count = new Uint32Array(1);
    const extPtr = GLFW.glfwGetRequiredInstanceExtensions(ptr(count));

    if (!extPtr || count[0]! === 0) {
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

  static #getDebugMessenger() {
    const debugCreateInfo = instantiate(vkDebugUtilsMessengerCreateInfoEXT);
    debugCreateInfo.sType =
      VkStructureType.DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
    debugCreateInfo.messageSeverity =
      VkDebugUtilsMessageSeverityFlagsEXT.VERBOSE;
    debugCreateInfo.messageType = VkDebugUtilsMessageTypeFlagsEXT.VALIDATION;

    if (!VkDevice.#errorCallback) {
      const dataStruct = instantiate(vkDebugUtilsMessengerCallbackDataEXT);
      VkDevice.#errorCallback = buildCallback(
        vkDebugUtilsMessengerCallback,
        (severity, types, data, _userData) => {
          pointerCopyBuffer(data as Pointer, getInstanceBuffer(dataStruct));

          VK_DEBUG(
            'Vulkan Debug Message:',
            `Severity: ${severity}, Types: ${types}, Message: ${dataStruct.pMessage} `,
          );

          return 0;
        },
      );
    }

    debugCreateInfo.pfnUserCallback = BigInt(VkDevice.#errorCallback!.ptr ?? 0);
    return debugCreateInfo;
  }

  #window: bigint;

  constructor(window: bigint) {
    this.#window = window;

    VkDevice.#createInstance();
    this.#setupDebugMessenger();
    this.#createSurface();
    this.#pickPhysicalDevice();
    this.#createLogicalDevice();
    this.#createCommandPool();
  }

  dispose() {}

  #setupDebugMessenger() {}

  #createSurface() {}

  #pickPhysicalDevice() {}

  #createLogicalDevice() {}

  #createCommandPool() {}
}
