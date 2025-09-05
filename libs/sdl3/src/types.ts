import type {
  SDL_AssertState,
  SDL_EnumerationResult,
  SDL_HitTestResult,
  SDL_LogPriority,
} from './enum';
import { type Pointer } from 'bun:ffi';

// MARK: Assert

export type SDL_AssertionHandler = (
  data: Pointer,
  userdata: Pointer,
) => SDL_AssertState;

// MARK: AsyncIO

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIO
 */
export type SDL_AsyncIO = Record<string, unknown> & { __async_io: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOQueue
 */
export type SDL_AsyncIOQueue = Record<string, unknown> & {
  __async_io_queue: undefined;
};

// MARK: Atomic

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIO
 */
export type SDL_SpinLock = number & { __spin_lock: undefined };

// MARK: Audio

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioDeviceID
 */
export type SDL_AudioDeviceID = number & { __audio_device_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioIterationCallback
 */
export type SDL_AudioIterationCallback = (
  userdata: Pointer,
  devId: SDL_AudioDeviceID,
  start: boolean,
) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioPostmixCallback
 */
export type SDL_AudioPostmixCallback = (
  userdata: Pointer,
  spec: Pointer,
  buffer: Pointer,
  bufferLength: number,
) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStream
 */
export type SDL_AudioStream = Pointer & { __audio_stream: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStreamCallback
 */
export type SDL_AudioStreamCallback = (
  userdata: Pointer,
  stream: Pointer,
  additionalAmount: number,
  totalAmount: number,
) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioStreamDataCompleteCallback
 */
export type SDL_AudioStreamDataCompleteCallback = (
  userdata: Pointer,
  buffer: Pointer,
  bufferLength: number,
) => void;

// MARK: Camera

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Camera
 */
export type SDL_Camera = Record<string, unknown> & { __camera: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CameraID
 */
export type SDL_CameraID = number & { __camera_id: undefined };

// MARK: Clipboard

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ClipboardDataCallback
 */
export type SDL_ClipboardDataCallback = (
  userdata: Pointer,
  mime_type: Pointer,
  size: Pointer,
) => Pointer;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ClipboardCleanupCallback
 */
export type SDL_ClipboardCleanupCallback = (userdata: Pointer) => void;

// MARK: Dialog

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DialogFileCallback
 */
export type SDL_DialogFileCallback = (
  userdata: Pointer,
  filelist: Pointer,
  filter: number,
) => void;

// MARK: Event

export type SDL_EventFilter = (userdata: Pointer, event: Pointer) => boolean;

// MARK: Filesystem

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EnumerateDirectoryCallback
 */
export type SDL_EnumerateDirectoryCallback = (
  userdata: Pointer,
  dirname: Pointer,
  fname: Pointer,
) => SDL_EnumerationResult;

// MARK: Gamepad

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Gamepad
 */
export type SDL_Gamepad = Record<string, unknown> & { __gamepad: undefined };

// MARK: Haptic

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Haptic
 */
export type SDL_Haptic = Record<string, unknown> & { __haptic: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticDirectionType
 */
export type SDL_HapticDirectionType = number & {
  __haptic_direction_type: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticEffectID
 */
export type SDL_HapticEffectID = number & { __haptic_effect_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticEffectType
 */
export type SDL_HapticEffectType = number & { __haptic_effect_type: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticID
 */
export type SDL_HapticID = number & { __haptic_id: undefined };

// MARK: HIDAPI

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_hid_device
 */
export type SDL_hid_device = Record<string, unknown> & {
  __hid_device: undefined;
};

// MARK: Hint

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HintCallback
 */
export type SDL_HintCallback = (
  userdata: Pointer,
  name: Pointer,
  oldValue: Pointer,
  newValue: Pointer,
) => void;

// MARK: Init

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AppEvent_func
 */
export type SDL_AppEvent_func = (appstate: Pointer, event: Pointer) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AppInit_func
 */
export type SDL_AppInit_func = (
  appstate: Pointer,
  argc: number,
  argv: Pointer,
) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AppIterate_func
 */
export type SDL_AppIterate_func = (appstate: Pointer) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AppQuit_func
 */
export type SDL_AppQuit_func = (appstate: Pointer, result: number) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MainThreadCallback
 */
export type SDL_MainThreadCallback = (userdata: Pointer) => void;

// MARK: IOStream

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_IOStream
 */
export type SDL_IOStream = Record<string, unknown> & { __io_stream: undefined };

// MARK: Joystick

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Joystick
 */
export type SDL_Joystick = Record<string, unknown> & { __joystick: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_JoystickID
 */
export type SDL_JoystickID = number & { __joystick_id: undefined };

// MARK: Keyboard

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_KeyboardID
 */
export type SDL_KeyboardID = number & { __keyboard_id: undefined };

// MARK: Log

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_LogOutputFunction
 */
export type SDL_LogOutputFunction = (
  userdata: Pointer,
  category: number,
  priority: SDL_LogPriority,
  message: Pointer,
) => void;

// MARK: Metal

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MetalView
 */
export type SDL_MetalView = Pointer & { __metal_view: undefined };

// MARK: Mouse

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Cursor
 */
export type SDL_Cursor = Pointer & { __cursor: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseID
 */
export type SDL_MouseID = number & { __mouse_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseMotionTransformCallback
 */
export type SDL_MouseMotionTransformCallback = (
  userdata: Pointer,
  timestamp: bigint,
  window: Pointer,
  mouseId: SDL_MouseID,
  x: Pointer,
  y: Pointer,
) => void;

// MARK: Mutex

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Condition
 */
export type SDL_Condition = Record<string, unknown> & {
  __condition: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Mutex
 */
export type SDL_Mutex = Record<string, unknown> & { __mutex: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_RWLock
 */
export type SDL_RWLock = Record<string, unknown> & { __rw_lock: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Semaphore
 */
export type SDL_Semaphore = Record<string, unknown> & {
  __semaphore: undefined;
};

// MARK: Pen

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Pen
 */
export type SDL_PenID = number & { __pen_id: undefined };

// MARK: Process

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Process
 */
export type SDL_Process = Record<string, unknown> & { __process: undefined };

// MARK: Properties

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CleanupPropertyCallback
 */
export type SDL_CleanupPropertyCallback = (
  userdata: Pointer,
  value: Pointer,
) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EnumeratePropertiesCallback
 */
export type SDL_EnumeratePropertiesCallback = (
  userdata: Pointer,
  props: SDL_PropertiesID,
  name: Pointer,
) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PropertiesID
 */
export type SDL_PropertiesID = number & { __properties_id: undefined };

// MARK: Timer

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPURenderState
 */
export type SDL_GPURenderState = Record<string, unknown> & {
  __gpu_render_state: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPURenderer
 */
export type SDL_GPURenderer = Record<string, unknown> & {
  __gpu_renderer: undefined;
};

// MARK: Sensor

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Sensor
 */
export type SDL_Sensor = Record<string, unknown> & { __sensor: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SensorID
 */
export type SDL_SensorID = number & { __sensor_id: undefined };

// MARK: SharedObject

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SharedObject
 */
export type SDL_SharedObject = Record<string, unknown> & {
  __shared_object: undefined;
};

// MARK: Std

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_calloc_func
 */
export type SDL_calloc_func = (nmemb: bigint, size: bigint) => Pointer;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CompareCallback
 */
export type SDL_CompareCallback = (a: Pointer, b: Pointer) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CompareCallback_r
 */
export type SDL_CompareCallback_r = (
  userdata: Pointer,
  a: Pointer,
  b: Pointer,
) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Environment
 */
export type SDL_Environment = Record<string, unknown> & {
  __environment: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_free_func
 */
export type SDL_free_func = (ptr: Pointer) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FunctionPointer
 */
export type SDL_FunctionPointer = () => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_iconv_t
 */
export type SDL_iconv_t = Pointer & { __iconv_t: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_malloc_func
 */
export type SDL_malloc_func = (size: bigint) => Pointer;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_realloc_func
 */
export type SDL_realloc_func = (ptr: Pointer, size: bigint) => Pointer;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Time
 */
export type SDL_Time = bigint & { __time: undefined };

// MARK: Storage

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Storage
 */
export type SDL_Storage = Record<string, unknown> & {
  __storage: undefined;
};

// MARK: System

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_iOSAnimationCallback
 */
export type SDL_iOSAnimationCallback = {};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_RequestAndroidPermissionCallback
 */
export type SDL_RequestAndroidPermissionCallback = {};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_WindowsMessageHook
 */
export type SDL_WindowsMessageHook = {};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_X11EventHook
 */
export type SDL_X11EventHook = {};

// MARK: Thread

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Thread
 */
export type SDL_Thread = Record<string, unknown> & { __thread: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ThreadFunction
 */
export type SDL_ThreadFunction = (data: Pointer) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ThreadID
 */
export type SDL_ThreadID = bigint & { __thread_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TLSDestructorCallback
 */
export type SDL_TLSDestructorCallback = (value: Pointer) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TLSID
 */
export type SDL_TLSID = bigint & { __tls_id: undefined };

// MARK: Timer

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TimerCallback
 */
export type SDL_TimerCallback = (
  userdata: Pointer,
  timerId: SDL_TimerID,
  interval: number,
) => number;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TimerID
 */
export type SDL_TimerID = number & { __time_id: undefined };

// MARK: Touch

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FingerID
 */
export type SDL_FingerID = number & { __finger_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TouchID
 */
export type SDL_TouchID = number & { __touch_id: undefined };

// MARK: Tray

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Tray
 */
export type SDL_Tray = Record<string, unknown> & { __tray: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TrayCallback
 */
export type SDL_TrayCallback = (userdata: Pointer, entry: Pointer) => void;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TrayEntry
 */
export type SDL_TrayEntry = Record<string, unknown> & {
  __tray_entry: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TrayMenu
 */
export type SDL_TrayMenu = Record<string, unknown> & { __tray_menu: undefined };

// MARK: Video

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayID
 */
export type SDL_DisplayID = number & { __display_id: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayModeData
 */
export type SDL_DisplayModeData = Record<string, unknown> & {
  __display_mode_data: undefined;
};

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLAttrib
 */
export type SDL_EGLAttrib = Pointer & { __egl_attrib: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLAttribArrayCallback
 */
export type SDL_EGLAttribArrayCallback = (userdata: Pointer) => SDL_EGLAttrib;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLConfig
 */
export type SDL_EGLConfig = Pointer & { __egl_config: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLDisplay
 */
export type SDL_EGLDisplay = Pointer & { __egl_display: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLint
 */
export type SDL_EGLint = number & { __egl_int: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLIntArrayCallback
 */
export type SDL_EGLIntArrayCallback = (
  userdata: Pointer,
  display: SDL_EGLDisplay,
  config: SDL_EGLConfig,
) => SDL_EGLint;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_EGLSurface
 */
export type SDL_EGLSurface = Pointer & { __egl_surface: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GLContext
 */
export type SDL_GLContext = Pointer & { __gl_context: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HitTest
 */
export type SDL_HitTest = (
  win: Pointer,
  area: Pointer,
  data: Pointer,
) => SDL_HitTestResult;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Window
 */
export type SDL_Window = Record<string, unknown> & { __window: undefined };

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_WindowID
 */
export type SDL_WindowID = number & { __window_id: undefined };
