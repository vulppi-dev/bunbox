import { VkResult, VkResult11, VkResult12, VkResult13 } from './enums';

/**
 * Make a Vulkan version number from major, minor, and patch version
 *
 * @param major - Major version number
 * @param minor - Minor version number
 * @param patch - Patch version number
 * @returns Vulkan version number as uint32
 */
export function makeVersion(
  major: number,
  minor: number,
  patch: number,
): number {
  return (major << 22) | (minor << 12) | patch;
}

/**
 * Extract the major version from a Vulkan version number
 *
 * @param version - Vulkan version number
 * @returns Major version number
 */
export function versionMajor(version: number): number {
  return version >>> 22;
}

/**
 * Extract the minor version from a Vulkan version number
 *
 * @param version - Vulkan version number
 * @returns Minor version number
 */
export function versionMinor(version: number): number {
  return (version >>> 12) & 0x3ff;
}

/**
 * Extract the patch version from a Vulkan version number
 *
 * @param version - Vulkan version number
 * @returns Patch version number
 */
export function versionPatch(version: number): number {
  return version & 0xfff;
}

/**
 * Convert a Vulkan version number to a string
 *
 * @param version - Vulkan version number
 * @returns Version string in format "major.minor.patch"
 */
export function versionToString(version: number): string {
  return `${versionMajor(version)}.${versionMinor(version)}.${versionPatch(version)}`;
}

/**
 * Common Vulkan API versions
 */
export const VK_API_VERSION_1_0 = makeVersion(1, 0, 0);
export const VK_API_VERSION_1_1 = makeVersion(1, 1, 0);
export const VK_API_VERSION_1_2 = makeVersion(1, 2, 0);
export const VK_API_VERSION_1_3 = makeVersion(1, 3, 0);

/**
 * Special constant values
 */
export const VK_TRUE = 1;
export const VK_FALSE = 0;
export const VK_NULL_HANDLE = 0n;
export const VK_WHOLE_SIZE = 0xffffffffffffffffn;
export const VK_ATTACHMENT_UNUSED = 0xffffffff;
export const VK_QUEUE_FAMILY_IGNORED = 0xffffffff;
export const VK_SUBPASS_EXTERNAL = 0xffffffff;
export const VK_REMAINING_MIP_LEVELS = 0xffffffff;
export const VK_REMAINING_ARRAY_LAYERS = 0xffffffff;

/**
 * Get error message for a VkResult
 *
 * @param result - VkResult value
 * @returns Error message string
 */
export function getResultMessage(result: number): string {
  // VkResult & VkResult11 & VkResult12 & VkResult13
  const messages: Record<number, string> = {
    // VkResult (Vulkan 1.0)
    [VkResult.SUCCESS]: 'Command successfully completed',
    [VkResult.NOT_READY]: 'A fence or query has not yet completed',
    [VkResult.TIMEOUT]:
      'A wait operation has not completed in the specified time',
    [VkResult.EVENT_SET]: 'An event is signaled',
    [VkResult.EVENT_RESET]: 'An event is unsignaled',
    [VkResult.INCOMPLETE]: 'A return array was too small for the result',
    [VkResult.ERROR_OUT_OF_HOST_MEMORY]: 'A host memory allocation has failed',
    [VkResult.ERROR_OUT_OF_DEVICE_MEMORY]:
      'A device memory allocation has failed',
    [VkResult.ERROR_INITIALIZATION_FAILED]:
      'Initialization of an object could not be completed',
    [VkResult.ERROR_DEVICE_LOST]:
      'The logical or physical device has been lost',
    [VkResult.ERROR_MEMORY_MAP_FAILED]: 'Mapping of a memory object has failed',
    [VkResult.ERROR_LAYER_NOT_PRESENT]:
      'A requested layer is not present or could not be loaded',
    [VkResult.ERROR_EXTENSION_NOT_PRESENT]:
      'A requested extension is not supported',
    [VkResult.ERROR_FEATURE_NOT_PRESENT]:
      'A requested feature is not supported',
    [VkResult.ERROR_INCOMPATIBLE_DRIVER]:
      'The requested version of Vulkan is not supported by the driver',
    [VkResult.ERROR_TOO_MANY_OBJECTS]:
      'Too many objects of the type have already been created',
    [VkResult.ERROR_FORMAT_NOT_SUPPORTED]:
      'A requested format is not supported on this device',
    [VkResult.ERROR_FRAGMENTED_POOL]:
      'A pool allocation has failed due to fragmentation',
    [VkResult.ERROR_UNKNOWN]: 'An unknown error has occurred',

    // VkResult11 (Vulkan 1.1)
    [VkResult11.ERROR_OUT_OF_POOL_MEMORY]:
      'A pool memory allocation has failed',
    [VkResult11.ERROR_INVALID_EXTERNAL_HANDLE]:
      'An external handle is not a valid handle',

    // VkResult12 (Vulkan 1.2)
    [VkResult12.ERROR_FRAGMENTATION]:
      'A descriptor pool creation has failed due to fragmentation',
    [VkResult12.ERROR_INVALID_OPAQUE_CAPTURE_ADDRESS]:
      'A buffer creation or memory allocation failed because the requested address is not available',

    // VkResult13 (Vulkan 1.3)
    [VkResult13.PIPELINE_COMPILE_REQUIRED]:
      'A requested pipeline creation would have required compilation, but the application requested compilation not be performed',
  };
  return messages[result] || `Unknown Result: ${result}`;
}
