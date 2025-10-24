// GLFW MARK: Init

export enum GLFW_InitMacro {
  FALSE = 0,
  TRUE = 1,

  /** Joystick hat buttons init hint. */
  JOYSTICK_HAT_BUTTONS = 0x00050001,

  /** ANGLE rendering backend init hint. */
  ANGLE_PLATFORM_TYPE = 0x00050002,

  /** Platform selection init hint. */
  PLATFORM = 0x00050003,

  /** macOS specific init hint. */
  COCOA_CHDIR_RESOURCES = 0x00051001,

  /** macOS specific init hint. */
  COCOA_MENUBAR = 0x00051002,

  /** X11 specific init hint. */
  X11_XCB_VULKAN_SURFACE = 0x00052001,

  /** Wayland specific init hint. */
  WAYLAND_LIBDECOR = 0x00053001,

  /** Hint value that enables automatic platform selection. */
  ANY_PLATFORM = 0x00060000,

  PLATFORM_WIN32 = 0x00060001,
  PLATFORM_COCOA = 0x00060002,
  PLATFORM_WAYLAND = 0x00060003,
  PLATFORM_X11 = 0x00060004,
  PLATFORM_NULL = 0x00060005,
}

export enum GLFW_ErrorCodes {
  /** No error has occurred. */
  NO_ERROR = 0,

  /** GLFW has not been initialized. */
  NOT_INITIALIZED = 0x00010001,

  /** No context is current for this thread. */
  NO_CURRENT_CONTEXT = 0x00010002,

  /** One of the arguments to the function was an invalid enum value. */
  INVALID_ENUM = 0x00010003,

  /** One of the arguments to the function was an invalid value. */
  INVALID_VALUE = 0x00010004,

  /** A memory allocation failed. */
  OUT_OF_MEMORY = 0x00010005,

  /** GLFW could not find support for the requested API on the system. */
  API_UNAVAILABLE = 0x00010006,

  /** The requested OpenGL or OpenGL ES version is not available. */
  VERSION_UNAVAILABLE = 0x00010007,

  /** A platform-specific error occurred that does not match any of the more specific categories. */
  PLATFORM_ERROR = 0x00010008,

  /** The requested format is not supported or available. */
  FORMAT_UNAVAILABLE = 0x00010009,

  /** The specified window does not have an OpenGL or OpenGL ES context. */
  NO_WINDOW_CONTEXT = 0x0001000a,

  /** The specified cursor shape is not available. */
  CURSOR_UNAVAILABLE = 0x0001000b,

  /** The requested feature is not provided by the platform. */
  FEATURE_UNAVAILABLE = 0x0001000c,

  /** The requested feature is not implemented for the platform. */
  FEATURE_UNIMPLEMENTED = 0x0001000d,

  /** Platform unavailable or no matching platform was found. */
  PLATFORM_UNAVAILABLE = 0x0001000e,
}

// GLFW MARK: Window

