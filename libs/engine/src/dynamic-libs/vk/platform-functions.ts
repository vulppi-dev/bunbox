import type { FFIFunction } from 'bun:ffi';

export const WINDOWS_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for a Win32 window.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateWin32SurfaceKHR.html
   */
  vkCreateWin32SurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query whether a queue family supports presentation on a Win32 display.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceWin32PresentationSupportKHR.html
   */
  vkGetPhysicalDeviceWin32PresentationSupportKHR: {
    args: ['ptr', 'u32'] as [physicalDevice: 'ptr', queueFamilyIndex: 'u32'],
    returns: 'u32',
  },
} as const satisfies Record<string, FFIFunction>;

export const LINUX_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for an X11 window, using the Xlib client-side library.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateXlibSurfaceKHR.html
   */
  vkCreateXlibSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to X11 server using Xlib.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceXlibPresentationSupportKHR.html
   */
  vkGetPhysicalDeviceXlibPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr', 'u64'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      display: 'ptr',
      visualID: 'u64',
    ],
    returns: 'u32',
  },
  /**
   * Create a VkSurfaceKHR object for an X11 window, using the XCB client-side library.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateXcbSurfaceKHR.html
   */
  vkCreateXcbSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to X11 server using XCB.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceXcbPresentationSupportKHR.html
   */
  vkGetPhysicalDeviceXcbPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr', 'u32'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      connection: 'ptr',
      visualId: 'u32',
    ],
    returns: 'u32',
  },
  /**
   * Create a VkSurfaceKHR object for a Wayland window.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateWaylandSurfaceKHR.html
   */
  vkCreateWaylandSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to Wayland.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkGetPhysicalDeviceWaylandPresentationSupportKHR.html
   */
  vkGetPhysicalDeviceWaylandPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      display: 'ptr',
    ],
    returns: 'u32',
  },
} as const satisfies Record<string, FFIFunction>;

export const DARWIN_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for a macOS NSView.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateMacOSSurfaceMVK.html
   */
  vkCreateMacOSSurfaceMVK: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Create a VkSurfaceKHR object for CAMetalLayer.
   *
   * @see https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/vkCreateMetalSurfaceEXT.html
   */
  vkCreateMetalSurfaceEXT: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      createInfo: 'ptr',
      allocationCallbacks: 'ptr',
      surface: 'ptr',
    ],
    returns: 'i32',
  },
} as const satisfies Record<string, FFIFunction>;
