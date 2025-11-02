import { ptr, type Pointer } from 'bun:ffi';
import { Vk_PresentModeKHR, Vk_QueueFlagBits, Vk_Result } from './enums';
import {
  VK,
  VkQueueFamilyProperties,
  VkQueueFamilyProperties2,
  VkSurfaceCapabilitiesKHR,
  VkSurfaceFormatKHR,
} from './loader';
import { DynamicLibError } from '../../errors';
import { VK_DEBUG } from '../../singleton/logger';
import {
  bufferToPointerList,
  pointerCopyBuffer,
  pointerToBuffer,
} from '../../utils/buffer';
import {
  getInstanceBuffer,
  instantiate,
  instanceToJSON,
  sizeOf,
} from '@bunbox/struct';
import { GLFW, GLFW_GeneralMacro } from '../glfw';

export function getVkErrorDescription(errorCode: Vk_Result): string {
  switch (errorCode) {
    case Vk_Result.SUCCESS:
      return 'Command successfully completed';
    case Vk_Result.NOT_READY:
      return 'A fence or query has not yet completed';
    case Vk_Result.TIMEOUT:
      return 'A wait operation has not completed in the specified time';
    case Vk_Result.EVENT_SET:
      return 'An event is signaled';
    case Vk_Result.EVENT_RESET:
      return 'An event is unsignaled';
    case Vk_Result.INCOMPLETE:
      return 'A return array was too small for the result';
    case Vk_Result.ERROR_OUT_OF_HOST_MEMORY:
      return 'A host memory allocation has failed';
    case Vk_Result.ERROR_OUT_OF_DEVICE_MEMORY:
      return 'A device memory allocation has failed';
    case Vk_Result.ERROR_INITIALIZATION_FAILED:
      return 'Initialization of an object could not be completed for implementation-specific reasons';
    case Vk_Result.ERROR_DEVICE_LOST:
      return 'The logical or physical device has been lost';
    case Vk_Result.ERROR_MEMORY_MAP_FAILED:
      return 'Mapping of a memory object has failed';
    case Vk_Result.ERROR_LAYER_NOT_PRESENT:
      return 'A requested layer is not present or could not be loaded';
    case Vk_Result.ERROR_EXTENSION_NOT_PRESENT:
      return 'A requested extension is not supported';
    case Vk_Result.ERROR_FEATURE_NOT_PRESENT:
      return 'A requested feature is not supported';
    case Vk_Result.ERROR_INCOMPATIBLE_DRIVER:
      return 'The requested version of Vulkan is not supported by the driver or is otherwise incompatible';
    case Vk_Result.ERROR_TOO_MANY_OBJECTS:
      return 'Too many objects of the type have already been created';
    case Vk_Result.ERROR_FORMAT_NOT_SUPPORTED:
      return 'A requested format is not supported on this device';
    case Vk_Result.ERROR_FRAGMENTED_POOL:
      return "A pool allocation has failed due to fragmentation of the pool's memory";
    case Vk_Result.ERROR_SURFACE_LOST_KHR:
      return 'A surface is no longer available';
    case Vk_Result.ERROR_NATIVE_WINDOW_IN_USE_KHR:
      return 'The requested window is already connected to a VkSurfaceKHR, or to some other non-Vulkan API';
    case Vk_Result.SUBOPTIMAL_KHR:
      return 'A swapchain no longer matches the surface properties exactly, but can still be used to present to the surface successfully';
    case Vk_Result.ERROR_OUT_OF_DATE_KHR:
      return 'A surface has changed in such a way that it is no longer compatible with the swapchain';
    case Vk_Result.ERROR_INCOMPATIBLE_DISPLAY_KHR:
      return 'The display used by a swapchain does not use the same presentable image layout';
    case Vk_Result.ERROR_VALIDATION_FAILED_EXT:
      return 'A validation layer found an error';
    case Vk_Result.ERROR_INVALID_SHADER_NV:
      return 'One or more shaders failed to compile or link';
    case Vk_Result.ERROR_COMPRESSION_EXHAUSTED_EXT:
      return 'A compression operation has exhausted all available output space';
    case Vk_Result.ERROR_FRAGMENTATION:
      return "A pool allocation has failed due to fragmentation of the pool's memory";
    case Vk_Result.ERROR_INVALID_EXTERNAL_HANDLE:
      return 'An external handle is not a valid handle of the specified type';
    case Vk_Result.ERROR_INVALID_OPAQUE_CAPTURE_ADDRESS:
      return 'A buffer creation or memory allocation failed because the requested address is not available';
    case Vk_Result.ERROR_OUT_OF_POOL_MEMORY:
      return 'A pool memory allocation has failed';
    case Vk_Result.PIPELINE_COMPILE_REQUIRED:
      return 'A requested pipeline creation would have required compilation, but the application requested compilation to not be performed';
    case Vk_Result.ERROR_UNKNOWN:
    default:
      return `Unknown Vulkan error code: ${errorCode}`;
  }
}