/** GLFW Window reference defs */
export enum GLFW_WindowMacro {
  /** Input focus window hint and attribute. */
  FOCUSED = 0x00020001,
  /** Window iconification window attribute. */
  ICONIFIED = 0x00020002,
  /** Window resize-ability window hint and attribute. */
  RESIZABLE = 0x00020003,
  /** Window visibility window hint and attribute. */
  VISIBLE = 0x00020004,
  /** Window decoration window hint and attribute. */
  DECORATED = 0x00020005,
  /** Window auto-iconification window hint and attribute. */
  AUTO_ICONIFY = 0x00020006,
  /** Window decoration window hint and attribute. */
  FLOATING = 0x00020007,
  /** Window maximization window hint and attribute. */
  MAXIMIZED = 0x00020008,
  /** Cursor centering window hint. */
  CENTER_CURSOR = 0x00020009,
  /** Window framebuffer transparency hint and attribute. */
  TRANSPARENT_FRAMEBUFFER = 0x0002000a,
  /** Mouse cursor hover window attribute. */
  HOVERED = 0x0002000b,
  /** Input focus on calling show window hint and attribute. */
  FOCUS_ON_SHOW = 0x0002000c,
  /** Mouse input transparency window hint and attribute. */
  MOUSE_PASSTHROUGH = 0x0002000d,
  /** Initial position x-coordinate window hint. */
  POSITION_X = 0x0002000e,
  /** Initial position y-coordinate window hint. */
  POSITION_Y = 0x0002000f,
  /** Framebuffer bit depth hint. */
  RED_BITS = 0x00021001,
  /** Framebuffer bit depth hint. */
  GREEN_BITS = 0x00021002,
  /** Framebuffer bit depth hint. */
  BLUE_BITS = 0x00021003,
  /** Framebuffer bit depth hint. */
  ALPHA_BITS = 0x00021004,
  /** Framebuffer bit depth hint. */
  DEPTH_BITS = 0x00021005,
  /** Framebuffer bit depth hint. */
  STENCIL_BITS = 0x00021006,
  /** Framebuffer bit depth hint. */
  ACCUM_RED_BITS = 0x00021007,
  /** Framebuffer bit depth hint. */
  ACCUM_GREEN_BITS = 0x00021008,
  /** Framebuffer bit depth hint. */
  ACCUM_BLUE_BITS = 0x00021009,
  /** Framebuffer bit depth hint. */
  ACCUM_ALPHA_BITS = 0x0002100a,
  /** Framebuffer auxiliary buffer hint. */
  AUX_BUFFERS = 0x0002100b,
  /** OpenGL stereoscopic rendering hint. */
  STEREO = 0x0002100c,
  /** Framebuffer MSAA samples hint. */
  SAMPLES = 0x0002100d,
  /** Framebuffer sRGB hint. */
  SRGB_CAPABLE = 0x0002100e,
  /** Monitor refresh rate hint. */
  REFRESH_RATE = 0x0002100f,
  /** Framebuffer double buffering hint and attribute. */
  DOUBLEBUFFER = 0x00021010,
  /** Context client API hint and attribute. */
  CLIENT_API = 0x00022001,
  /** Context client API major version hint and attribute. */
  CONTEXT_VERSION_MAJOR = 0x00022002,
  /** Context client API minor version hint and attribute. */
  CONTEXT_VERSION_MINOR = 0x00022003,
  /** Context client API revision number attribute. */
  CONTEXT_REVISION = 0x00022004,
  /** Context robustness hint and attribute. */
  CONTEXT_ROBUSTNESS = 0x00022005,
  /** OpenGL forward-compatibility hint and attribute. */
  OPENGL_FORWARD_COMPAT = 0x00022006,
  /** Debug mode context hint and attribute. */
  CONTEXT_DEBUG = 0x00022007,
  /** Legacy name for compatibility. */
  OPENGL_DEBUG_CONTEXT = CONTEXT_DEBUG,
  /** OpenGL profile hint and attribute. */
  OPENGL_PROFILE = 0x00022008,
  /** Context flush-on-release hint and attribute. */
  CONTEXT_RELEASE_BEHAVIOR = 0x00022009,
  /** Context error suppression hint and attribute. */
  CONTEXT_NO_ERROR = 0x0002200a,
  /** Context creation API hint and attribute. */
  CONTEXT_CREATION_API = 0x0002200b,
  /** Window content area scaling window window hint. */
  SCALE_TO_MONITOR = 0x0002200c,
  /** Window framebuffer scaling window hint. */
  SCALE_FRAMEBUFFER = 0x0002200d,
  /** Legacy name for compatibility. */
  COCOA_RETINA_FRAMEBUFFER = 0x00023001,
  /** macOS specific window hint. */
  COCOA_FRAME_NAME = 0x00023002,
  /** macOS specific window hint. */
  COCOA_GRAPHICS_SWITCHING = 0x00023003,
  /** X11 specific window hint. */
  X11_CLASS_NAME = 0x00024001,
  /** X11 specific window hint. */
  X11_INSTANCE_NAME = 0x00024002,
  /** Win32 specific window hint. */
  WIN32_KEYBOARD_MENU = 0x00025001,
  /** Win32 specific window hint. */
  WIN32_SHOWDEFAULT = 0x00025002,
  /** Wayland specific window hint. */
  WAYLAND_APP_ID = 0x00026001,
}

// GLFW MARK: Input

export enum GLFW_CursorShapes {
  /** The regular arrow cursor shape. */
  ARROW_CURSOR = 0x00036001,

  /** The text input I-beam cursor shape. */
  IBEAM_CURSOR = 0x00036002,

  /** The crosshair cursor shape. */
  CROSSHAIR_CURSOR = 0x00036003,

  /** The pointing hand cursor shape. */
  POINTING_HAND_CURSOR = 0x00036004,

  /** The horizontal resize/move arrow shape. */
  RESIZE_EW_CURSOR = 0x00036005,

  /** The vertical resize/move arrow shape. */
  RESIZE_NS_CURSOR = 0x00036006,

  /** The top-left to bottom-right diagonal resize/move arrow shape. */
  RESIZE_NWSE_CURSOR = 0x00036007,

  /** The top-right to bottom-left diagonal resize/move arrow shape. */
  RESIZE_NESW_CURSOR = 0x00036008,

