import type { FFIFunction } from 'bun:ffi';

// MARK: Windows Platform Functions

export const WINDOWS_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for an Win32 native window
   *
   * C ref: `VkResult vkCreateWin32SurfaceKHR(
   *   VkInstance instance,
   *   const VkWin32SurfaceCreateInfoKHR* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateWin32SurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to Windows desktop
   *
   * C ref: `VkBool32 vkGetPhysicalDeviceWin32PresentationSupportKHR(
   *   VkPhysicalDevice physicalDevice,
   *   uint32_t queueFamilyIndex)`
   */
  vkGetPhysicalDeviceWin32PresentationSupportKHR: {
    args: ['ptr', 'u32'] as [physicalDevice: 'ptr', queueFamilyIndex: 'u32'],
    returns: 'i32',
  },
} as const satisfies Record<string, FFIFunction>;

// MARK: Linux Platform Functions (X11 and Wayland)

export const LINUX_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for an X11 window
   *
   * C ref: `VkResult vkCreateXlibSurfaceKHR(
   *   VkInstance instance,
   *   const VkXlibSurfaceCreateInfoKHR* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateXlibSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to X11 server using Xlib
   *
   * C ref: `VkBool32 vkGetPhysicalDeviceXlibPresentationSupportKHR(
   *   VkPhysicalDevice physicalDevice,
   *   uint32_t queueFamilyIndex,
   *   Display* dpy,
   *   VisualID visualID)`
   */
  vkGetPhysicalDeviceXlibPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr', 'u64'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      dpy: 'ptr',
      visualID: 'u64',
    ],
    returns: 'i32',
  },
  /**
   * Create a VkSurfaceKHR object for an X11 window using XCB
   *
   * C ref: `VkResult vkCreateXcbSurfaceKHR(
   *   VkInstance instance,
   *   const VkXcbSurfaceCreateInfoKHR* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateXcbSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to X11 server using XCB
   *
   * C ref: `VkBool32 vkGetPhysicalDeviceXcbPresentationSupportKHR(
   *   VkPhysicalDevice physicalDevice,
   *   uint32_t queueFamilyIndex,
   *   xcb_connection_t* connection,
   *   xcb_visualid_t visual_id)`
   */
  vkGetPhysicalDeviceXcbPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr', 'u32'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      connection: 'ptr',
      visual_id: 'u32',
    ],
    returns: 'i32',
  },
  /**
   * Create a VkSurfaceKHR object for a Wayland window
   *
   * C ref: `VkResult vkCreateWaylandSurfaceKHR(
   *   VkInstance instance,
   *   const VkWaylandSurfaceCreateInfoKHR* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateWaylandSurfaceKHR: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Query physical device for presentation to Wayland
   *
   * C ref: `VkBool32 vkGetPhysicalDeviceWaylandPresentationSupportKHR(
   *   VkPhysicalDevice physicalDevice,
   *   uint32_t queueFamilyIndex,
   *   struct wl_display* display)`
   */
  vkGetPhysicalDeviceWaylandPresentationSupportKHR: {
    args: ['ptr', 'u32', 'ptr'] as [
      physicalDevice: 'ptr',
      queueFamilyIndex: 'u32',
      display: 'ptr',
    ],
    returns: 'i32',
  },
} as const satisfies Record<string, FFIFunction>;

// MARK: macOS Platform Functions

export const DARWIN_FUNCTIONS = {
  /**
   * Create a VkSurfaceKHR object for a Metal layer
   *
   * C ref: `VkResult vkCreateMetalSurfaceEXT(
   *   VkInstance instance,
   *   const VkMetalSurfaceCreateInfoEXT* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateMetalSurfaceEXT: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
  /**
   * Create a VkSurfaceKHR object for CAMetalLayer (MoltenVK)
   *
   * C ref: `VkResult vkCreateMacOSSurfaceMVK(
   *   VkInstance instance,
   *   const VkMacOSSurfaceCreateInfoMVK* pCreateInfo,
   *   const VkAllocationCallbacks* pAllocator,
   *   VkSurfaceKHR* pSurface)`
   */
  vkCreateMacOSSurfaceMVK: {
    args: ['ptr', 'ptr', 'ptr', 'ptr'] as [
      instance: 'ptr',
      pCreateInfo: 'ptr',
      pAllocator: 'ptr',
      pSurface: 'ptr',
    ],
    returns: 'i32',
  },
} as const satisfies Record<string, FFIFunction>;
