import type { FFIFunction } from 'bun:ffi';

// GLFW MARK: Init

/**
 * Initializes the GLFW library.
 *
 *  C ref: `int glfwInit (void)`
 */
export const glfwInit = {
  args: [],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Terminates the GLFW library.
 *
 * C ref: `void glfwTerminate (void)`
 */
export const glfwTerminate = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the specified init hint to the desired value.
 *
 * C ref: `void glfwInitHint (int hint, int value)`
 */
export const glfwInitHint = {
  args: ['i32', 'i32'] as [hint: 'i32', value: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the version of the GLFW library.
 *
 * C ref: `void glfwGetVersion (int *major, int *minor, int *rev)`
 */
export const glfwGetVersion = {
  args: ['ptr', 'ptr', 'ptr'] as [major: 'ptr', minor: 'ptr', rev: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns a string describing the compile-time configuration.
 *
 * C ref: `const char * glfwGetVersionString (void)`
 */
export const glfwGetVersionString = {
  args: [],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns and clears the last error for the calling thread.
 *
 * C ref: `int glfwGetError (const char **description)`
 */
export const glfwGetError = {
  args: ['ptr'] as [description: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the error callback.
 *
 * C ref: `GLFWerrorfun glfwSetErrorCallback (GLFWerrorfun callback)`
 */
export const glfwSetErrorCallback = {
  args: ['callback'] as [callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns the currently selected platform.
 *
 * C ref: `int glfwGetPlatform (void)`
 */
export const glfwGetPlatform = {
  args: [],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns whether the library includes support for the specified platform.
 *
 * C ref: `int glfwPlatformSupported (int platform)`
 */
export const glfwPlatformSupported = {
  args: ['i32'] as [platform: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

// GLFW MARK: Context

/**
 * This function makes the OpenGL or OpenGL ES context of the specified window current on the calling thread. It can also detach the current context from the calling thread without making a new one current by passing in NULL.
 *
 * C ref: `void glfwMakeContextCurrent (GLFWwindow * window)`
 */
export const glfwMakeContextCurrent = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * This function returns the window whose OpenGL or OpenGL ES context is current on the calling thread.
 *
 * C ref: `GLFWwindow * glfwGetCurrentContext (void)`
 */
export const glfwGetCurrentContext = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * This function sets the swap interval for the current OpenGL or OpenGL ES context, i.e. the number of screen updates to wait from the time glfwSwapBuffers was called before swapping the buffers and returning. This is sometimes called vertical synchronization, vertical retrace synchronization or just vsync.
 *
 * C ref: `void glfwSwapInterval (int interval)`
 */
export const glfwSwapInterval = {
  args: ['i32'] as [interval: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * This function returns whether the specified API extension is supported by the current OpenGL or OpenGL ES context. It searches both for client API extension and context creation API extensions.
 *
 * C ref: `int glfwExtensionSupported (const char *extension)`
 */
export const glfwExtensionSupported = {
  args: ['cstring'] as [extension: 'cstring'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * This function returns the address of the specified OpenGL or OpenGL ES core or extension function, if it is supported by the current context.
 *
 * C ref: `GLFWglproc glfwGetProcAddress (const char *procname)`
 */
export const glfwGetProcAddress = {
  args: ['cstring'] as [procname: 'cstring'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// GLFW MARK: Window

/**
 * Resets all window hints to their default values.
 *
 * C ref: `void glfwDefaultWindowHints (void)`
 */
export const glfwDefaultWindowHints = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the specified window hint to the desired value.
 *
 * C ref: `void glfwWindowHint (int hint, int value)`
 */
export const glfwWindowHint = {
  args: ['i32', 'i32'] as [hint: 'i32', value: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the specified window hint to the desired value.
 *
 * C ref: `void glfwWindowHintString (int hint, const char *value)`
 */
export const glfwWindowHintString = {
  args: ['i32', 'cstring'] as [hint: 'i32', value: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates a window and its associated context.
 *
 * C ref: `GLFWwindow * glfwCreateWindow (int width, int height, const char *title, GLFWmonitor *monitor, GLFWwindow *share)`
 */
export const glfwCreateWindow = {
  args: ['i32', 'i32', 'cstring', 'ptr', 'ptr'] as [
    width: 'i32',
    height: 'i32',
    title: 'cstring',
    monitor: 'ptr',
    share: 'ptr',
  ],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Destroys the specified window and its context.
 *
 * C ref: `void glfwDestroyWindow (GLFWwindow *window)`
 */
export const glfwDestroyWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Checks the close flag of the specified window.
 *
 * C ref: `int glfwWindowShouldClose (GLFWwindow *window)`
 */
export const glfwWindowShouldClose = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the close flag of the specified window.
 *
 * C ref: `void glfwSetWindowShouldClose (GLFWwindow *window, int value)`
 */
export const glfwSetWindowShouldClose = {
  args: ['ptr', 'i32'] as [window: 'ptr', value: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the title of the specified window.
 *
 * C ref: `const char * glfwGetWindowTitle (GLFWwindow *window)`
 */
export const glfwGetWindowTitle = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Sets the title of the specified window.
 *
 * C ref: `void glfwSetWindowTitle (GLFWwindow *window, const char *title)`
 */
export const glfwSetWindowTitle = {
  args: ['ptr', 'cstring'] as [window: 'ptr', title: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the icon for the specified window.
 *
 * C ref: `void glfwSetWindowIcon (GLFWwindow *window, int count, const GLFWimage *images)`
 */
export const glfwSetWindowIcon = {
  args: ['ptr', 'i32', 'ptr'] as [window: 'ptr', count: 'i32', images: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the position of the content area of the specified window.
 *
 * C ref: `void glfwGetWindowPos (GLFWwindow *window, int *xpos, int *ypos)`
 */
export const glfwGetWindowPos = {
  args: ['ptr', 'ptr', 'ptr'] as [window: 'ptr', xpos: 'ptr', ypos: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the position of the content area of the specified window.
 *
 * C ref: `void glfwSetWindowPos (GLFWwindow *window, int xpos, int ypos)`
 */
export const glfwSetWindowPos = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', xpos: 'i32', ypos: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the size of the content area of the specified window.
 *
 * C ref: `void glfwGetWindowSize (GLFWwindow *window, int *width, int *height)`
 */
export const glfwGetWindowSize = {
  args: ['ptr', 'ptr', 'ptr'] as [window: 'ptr', width: 'ptr', height: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the size limits of the specified window.
 *
 * C ref: `void glfwSetWindowSizeLimits (GLFWwindow *window, int minwidth, int minheight, int maxwidth, int maxheight)`
 */
export const glfwSetWindowSizeLimits = {
  args: ['ptr', 'i32', 'i32', 'i32', 'i32'] as [
    window: 'ptr',
    minwidth: 'i32',
    minheight: 'i32',
    maxwidth: 'i32',
    maxheight: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the aspect ratio of the specified window.
 *
 * C ref: `void glfwSetWindowAspectRatio (GLFWwindow *window, int numer, int denom)`
 */
export const glfwSetWindowAspectRatio = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', numer: 'i32', denom: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the size of the content area of the specified window.
 *
 * C ref: `void glfwSetWindowSize (GLFWwindow *window, int width, int height)`
 */
export const glfwSetWindowSize = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', width: 'i32', height: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the size of the framebuffer of the specified window.
 *
 * C ref: `void glfwGetFramebufferSize (GLFWwindow *window, int *width, int *height)`
 */
export const glfwGetFramebufferSize = {
  args: ['ptr', 'ptr', 'ptr'] as [window: 'ptr', width: 'ptr', height: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the size of the frame of the window.
 *
 * C ref: `void glfwGetWindowFrameSize (GLFWwindow *window, int *left, int *top, int *right, int *bottom)`
 */
export const glfwGetWindowFrameSize = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    window: 'ptr',
    left: 'ptr',
    top: 'ptr',
    right: 'ptr',
    bottom: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Retrieves the content scale for the specified window.
 *
 * C ref: `void glfwGetWindowContentScale (GLFWwindow *window, float *xscale, float *yscale)`
 */
export const glfwGetWindowContentScale = {
  args: ['ptr', 'ptr', 'ptr'] as [window: 'ptr', xscale: 'ptr', yscale: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the opacity of the whole window.
 *
 * C ref: `float glfwGetWindowOpacity (GLFWwindow *window)`
 */
export const glfwGetWindowOpacity = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'float',
} as const satisfies FFIFunction;

/**
 * Sets the opacity of the whole window.
 *
 * C ref: `void glfwSetWindowOpacity (GLFWwindow *window, float opacity)`
 */
export const glfwSetWindowOpacity = {
  args: ['ptr', 'float'] as [window: 'ptr', opacity: 'float'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Iconifies the specified window.
 *
 * C ref: `void glfwIconifyWindow (GLFWwindow *window)`
 */
export const glfwIconifyWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Restores the specified window.
 *
 * C ref: `void glfwRestoreWindow (GLFWwindow *window)`
 */
export const glfwRestoreWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Maximizes the specified window.
 *
 * C ref: `void glfwMaximizeWindow (GLFWwindow *window)`
 */
export const glfwMaximizeWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Makes the specified window visible.
 *
 * C ref: `void glfwShowWindow (GLFWwindow *window)`
 */
export const glfwShowWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Hides the specified window.
 *
 * C ref: `void glfwHideWindow (GLFWwindow *window)`
 */
export const glfwHideWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Brings the specified window to front and sets input focus.
 *
 * C ref: `void glfwFocusWindow (GLFWwindow *window)`
 */
export const glfwFocusWindow = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Requests user attention to the specified window.
 *
 * C ref: `void glfwRequestWindowAttention (GLFWwindow *window)`
 */
export const glfwRequestWindowAttention = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the monitor that the window uses for full screen mode.
 *
 * C ref: `GLFWmonitor * glfwGetWindowMonitor (GLFWwindow *window)`
 */
export const glfwGetWindowMonitor = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the mode, monitor, video mode and placement of a window.
 *
 * C ref: `void glfwSetWindowMonitor (GLFWwindow *window, GLFWmonitor *monitor, int xpos, int ypos, int width, int height, int refreshRate)`
 */
export const glfwSetWindowMonitor = {
  args: ['ptr', 'ptr', 'i32', 'i32', 'i32', 'i32', 'i32'] as [
    window: 'ptr',
    monitor: 'ptr',
    xpos: 'i32',
    ypos: 'i32',
    width: 'i32',
    height: 'i32',
    refreshRate: 'i32',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns an attribute of the specified window.
 *
 * C ref: `int glfwGetWindowAttrib (GLFWwindow *window, int attrib)`
 */
export const glfwGetWindowAttrib = {
  args: ['ptr', 'i32'] as [window: 'ptr', attrib: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets an attribute of the specified window.
 *
 * C ref: `void glfwSetWindowAttrib (GLFWwindow *window, int attrib, int value)`
 */
export const glfwSetWindowAttrib = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', attrib: 'i32', value: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the user pointer of the specified window.
 *
 * C ref: `void glfwSetWindowUserPointer (GLFWwindow *window, void *pointer)`
 */
export const glfwSetWindowUserPointer = {
  args: ['ptr', 'ptr'] as [window: 'ptr', pointer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the user pointer of the specified window.
 *
 * C ref: `void * glfwGetWindowUserPointer (GLFWwindow *window)`
 */
export const glfwGetWindowUserPointer = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the position callback for the specified window.
 *
 * C ref: `GLFWwindowposfun glfwSetWindowPosCallback (GLFWwindow *window, GLFWwindowposfun callback)`
 */
export const glfwSetWindowPosCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the size callback for the specified window.
 *
 * C ref: `GLFWwindowsizefun glfwSetWindowSizeCallback (GLFWwindow *window, GLFWwindowsizefun callback)`
 */
export const glfwSetWindowSizeCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the close callback for the specified window.
 *
 * C ref: `GLFWwindowclosefun glfwSetWindowCloseCallback (GLFWwindow *window, GLFWwindowclosefun callback)`
 */
export const glfwSetWindowCloseCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the refresh callback for the specified window.
 *
 * C ref: `GLFWwindowrefreshfun glfwSetWindowRefreshCallback (GLFWwindow *window, GLFWwindowrefreshfun callback)`
 */
export const glfwSetWindowRefreshCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the focus callback for the specified window.
 *
 * C ref: `GLFWwindowfocusfun glfwSetWindowFocusCallback (GLFWwindow *window, GLFWwindowfocusfun callback)`
 */
export const glfwSetWindowFocusCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the iconify callback for the specified window.
 *
 * C ref: `GLFWwindowiconifyfun glfwSetWindowIconifyCallback (GLFWwindow *window, GLFWwindowiconifyfun callback)`
 */
export const glfwSetWindowIconifyCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the maximize callback for the specified window.
 *
 * C ref: `GLFWwindowmaximizefun glfwSetWindowMaximizeCallback (GLFWwindow *window, GLFWwindowmaximizefun callback)`
 */
export const glfwSetWindowMaximizeCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the framebuffer resize callback for the specified window.
 *
 * C ref: `GLFWframebuffersizefun glfwSetFramebufferSizeCallback (GLFWwindow *window, GLFWframebuffersizefun callback)`
 */
export const glfwSetFramebufferSizeCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the window content scale callback for the specified window.
 *
 * C ref: `GLFWwindowcontentscalefun glfwSetWindowContentScaleCallback (GLFWwindow *window, GLFWwindowcontentscalefun callback)`
 */
export const glfwSetWindowContentScaleCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Processes all pending events.
 *
 * C ref: `void glfwPollEvents (void)`
 */
export const glfwPollEvents = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Waits until events are queued and processes them.
 *
 * C ref: `void glfwWaitEvents (void)`
 */
export const glfwWaitEvents = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Waits with timeout until events are queued and processes them.
 *
 * C ref: `void glfwWaitEventsTimeout (double timeout)`
 */
export const glfwWaitEventsTimeout = {
  args: ['f64'] as [timeout: 'f64'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Posts an empty event to the event queue.
 *
 * C ref: `void glfwPostEmptyEvent (void)`
 */
export const glfwPostEmptyEvent = {
  args: [],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * This function swaps the front and back buffers of the specified window when rendering with OpenGL or OpenGL ES. If the swap interval is greater than zero, the GPU driver waits the specified number of screen updates before swapping the buffers.
 *
 * C ref: `void glfwSwapBuffers (GLFWwindow *window)`
 */
export const glfwSwapBuffers = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

// GLFW MARK: Monitor

/**
 *  Returns the currently connected monitors.
 *
 * C ref: `GLFWmonitor ** glfwGetMonitors (int *count)`
 */
export const glfwGetMonitors = {
  args: ['ptr'] as [count: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 *  Returns the primary monitor.
 *
 * C ref: `GLFWmonitor * glfwGetPrimaryMonitor (void)`
 */
export const glfwGetPrimaryMonitor = {
  args: [],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 *  Returns the position of the monitor's viewport on the virtual screen.
 *
 * C ref: `void glfwGetMonitorPos (GLFWmonitor *monitor, int *xpos, int *ypos)`
 */
export const glfwGetMonitorPos = {
  args: ['ptr', 'ptr', 'ptr'] as [monitor: 'ptr', xpos: 'ptr', ypos: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 *  Retrieves the work area of the monitor.
 *
 * C ref: `void glfwGetMonitorWorkarea (GLFWmonitor *monitor, int *xpos, int *ypos, int *width, int *height)`
 */
export const glfwGetMonitorWorkarea = {
  args: ['ptr', 'ptr', 'ptr', 'ptr', 'ptr'] as [
    monitor: 'ptr',
    xpos: 'ptr',
    ypos: 'ptr',
    width: 'ptr',
    height: 'ptr',
  ],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 *  Retrieves the content scale for the specified monitor.
 *
 * C ref: `void glfwGetMonitorContentScale (GLFWmonitor *monitor, float *xscale, float *yscale)`
 */
export const glfwGetMonitorContentScale = {
  args: ['ptr', 'ptr', 'ptr'] as [monitor: 'ptr', xscale: 'ptr', yscale: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 *  Returns the name of the specified monitor.
 *
 * C ref: `const char * glfwGetMonitorName (GLFWmonitor *monitor)`
 */
export const glfwGetMonitorName = {
  args: ['ptr'] as [monitor: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 *  Sets the user pointer of the specified monitor.
 *
 * C ref: `void glfwSetMonitorUserPointer (GLFWmonitor *monitor, void *pointer)`
 */
export const glfwSetMonitorUserPointer = {
  args: ['ptr', 'ptr'] as [monitor: 'ptr', pointer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 *  Returns the user pointer of the specified monitor.
 *
 * C ref: `void * glfwGetMonitorUserPointer (GLFWmonitor *monitor)`
 */
export const glfwGetMonitorUserPointer = {
  args: ['ptr'] as [monitor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 *  Sets the monitor configuration callback.
 *
 * C ref: `GLFWmonitorfun glfwSetMonitorCallback (GLFWmonitorfun callback)`
 */
export const glfwSetMonitorCallback = {
  args: ['callback'] as [callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 *  Returns the available video modes for the specified monitor.
 *
 * C ref: `const GLFWvidmode * glfwGetVideoModes (GLFWmonitor *monitor, int *count)`
 */
export const glfwGetVideoModes = {
  args: ['ptr', 'ptr'] as [monitor: 'ptr', count: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 *  Returns the current mode of the specified monitor.
 *
 * C ref: `const GLFWvidmode * glfwGetVideoMode (GLFWmonitor *monitor)`
 */
export const glfwGetVideoMode = {
  args: ['ptr'] as [monitor: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

// GLFW MARK: Inputs

/**
 * Returns the value of an input option for the specified window.
 *
 * C ref: `int glfwGetInputMode (GLFWwindow *window, int mode)`
 */
export const glfwGetInputMode = {
  args: ['ptr', 'i32'] as [window: 'ptr', mode: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets an input option for the specified window.
 *
 * C ref: `void glfwSetInputMode (GLFWwindow *window, int mode, int value)`
 */
export const glfwSetInputMode = {
  args: ['ptr', 'i32', 'i32'] as [window: 'ptr', mode: 'i32', value: 'i32'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns whether raw mouse motion is supported.
 *
 * C ref: `int glfwRawMouseMotionSupported (void)`
 */
export const glfwRawMouseMotionSupported = {
  args: [],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the layout-specific name of the specified printable key.
 *
 * C ref: `const char * glfwGetKeyName (int key, int scancode)`
 */
export const glfwGetKeyName = {
  args: ['i32', 'i32'] as [key: 'i32', scancode: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the platform-specific scancode of the specified key.
 *
 * C ref: `int glfwGetKeyScancode (int key)`
 */
export const glfwGetKeyScancode = {
  args: ['i32'] as [key: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the last reported state of a keyboard key for the specified window.
 *
 * C ref: `int glfwGetKey (GLFWwindow *window, int key)`
 */
export const glfwGetKey = {
  args: ['ptr', 'i32'] as [window: 'ptr', key: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the last reported state of a mouse button for the specified window.
 *
 * C ref: `int glfwGetMouseButton (GLFWwindow *window, int button)`
 */
export const glfwGetMouseButton = {
  args: ['ptr', 'i32'] as [window: 'ptr', button: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Retrieves the position of the cursor relative to the content area of the window.
 *
 * C ref: `void glfwGetCursorPos (GLFWwindow *window, double *xpos, double *ypos)`
 */
export const glfwGetCursorPos = {
  args: ['ptr', 'ptr', 'ptr'] as [window: 'ptr', xpos: 'ptr', ypos: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the position of the cursor, relative to the content area of the window.
 *
 * C ref: `void glfwSetCursorPos (GLFWwindow *window, double xpos, double ypos)`
 */
export const glfwSetCursorPos = {
  args: ['ptr', 'f64', 'f64'] as [window: 'ptr', xpos: 'f64', ypos: 'f64'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Creates a custom cursor.
 *
 * C ref: `GLFWcursor * glfwCreateCursor (const GLFWimage *image, int xhot, int yhot)`
 */
export const glfwCreateCursor = {
  args: ['ptr', 'i32', 'i32'] as [image: 'ptr', xhot: 'i32', yhot: 'i32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Creates a cursor with a standard shape.
 *
 * C ref: `GLFWcursor * glfwCreateStandardCursor (int shape)`
 */
export const glfwCreateStandardCursor = {
  args: ['i32'] as [shape: 'i32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Destroys a cursor.
 *
 * C ref: `void glfwDestroyCursor (GLFWcursor *cursor)`
 */
export const glfwDestroyCursor = {
  args: ['ptr'] as [cursor: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the cursor for the window.
 *
 * C ref: `void glfwSetCursor (GLFWwindow *window, GLFWcursor *cursor)`
 */
export const glfwSetCursor = {
  args: ['ptr', 'ptr'] as [window: 'ptr', cursor: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Sets the key callback.
 *
 * C ref: `GLFWkeyfun glfwSetKeyCallback (GLFWwindow *window, GLFWkeyfun callback)`
 */
export const glfwSetKeyCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the Unicode character callback.
 *
 * C ref: `GLFWcharfun glfwSetCharCallback (GLFWwindow *window, GLFWcharfun callback)`
 */
export const glfwSetCharCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the Unicode character with modifiers callback.
 *
 * C ref: `GLFWcharmodsfun glfwSetCharModsCallback (GLFWwindow *window, GLFWcharmodsfun callback)`
 */
export const glfwSetCharModsCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the mouse button callback.
 *
 * C ref: `GLFWmousebuttonfun glfwSetMouseButtonCallback (GLFWwindow *window, GLFWmousebuttonfun callback)`
 */
export const glfwSetMouseButtonCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the cursor position callback.
 *
 * C ref: `GLFWcursorposfun glfwSetCursorPosCallback (GLFWwindow *window, GLFWcursorposfun callback)`
 */
export const glfwSetCursorPosCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the cursor enter/leave callback.
 *
 * C ref: `GLFWcursorenterfun glfwSetCursorEnterCallback (GLFWwindow *window, GLFWcursorenterfun callback)`
 */
export const glfwSetCursorEnterCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the scroll callback.
 *
 * C ref: `GLFWscrollfun glfwSetScrollCallback (GLFWwindow *window, GLFWscrollfun callback)`
 */
export const glfwSetScrollCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Sets the path drop callback.
 *
 * C ref: `GLFWdropfun glfwSetDropCallback (GLFWwindow *window, GLFWdropfun callback)`
 */
export const glfwSetDropCallback = {
  args: ['ptr', 'callback'] as [window: 'ptr', callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns whether the specified joystick is present.
 *
 * C ref: `int glfwJoystickPresent (int jid)`
 */
export const glfwJoystickPresent = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the values of all axes of the specified joystick.
 *
 * C ref: `const float * glfwGetJoystickAxes (int jid, int *count)`
 */
export const glfwGetJoystickAxes = {
  args: ['i32', 'ptr'] as [jid: 'i32', count: 'ptr'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns the state of all buttons of the specified joystick.
 *
 * C ref: `const unsigned char * glfwGetJoystickButtons (int jid, int *count)`
 */
export const glfwGetJoystickButtons = {
  args: ['i32', 'ptr'] as [jid: 'i32', count: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the state of all hats of the specified joystick.
 *
 * C ref: `const unsigned char * glfwGetJoystickHats (int jid, int *count)`
 */
export const glfwGetJoystickHats = {
  args: ['i32', 'ptr'] as [jid: 'i32', count: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the name of the specified joystick.
 *
 * C ref: `const char * glfwGetJoystickName (int jid)`
 */
export const glfwGetJoystickName = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the SDL compatible GUID of the specified joystick.
 *
 * C ref: `const char * glfwGetJoystickGUID (int jid)`
 */
export const glfwGetJoystickGUID = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Sets the user pointer of the specified joystick.
 *
 * C ref: `void glfwSetJoystickUserPointer (int jid, void *pointer)`
 */
export const glfwSetJoystickUserPointer = {
  args: ['i32', 'ptr'] as [jid: 'i32', pointer: 'ptr'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the user pointer of the specified joystick.
 *
 * C ref: `void * glfwGetJoystickUserPointer (int jid)`
 */
export const glfwGetJoystickUserPointer = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Returns whether the specified joystick has a gamepad mapping.
 *
 * C ref: `int glfwJoystickIsGamepad (int jid)`
 */
export const glfwJoystickIsGamepad = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the joystick configuration callback.
 *
 * C ref: `GLFWjoystickfun glfwSetJoystickCallback (GLFWjoystickfun callback)`
 */
export const glfwSetJoystickCallback = {
  args: ['callback'] as [callback: 'callback'],
  returns: 'ptr',
} as const satisfies FFIFunction;

/**
 * Adds the specified SDL_GameControllerDB gamepad mappings.
 *
 * C ref: `int glfwUpdateGamepadMappings (const char *string)`
 */
export const glfwUpdateGamepadMappings = {
  args: ['cstring'] as [string: 'cstring'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Returns the human-readable gamepad name for the specified joystick.
 *
 * C ref: `const char * glfwGetGamepadName (int jid)`
 */
export const glfwGetGamepadName = {
  args: ['i32'] as [jid: 'i32'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Retrieves the state of the specified joystick remapped as a gamepad.
 *
 * C ref: `int glfwGetGamepadState (int jid, GLFWgamepadstate *state)`
 */
export const glfwGetGamepadState = {
  args: ['i32', 'ptr'] as [jid: 'i32', state: 'ptr'],
  returns: 'i32',
} as const satisfies FFIFunction;

/**
 * Sets the clipboard to the specified string.
 *
 * C ref: `void glfwSetClipboardString (GLFWwindow *window, const char *string)`
 */
export const glfwSetClipboardString = {
  args: ['ptr', 'cstring'] as [window: 'ptr', string: 'cstring'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the contents of the clipboard as a string.
 *
 * C ref: `const char * glfwGetClipboardString (GLFWwindow *window)`
 */
export const glfwGetClipboardString = {
  args: ['ptr'] as [window: 'ptr'],
  returns: 'cstring',
} as const satisfies FFIFunction;

/**
 * Returns the GLFW time.
 *
 * C ref: `double glfwGetTime (void)`
 */
export const glfwGetTime = {
  args: [],
  returns: 'f64',
} as const satisfies FFIFunction;

/**
 * Sets the GLFW time.
 *
 * C ref: `void glfwSetTime (double time)`
 */
export const glfwSetTime = {
  args: ['f64'] as [time: 'f64'],
  returns: 'void',
} as const satisfies FFIFunction;

/**
 * Returns the current value of the raw timer.
 *
 * C ref: `uint64_t glfwGetTimerValue (void)`
 */
export const glfwGetTimerValue = {
  args: [],
  returns: 'u64',
} as const satisfies FFIFunction;

/**
 * Returns the frequency, in Hz, of the raw timer.
 *
 * C ref: `uint64_t glfwGetTimerFrequency (void)`
 */
export const glfwGetTimerFrequency = {
  args: [],
  returns: 'u64',
} as const satisfies FFIFunction;