  /** The omni-directional resize/move cursor shape. */
  RESIZE_ALL_CURSOR = 0x00036009,

  /** The operation-not-allowed shape. */
  NOT_ALLOWED_CURSOR = 0x0003600a,

  /** Legacy name for compatibility. */
  HRESIZE_CURSOR = RESIZE_EW_CURSOR,

  /** Legacy name for compatibility. */
  VRESIZE_CURSOR = RESIZE_NS_CURSOR,

  /** Legacy name for compatibility. */
  HAND_CURSOR = POINTING_HAND_CURSOR,
}

export enum GLFW_MouseButtons {
  MOUSE_BUTTON_1,
  MOUSE_BUTTON_2,
  MOUSE_BUTTON_3,
  MOUSE_BUTTON_4,
  MOUSE_BUTTON_5,
  MOUSE_BUTTON_6,
  MOUSE_BUTTON_7,
  MOUSE_BUTTON_8,
  MOUSE_BUTTON_LAST = MOUSE_BUTTON_8,
  MOUSE_BUTTON_LEFT = MOUSE_BUTTON_1,
  MOUSE_BUTTON_RIGHT = MOUSE_BUTTON_2,
  MOUSE_BUTTON_MIDDLE = MOUSE_BUTTON_3,
}

export enum GLFW_KeyModifier {
  /** If this bit is set one or more Shift keys were held down. */
  MOD_SHIFT = 1 << 1,
  /** If this bit is set one or more Control keys were held down. */
  MOD_CONTROL = 1 << 2,
  /** If this bit is set one or more Alt keys were held down. */
  MOD_ALT = 1 << 3,
  /** If this bit is set one or more Super keys were held down. */
  MOD_SUPER = 1 << 4,
  /** If this bit is set the Caps Lock key is enabled. */
  MOD_CAPS_LOCK = 1 << 5,
  /** If this bit is set the Num Lock key is enabled. */
  MOD_NUM_LOCK = 1 << 6,
}

export enum GLFW_KeyCode {
  KEY_UNKNOWN = -1,
  KEY_SPACE = 32,
  /** @kind char ref: `'` */
  KEY_APOSTROPHE = 39,
  /** @kind char ref: `,` */
  KEY_COMMA = 44,
  /** @kind char ref: `-` */
  KEY_MINUS,
  /** @kind char ref: `.` */
  KEY_PERIOD,
  /** @kind char ref: `/` */
  KEY_SLASH,
  KEY_0,
  KEY_1,
  KEY_2,
  KEY_3,
  KEY_4,
  KEY_5,
  KEY_6,
  KEY_7,
  KEY_8,
  KEY_9,
  /** @kind char ref: `;` */
  KEY_SEMICOLON = 59,
  /** @kind char ref: `=` */
  KEY_EQUAL = 61,
  KEY_A = 65,
  KEY_B,
  KEY_C,
  KEY_D,
  KEY_E,
  KEY_F,
  KEY_G,
  KEY_H,
  KEY_I,
  KEY_J,
  KEY_K,
  KEY_L,
  KEY_M,
  KEY_N,
  KEY_O,
  KEY_P,
  KEY_Q,
  KEY_R,
  KEY_S,
  KEY_T,
  KEY_U,
  KEY_V,
  KEY_W,
  KEY_X,
  KEY_Y,
  KEY_Z,
  /** @kind char ref: `[` */
  KEY_LEFT_BRACKET,
  /** @kind char ref: `\` */
  KEY_BACKSLASH,
  /** @kind char ref: `]` */
  KEY_RIGHT_BRACKET,
  /** @kind char ref: `` ` `` */
  KEY_GRAVE_ACCENT = 96,
  /** @kind char ref: `non-US #1` */
  KEY_WORLD_1 = 161,
  /** @kind char ref: `non-US #2` */
  KEY_WORLD_2 = 162,
  KEY_ESCAPE = 256,
  KEY_ENTER,
  KEY_TAB,
  KEY_BACKSPACE,
  KEY_INSERT,
  KEY_DELETE,
  KEY_RIGHT,
  KEY_LEFT,
  KEY_DOWN,
  KEY_UP,
  KEY_PAGE_UP,
  KEY_PAGE_DOWN,
  KEY_HOME,
  KEY_END,
  KEY_CAPS_LOCK = 280,
  KEY_SCROLL_LOCK,
  KEY_NUM_LOCK,
  KEY_PRINT_SCREEN,
  KEY_PAUSE,
  KEY_F1 = 290,
  KEY_F2,
  KEY_F3,
  KEY_F4,
  KEY_F5,
  KEY_F6,
  KEY_F7,
  KEY_F8,
  KEY_F9,
  KEY_F10,
  KEY_F11,
  KEY_F12,
  KEY_F13,
  KEY_F14,
  KEY_F15,
  KEY_F16,
  KEY_F17,
  KEY_F18,
  KEY_F19,
  KEY_F20,
  KEY_F21,
  KEY_F22,
  KEY_F23,
  KEY_F24,
  KEY_F25,
  KEY_KP_0 = 320,
  KEY_KP_1,
  KEY_KP_2,
  KEY_KP_3,
  KEY_KP_4,
  KEY_KP_5,
  KEY_KP_6,
  KEY_KP_7,
  KEY_KP_8,
  KEY_KP_9,
  KEY_KP_DECIMAL,
  KEY_KP_DIVIDE,
  KEY_KP_MULTIPLY,
  KEY_KP_SUBTRACT,
  KEY_KP_ADD,
  KEY_KP_ENTER,
  KEY_KP_EQUAL,
  KEY_LEFT_SHIFT = 340,
  KEY_LEFT_CONTROL,
  KEY_LEFT_ALT,
  KEY_LEFT_SUPER,
  KEY_RIGHT_SHIFT,
  KEY_RIGHT_CONTROL,
  KEY_RIGHT_ALT,
  KEY_RIGHT_SUPER,
  KEY_MENU,
  KEY_LAST = KEY_MENU,
}

