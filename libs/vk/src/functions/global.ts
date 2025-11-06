import type { FFIFunction } from 'bun:ffi';

// MARK: Global Level Functions

/**
 * Return a function pointer for a command
 *
 * C ref: `PFN_vkVoidFunction vkGetInstanceProcAddr(
 *   VkInstance instance,
 *   const char* pName)`
 */
export const vkGetInstanceProcAddr = {
  args: ['ptr', 'cstring'] as [instance: 'ptr', pName: 'cstring'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Query instance-level version before instance creation
 *
 * C ref: `VkResult vkEnumerateInstanceVersion(
 *   uint32_t* pApiVersion)`
 */
export const vkEnumerateInstanceVersion = {
  args: ['ptr'] as [pApiVersion: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of global layer properties
 *
 * C ref: `VkResult vkEnumerateInstanceLayerProperties(
 *   uint32_t* pPropertyCount,
 *   VkLayerProperties* pProperties)`
 */
export const vkEnumerateInstanceLayerProperties = {
  args: ['ptr', 'ptr'] as [pPropertyCount: 'ptr', pProperties: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns up to requested number of global extension properties
 *
 * C ref: `VkResult vkEnumerateInstanceExtensionProperties(
 *   const char* pLayerName,
 *   uint32_t* pPropertyCount,
 *   VkExtensionProperties* pProperties)`
 */
export const vkEnumerateInstanceExtensionProperties = {
  args: ['cstring', 'ptr', 'ptr'] as [
    pLayerName: 'cstring',
    pPropertyCount: 'ptr',
    pProperties: 'ptr',
  ],
  returns: 'i32',
} as const satisfies FFIFunction;
