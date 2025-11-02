import type { FFIFunction } from 'bun:ffi';

// GLFW MARK: Init

/**
 * The function pointer type for error callbacks.
 *
 *  C ref: `typedef void(* GLFWerrorfun) (int error_code, const char *description)`
 */
export const glfwErrorCallback = {
  args: ['i32', 'cstring'] as [error_code: 'i32', description: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Context

/**
 * Client API function pointer type.
 *
 * C ref: `typedef void(* 	GLFWglproc) (void)`
 */
export const glfwGLProcCallback = {
  args: [] as [],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Window

/**
 * The function pointer type for window position callbacks.
 *
 * C ref: `typedef void(* GLFWwindowposfun) (GLFWwindow *window, int xpos, int ypos)`
 */
export const glfwWindowPositionCallback = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', xpos: 'i32', ypos: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window size callbacks.
 *
 * C ref: `typedef void(* GLFWwindowsizefun) (GLFWwindow *window, int width, int height)`
 */
export const glfwWindowSizeCallback = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', width: 'i32', height: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window close callbacks.
 *
 * C ref: `typedef void(* GLFWwindowclosefun) (GLFWwindow *window)`
 */
export const glfwWindowCloseCallback = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window content refresh callbacks.
 *
 * C ref: `typedef void(* GLFWwindowrefreshfun) (GLFWwindow *window)`
 */
export const glfwWindowRefreshCallback = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window focus callbacks.
 *
 * C ref: `typedef void(* GLFWwindowfocusfun) (GLFWwindow *window, int focused)`
 */
export const glfwWindowFocusCallback = {
  args: ['ptr', 'i32'] as [window: 'ptr', focused: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window iconify callbacks.
 *
 * C ref: `typedef void(* GLFWwindowiconifyfun) (GLFWwindow *window, int iconified)`
 */
export const glfwWindowIconifyCallback = {
  args: ['ptr', 'i32'] as [window: 'ptr', iconified: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window maximize callbacks.
 *
 * C ref: `typedef void(* GLFWwindowmaximizefun) (GLFWwindow *window, int maximized)`
 */
export const glfwWindowMaximizeCallback = {
  args: ['ptr', 'i32'] as [window: 'ptr', maximized: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for framebuffer size callbacks.
 *
 * C ref: `typedef void(* GLFWframebuffersizefun) (GLFWwindow *window, int width, int height)`
 */
export const glfwFrameBufferSizeCallback = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', width: 'i32', height: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for window content scale callbacks.
 *
 * C ref: `typedef void(* GLFWwindowcontentscalefun) (GLFWwindow *window, float xscale, float yscale)`
 */
export const glfwWindowContentScaleCallback = {
  args: ['ptr', 'f32', 'f32'] as [window: 'ptr', xscale: 'f32', yscale: 'f32'],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Monitor

/**
 * The function pointer type for monitor configuration callbacks.
 *
 * C ref: `typedef void(* GLFWmonitorfun) (GLFWmonitor *monitor, int event)`
 */
export const glfwMonitorCallback = {
  args: ['ptr', 'i32'] as [monitor: 'ptr', event: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Inputs

/**
 * The function pointer type for mouse button callbacks.
 *
 * C ref: `typedef void(* GLFWmousebuttonfun) (GLFWwindow *window, int button, int action, int mods)`
 */
export const glfwMouseButtonCallback = {
  args: ['ptr', 'i32', 'i32', 'i32'] as [
    window: 'ptr',
    button: 'i32',
    action: 'i32',
    mods: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for cursor position callbacks.
 *
 * C ref: `typedef void(* GLFWcursorposfun) (GLFWwindow *window, double xpos, double ypos)`
 */
export const glfwCursorPositionCallback = {
  args: ['ptr', 'f64', 'f64'] as [window: 'ptr', xpos: 'f64', ypos: 'f64'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for cursor enter/leave callbacks.
 *
 * C ref: `typedef void(* GLFWcursorenterfun) (GLFWwindow *window, int entered)`
 */
export const glfwCursorEnterCallback = {
  args: ['ptr', 'i32'] as [window: 'ptr', entered: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for scroll callbacks.
 *
 * C ref: `typedef void(* GLFWscrollfun) (GLFWwindow *window, double xoffset, double yoffset)`
 */
export const glfwScrollCallback = {
  args: ['ptr', 'f64', 'f64'] as [
    window: 'ptr',
    xoffset: 'f64',
    yoffset: 'f64',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for keyboard key callbacks.
 *
 * C ref: `typedef void(* GLFWkeyfun) (GLFWwindow *window, int key, int scancode, int action, int mods)`
 */
export const glfwKeyCallback = {
  args: ['ptr', 'i32', 'i32', 'i32', 'i32'] as [
    window: 'ptr',
    key: 'i32',
    scancode: 'i32',
    action: 'i32',
    mods: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for Unicode character callbacks.
 *
 * C ref: `typedef void(* GLFWcharfun) (GLFWwindow *window, unsigned int codepoint)`
 */
export const glfwCharCallback = {
  args: ['ptr', 'u32'] as [window: 'ptr', codepoint: 'u32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for Unicode character with modifiers callbacks.
 *
 * C ref: `typedef void(* GLFWcharmodsfun) (GLFWwindow *window, unsigned int codepoint, int mods)`
 */
export const glfwCharModsCallback = {
  args: ['ptr', 'u32', 'i32'] as [window: 'ptr', codepoint: 'u32', mods: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for path drop callbacks.
 *
 * C ref: `typedef void(* GLFWdropfun) (GLFWwindow *window, int path_count, const char *paths[])`
 */
export const glfwDropCallback = {
  args: ['ptr', 'i32', 'ptr'] as [
    window: 'ptr',
    path_count: 'i32',
    paths: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * The function pointer type for joystick configuration callbacks.
 *
 * C ref: `typedef void(* GLFWjoystickfun) (int jid, int event)`
 */
export const glfwJoystickCallback = {
  args: ['i32', 'i32'] as [jid: 'i32', event: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Vulkan

/**
 * Vulkan API function pointer type.
 *
 * C ref: `typedef void(* 	GLFWvkproc) (void)`
 */
export const glfwVulkanProcCallback = {
  args: [] as [],
  returns: 'void',
} as const satisfies FFIFunction;
