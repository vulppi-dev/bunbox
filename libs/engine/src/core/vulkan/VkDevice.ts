import { ptr, type Pointer } from 'bun:ffi';
import { VK, vkLayerProperties } from '@bunbox/vk';
import { instantiate, sizeOf, type InferField } from '@bunbox/struct';
import { undoCstr } from '../../utils/buffer';
import { VK_DEBUG } from '../../singleton/logger';

export class VkDevice {
  #window: bigint;

  constructor(window: bigint) {
    this.#window = window;

    this.#createInstance();
    this.#setupDebugMessenger();
    this.#createSurface();
    this.#pickPhysicalDevice();
    this.#createLogicalDevice();
    this.#createCommandPool();
  }

  dispose() {}

  #createInstance() {}

  #setupDebugMessenger() {}

  #createSurface() {}

  #pickPhysicalDevice() {}

  #createLogicalDevice() {}

  #createCommandPool() {}

  #getRequiredExtensions() {}

  #isLayerSupportValid() {
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

    return names.includes('VK_LAYER_KHRONOS_validation');
  }
}