export enum GLFW_JoystickCodes {
  JOYSTICK_1,
  JOYSTICK_2,
  JOYSTICK_3,
  JOYSTICK_4,
  JOYSTICK_5,
  JOYSTICK_6,
  JOYSTICK_7,
  JOYSTICK_8,
  JOYSTICK_9,
  JOYSTICK_10,
  JOYSTICK_11,
  JOYSTICK_12,
  JOYSTICK_13,
  JOYSTICK_14,
  JOYSTICK_15,
  JOYSTICK_16,
  JOYSTICK_LAST = JOYSTICK_16,
}

export enum GLFW_JoystickHat {
  HAT_CENTERED = 0,
  HAT_UP = 1 << 1,
  HAT_RIGHT = 1 << 2,
  HAT_DOWN = 1 << 3,
  HAT_LEFT = 1 << 4,
  HAT_RIGHT_UP = HAT_RIGHT | HAT_UP,
  HAT_RIGHT_DOWN = HAT_RIGHT | HAT_DOWN,
  HAT_LEFT_UP = HAT_LEFT | HAT_UP,
  HAT_LEFT_DOWN = HAT_LEFT | HAT_DOWN,
}

export enum GLFW_GamepadCodes {
  GAMEPAD_BUTTON_A,
  GAMEPAD_BUTTON_B,
  GAMEPAD_BUTTON_X,
  GAMEPAD_BUTTON_Y,
  GAMEPAD_BUTTON_LEFT_BUMPER,
  GAMEPAD_BUTTON_RIGHT_BUMPER,
  GAMEPAD_BUTTON_BACK,
  GAMEPAD_BUTTON_START,
  GAMEPAD_BUTTON_GUIDE,
  GAMEPAD_BUTTON_LEFT_THUMB,
  GAMEPAD_BUTTON_RIGHT_THUMB,
  GAMEPAD_BUTTON_DPAD_UP,
  GAMEPAD_BUTTON_DPAD_RIGHT,
  GAMEPAD_BUTTON_DPAD_DOWN,
  GAMEPAD_BUTTON_DPAD_LEFT,
  GAMEPAD_BUTTON_LAST = GAMEPAD_BUTTON_DPAD_LEFT,
  GAMEPAD_BUTTON_CROSS = GAMEPAD_BUTTON_A,
  GAMEPAD_BUTTON_CIRCLE = GAMEPAD_BUTTON_B,
  GAMEPAD_BUTTON_SQUARE = GAMEPAD_BUTTON_X,
  GAMEPAD_BUTTON_TRIANGLE = GAMEPAD_BUTTON_Y,
}

export enum GLFW_GamepadAxis {
  GAMEPAD_AXIS_LEFT_X,
  GAMEPAD_AXIS_LEFT_Y,
  GAMEPAD_AXIS_RIGHT_X,
  GAMEPAD_AXIS_RIGHT_Y,
  GAMEPAD_AXIS_LEFT_TRIGGER,
  GAMEPAD_AXIS_RIGHT_TRIGGER,
  GAMEPAD_AXIS_LAST = GAMEPAD_AXIS_RIGHT_TRIGGER,
}