export function vkMakeVersion(
  major: number,
  minor: number,
  patch: number,
): number {
  return (major << 22) | (minor << 12) | patch;
}

export function decodeVkVersion(version: number): {
  major: number;
  minor: number;
  patch: number;
} {
  const major = (version >> 22) & 0x3ff;
  const minor = (version >> 12) & 0x3ff;
  const patch = version & 0xfff;
  return { major, minor, patch };
}

const POOL_DEFAULT_SIZE = 32;

export function vkGetPhysicalDevice(instance: Pointer): Pointer | null {
  const poolAux = new BigUint64Array(POOL_DEFAULT_SIZE);
  const countAux = new Uint32Array(1);

  countAux[0] = POOL_DEFAULT_SIZE;
  const result = VK.vkEnumeratePhysicalDevices(
    instance,
    ptr(countAux),
    ptr(poolAux),
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(getVkErrorDescription(result), 'Vulkan');
  }
  if (countAux[0] === 0) {
    throw new DynamicLibError('No Vulkan physical devices found', 'Vulkan');
  }

  VK_DEBUG(`Found ${countAux[0]} Vulkan physical devices`);

  const devices = bufferToPointerList(poolAux, countAux[0]!);
  const familyPropsSize = sizeOf(VkQueueFamilyProperties2);
  const poolAux2 = new Uint8Array(POOL_DEFAULT_SIZE * familyPropsSize);

  if (devices.length === 1) {
    return devices[0]!;
  }

  for (const pd of devices) {
    poolAux2.fill(0);
    countAux[0] = POOL_DEFAULT_SIZE;

    VK.vkGetPhysicalDeviceQueueFamilyProperties2(
      pd,
      ptr(countAux),
      ptr(poolAux2),
    );
    if (countAux[0] === 0) continue;

    for (let i = 0; i < countAux[0]; i++) {
      const queueFamily = instantiate(VkQueueFamilyProperties2);
      new Uint8Array(getInstanceBuffer(queueFamily)).set(
        poolAux2,
        i * familyPropsSize,
      );

      const hasGraphics =
        (Vk_QueueFlagBits.GRAPHICS_BIT &
          queueFamily.queueFamilyProperties.queueFlags) !==
        0;
      const canPresent = (() => {
        switch (process.platform) {
          case 'win32':
            return (
              VK.vkGetPhysicalDeviceWin32PresentationSupportKHR(pd, i) === 1
            );
          case 'linux':
            const isWayland =
              GLFW_GeneralMacro.PLATFORM_WAYLAND === GLFW.glfwGetPlatform();
            const display = isWayland
              ? GLFW.glfwGetWaylandDisplay()
              : GLFW.glfwGetX11Display();

            if (!display) {
              throw new DynamicLibError('Failed to get Linux display', 'GLFW');
            }
            return (
              VK.vkGetPhysicalDeviceXlibPresentationSupportKHR(
                pd,
                i,
                display,
                0,
              ) === 1
            );
          case 'darwin':
            return true;
          default:
            return false;
        }
      })();

      if (hasGraphics && canPresent) {
        return pd;
      }
    }
  }

  return null;
}

/**
 * Query surface capabilities for a physical device and surface.
 *
 * @param physicalDevice - The physical device to query
 * @param surface - The surface to query capabilities for
 * @returns The surface capabilities
 */
export function vkGetSurfaceCapabilities(
  physicalDevice: Pointer,
  surface: Pointer,
): any {
  const capabilities = instantiate(VkSurfaceCapabilitiesKHR);

  const result = VK.vkGetPhysicalDeviceSurfaceCapabilitiesKHR(
    physicalDevice,
    surface,
    ptr(getInstanceBuffer(capabilities)),
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(
      `Failed to get surface capabilities. VkResult: ${result}`,
      'Vulkan',
    );
  }

  VK_DEBUG(
    `Surface capabilities: ${JSON.stringify(instanceToJSON(capabilities))}`,
  );

  return capabilities;
}

