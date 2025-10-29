import type { FFIFunction } from 'bun:ffi';

export const WINDOWS_FUNCTIONS = {
  /**
   * Returns the adapter device name of the specified monitor.
   *
   * C ref: `const char * glfwGetWin32Adapter (GLFWmonitor *monitor)`
   */
  glfwGetWin32Adapter: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'cstring',
  },
  /**
   * Returns the display device name of the specified monitor.
   *
   * C ref: `const char * glfwGetWin32Monitor (GLFWmonitor *monitor)`
   */
  glfwGetWin32Monitor: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'cstring',
  },
  /**
   * Returns the HWND of the specified window.
   *
   * C ref: `HWND glfwGetWin32Window (GLFWwindow *window)`
   */
  glfwGetWin32Window: {
    args: ['ptr'] as [window: 'ptr'],
    returns: 'ptr',
  },
} as const satisfies Record<string, FFIFunction>;

export const LINUX_FUNCTIONS = {
  /**
   * Returns the Display used by GLFW.
   *
   * C ref: `Display * glfwGetX11Display (void)`
   */
  glfwGetX11Display: {
    args: [],
    returns: 'ptr',
  },
  /**
   * Returns the RRCrtc of the specified monitor.
   *
   * C ref: `RRCrtc glfwGetX11Adapter (GLFWmonitor *monitor)`
   */
  glfwGetX11Adapter: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the RROutput of the specified monitor.
   *
   * C ref: `RROutput glfwGetX11Monitor (GLFWmonitor *monitor)`
   */
  glfwGetX11Monitor: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the Window of the specified window.
   *
   * C ref: `Window glfwGetX11Window (GLFWwindow *window)`
   */
  glfwGetX11Window: {
    args: ['ptr'] as [window: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the struct wl_display* used by GLFW.
   *
   * C ref: `struct wl_display * glfwGetWaylandDisplay (void)`
   */
  glfwGetWaylandDisplay: {
    args: [],
    returns: 'ptr',
  },
  /**
   * Returns the struct wl_output* of the specified monitor.
   *
   * C ref: `struct wl_output * glfwGetWaylandMonitor (GLFWmonitor *monitor)`
   */
  glfwGetWaylandMonitor: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the main struct wl_surface* of the specified window.
   *
   * C ref: `struct wl_surface * glfwGetWaylandWindow (GLFWwindow *window)`
   */
  glfwGetWaylandWindow: {
    args: ['ptr'] as [window: 'ptr'],
    returns: 'ptr',
  },
} as const satisfies Record<string, FFIFunction>;

export const DARWIN_FUNCTIONS = {
  /**
   * Returns the CGDirectDisplayID of the specified monitor.
   *
   * C ref: `CGDirectDisplayID glfwGetCocoaMonitor (GLFWmonitor *monitor)`
   */
  glfwGetCocoaMonitor: {
    args: ['ptr'] as [monitor: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the NSWindow of the specified window.
   *
   * C ref: `id glfwGetCocoaWindow (GLFWwindow *window)`
   */
  glfwGetCocoaWindow: {
    args: ['ptr'] as [window: 'ptr'],
    returns: 'ptr',
  },
  /**
   * Returns the NSView of the specified window.
   *
   * C ref: `id glfwGetCocoaView (GLFWwindow *window)`
   */
  glfwGetCocoaView: {
    args: ['ptr'] as [window: 'ptr'],
    returns: 'ptr',
  },
} as const satisfies Record<string, FFIFunction>;
