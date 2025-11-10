import { array, i32, ptrAny, struct, u32, u64 } from '@bunbox/struct';
import { VkStructureType } from '../enums';

// MARK: VK_KHR_surface

export const vkExtent2D = struct({
  width: u32(),
  height: u32(),
});

export const vkSurfaceCapabilitiesKHR = struct({
  minImageCount: u32(),
  maxImageCount: u32(),
  currentExtent: vkExtent2D,
  minImageExtent: vkExtent2D,
  maxImageExtent: vkExtent2D,
  maxImageArrayLayers: u32(),
  supportedTransforms: u32(),
  currentTransform: i32(),
  supportedCompositeAlpha: u32(),
  supportedUsageFlags: u32(),
});

export const vkSurfaceFormatKHR = struct({
  format: i32(),
  colorSpace: i32(),
});

// MARK: VK_KHR_swapchain

export const vkSwapchainCreateInfoKHR = struct({
  sType: i32(VkStructureType.SWAPCHAIN_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  surface: ptrAny(),
  minImageCount: u32(),
  imageFormat: i32(),
  imageColorSpace: i32(),
  imageExtent: vkExtent2D,
  imageArrayLayers: u32(),
  imageUsage: u32(),
  imageSharingMode: i32(),
  queueFamilyIndexCount: u32(),
  pQueueFamilyIndices: ptrAny(),
  preTransform: i32(),
  compositeAlpha: i32(),
  presentMode: i32(),
  clipped: u32(),
  oldSwapchain: ptrAny(),
});

// MARK: VK_KHR_win32_surface

export const vkWin32SurfaceCreateInfoKHR = struct({
  sType: i32(VkStructureType.WIN32_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  hinstance: u64(),
  hwnd: u64(),
});

// MARK: VK_KHR_xlib_surface

export const vkXlibSurfaceCreateInfoKHR = struct({
  sType: i32(VkStructureType.XLIB_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  dpy: u64(),
  window: u64(),
});

// MARK: VK_KHR_xcb_surface

export const vkXcbSurfaceCreateInfoKHR = struct({
  sType: i32(VkStructureType.XCB_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  connection: u64(),
  window: u32(),
});

// MARK: VK_KHR_wayland_surface

export const vkWaylandSurfaceCreateInfoKHR = struct({
  sType: i32(VkStructureType.WAYLAND_SURFACE_CREATE_INFO_KHR),
  pNext: ptrAny(),
  flags: u32(),
  display: u64(),
  surface: u64(),
});

// MARK: VK_EXT_metal_surface

export const vkMetalSurfaceCreateInfoEXT = struct({
  sType: i32(VkStructureType.METAL_SURFACE_CREATE_INFO_EXT),
  pNext: ptrAny(),
  flags: u32(),
  pLayer: u64(),
});

// MARK: VK_KHR_present
export const vkPresentInfoKHR = struct({
  sType: i32(VkStructureType.PRESENT_INFO_KHR),
  pNext: ptrAny(),
  waitSemaphoreCount: u32(),
  pWaitSemaphores: ptrAny(),
  swapchainCount: u32(),
  pSwapchains: ptrAny(),
  pImageIndices: ptrAny(),
  pResults: ptrAny(),
});