/**
 * Query available surface formats for a physical device and surface.
 *
 * @param physicalDevice - The physical device to query
 * @param surface - The surface to query formats for
 * @returns Array of surface formats
 */
export function vkGetSurfaceFormats(
  physicalDevice: Pointer,
  surface: Pointer,
): any[] {
  const countAux = new Uint32Array(1);

  // First call: get the count
  let result = VK.vkGetPhysicalDeviceSurfaceFormatsKHR(
    physicalDevice,
    surface,
    ptr(countAux),
    null,
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(
      `Failed to get surface format count. VkResult: ${result}`,
      'Vulkan',
    );
  }

  const formatCount = countAux[0];
  if (!formatCount) {
    throw new DynamicLibError('No surface formats available', 'Vulkan');
  }

  VK_DEBUG(`Found ${formatCount} surface formats`);

  // Allocate buffer for formats
  const formatSize = sizeOf(VkSurfaceFormatKHR);
  const formatsBuffer = new Uint8Array(formatCount * formatSize);

  // Second call: get the actual formats
  result = VK.vkGetPhysicalDeviceSurfaceFormatsKHR(
    physicalDevice,
    surface,
    ptr(countAux),
    ptr(formatsBuffer),
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(
      `Failed to get surface formats. VkResult: ${result}`,
      'Vulkan',
    );
  }

  // Parse formats from buffer
  const formats = [];
  for (let i = 0; i < formatCount; i++) {
    const formatInstance = instantiate(VkSurfaceFormatKHR);
    const formatOffset = i * formatSize;
    const formatSlice = formatsBuffer.slice(
      formatOffset,
      formatOffset + formatSize,
    );
    new Uint8Array(getInstanceBuffer(formatInstance)).set(formatSlice);
    formats.push(formatInstance);
  }

  VK_DEBUG(
    `Surface formats: ${formats.map((f) => JSON.stringify(instanceToJSON(f))).join(', ')}`,
  );

  return formats;
}

/**
 * Query and select the best present mode for a physical device and surface.
 * Preference order: FIFO, MAILBOX, IMMEDIATE, FIFO_RELAXED.
 * FIFO is guaranteed to be available by Vulkan spec.
 *
 * @param physicalDevice - The physical device to query
 * @param surface - The surface to query present modes for
 * @returns The selected present mode
 */
export function vkSelectPresentMode(
  physicalDevice: Pointer,
  surface: Pointer,
): number {
  const countAux = new Uint32Array(1);

  // First call: get the count
  let result = VK.vkGetPhysicalDeviceSurfacePresentModesKHR(
    physicalDevice,
    surface,
    ptr(countAux),
    null,
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(
      `Failed to get present mode count. VkResult: ${result}`,
      'Vulkan',
    );
  }

  const modeCount = countAux[0];
  if (!modeCount) {
    throw new DynamicLibError('No present modes available', 'Vulkan');
  }

  VK_DEBUG(`Found ${modeCount} present modes`);

  // Allocate buffer for present modes (u32 array)
  const modesBuffer = new Uint32Array(modeCount);

  // Second call: get the actual present modes
  result = VK.vkGetPhysicalDeviceSurfacePresentModesKHR(
    physicalDevice,
    surface,
    ptr(countAux),
    ptr(modesBuffer),
  );

  if (result !== Vk_Result.SUCCESS) {
    throw new DynamicLibError(
      `Failed to get present modes. VkResult: ${result}`,
      'Vulkan',
    );
  }

  const availableModes = Array.from(modesBuffer);
  VK_DEBUG(`Available present modes: ${availableModes.join(', ')}`);

  // Select present mode with preference order: FIFO, MAILBOX, IMMEDIATE, FIFO_RELAXED
  // FIFO is guaranteed to be available by Vulkan spec
  const preferenceOrder = [
    Vk_PresentModeKHR.FIFO_KHR,
    Vk_PresentModeKHR.MAILBOX_KHR,
    Vk_PresentModeKHR.IMMEDIATE_KHR,
    Vk_PresentModeKHR.FIFO_RELAXED_KHR,
  ];

  for (const preferredMode of preferenceOrder) {
    if (availableModes.includes(preferredMode)) {
      VK_DEBUG(`Selected present mode: ${preferredMode}`);
      return preferredMode;
    }
  }

  // Fallback to first available (should never happen as FIFO is required)
  const fallbackMode = availableModes[0]!;
  VK_DEBUG(`Fallback to present mode: ${fallbackMode}`);
  return fallbackMode;
}
