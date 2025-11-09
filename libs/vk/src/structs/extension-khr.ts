import { i32, ptrAny, struct, u32, u64 } from '@bunbox/struct';

// MARK: VK_KHR_win32_surface

export const vkWin32SurfaceCreateInfoKHR = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  hinstance: u64(),
  hwnd: u64(),
});

// MARK: VK_KHR_xlib_surface

export const vkXlibSurfaceCreateInfoKHR = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  dpy: u64(),
  window: u64(),
});

// MARK: VK_KHR_xcb_surface

export const vkXcbSurfaceCreateInfoKHR = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  connection: u64(),
  window: u32(),
});

// MARK: VK_KHR_wayland_surface

export const vkWaylandSurfaceCreateInfoKHR = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  display: u64(),
  surface: u64(),
});

// MARK: VK_EXT_metal_surface

export const vkMetalSurfaceCreateInfoEXT = struct({
  sType: i32(),
  pNext: ptrAny(),
  flags: u32(),
  pLayer: u64(),
});
