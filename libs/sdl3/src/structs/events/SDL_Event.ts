import { BunStruct, type StructSchema } from '../_struct'
import { SDL_AudioDeviceEvent } from './SDL_AudioDeviceEvent'
import { SDL_CameraDeviceEvent } from './SDL_CameraDeviceEvent'
import { SDL_ClipboardEvent } from './SDL_ClipboardEvent'
import { SDL_CommonEvent } from './SDL_CommonEvent'
import { SDL_DisplayEvent } from './SDL_DisplayEvent'
import { SDL_DropEvent } from './SDL_DropEvent'
import { SDL_GamepadAxisEvent } from './SDL_GamepadAxisEvent'
import { SDL_GamepadButtonEvent } from './SDL_GamepadButtonEvent'
import { SDL_GamepadDeviceEvent } from './SDL_GamepadDeviceEvent'
import { SDL_GamepadSensorEvent } from './SDL_GamepadSensorEvent'
import { SDL_GamepadTouchpadEvent } from './SDL_GamepadTouchpadEvent'
import { SDL_JoyAxisEvent } from './SDL_JoyAxisEvent'
import { SDL_JoyBallEvent } from './SDL_JoyBallEvent'
import { SDL_JoyBatteryEvent } from './SDL_JoyBatteryEvent'
import { SDL_JoyButtonEvent } from './SDL_JoyButtonEvent'
import { SDL_JoyDeviceEvent } from './SDL_JoyDeviceEvent'
import { SDL_JoyHatEvent } from './SDL_JoyHatEvent'
import { SDL_KeyboardDeviceEvent } from './SDL_KeyboardDeviceEvent'
import { SDL_KeyboardEvent } from './SDL_KeyboardEvent'
import { SDL_MouseButtonEvent } from './SDL_MouseButtonEvent'
import { SDL_MouseDeviceEvent } from './SDL_MouseDeviceEvent'
import { SDL_MouseMotionEvent } from './SDL_MouseMotionEvent'
import { SDL_MouseWheelEvent } from './SDL_MouseWheelEvent'
import { SDL_PenAxisEvent } from './SDL_PenAxisEvent'
import { SDL_PenButtonEvent } from './SDL_PenButtonEvent'
import { SDL_PenMotionEvent } from './SDL_PenMotionEvent'
import { SDL_PenProximityEvent } from './SDL_PenProximityEvent'
import { SDL_PenTouchEvent } from './SDL_PenTouchEvent'
import { SDL_QuitEvent } from './SDL_QuitEvent'
import { SDL_RenderEvent } from './SDL_RenderEvent'
import { SDL_SensorEvent } from './SDL_SensorEvent'
import { SDL_TextEditingCandidatesEvent } from './SDL_TextEditingCandidatesEvent'
import { SDL_TextEditingEvent } from './SDL_TextEditingEvent'
import { SDL_TextInputEvent } from './SDL_TextInputEvent'
import { SDL_TouchFingerEvent } from './SDL_TouchFingerEvent'
import { SDL_UserEvent } from './SDL_UserEvent'
import { SDL_WindowEvent } from './SDL_WindowEvent'

const SDL_EventSchema = {
  type: {
    order: 0,
    type: 'u32',
  } /**< Event type, shared with all events, Uint32 to cover user events which are not in the SDL_EventType enumeration */,
  common: {
    order: 1,
    type: 'struct',
    schema: SDL_CommonEvent,
    isInline: true,
  } /**< Common event data */,
  display: {
    order: 2,
    type: 'struct',
    schema: SDL_DisplayEvent,
    isInline: true,
  } /**< Display event data */,
  window: {
    order: 3,
    type: 'struct',
    schema: SDL_WindowEvent,
    isInline: true,
  } /**< Window event data */,
  kdevice: {
    order: 4,
    type: 'struct',
    schema: SDL_KeyboardDeviceEvent,
    isInline: true,
  } /**< Keyboard device change event data */,
  key: {
    order: 5,
    type: 'struct',
    schema: SDL_KeyboardEvent,
    isInline: true,
  } /**< Keyboard event data */,
  edit: {
    order: 6,
    type: 'struct',
    schema: SDL_TextEditingEvent,
    isInline: true,
  } /**< Text editing event data */,
  edit_candidates: {
    order: 7,
    type: 'struct',
    schema: SDL_TextEditingCandidatesEvent,
    isInline: true,
  } /**< Text editing candidates event data */,
  text: {
    order: 8,
    type: 'struct',
    schema: SDL_TextInputEvent,
    isInline: true,
  } /**< Text input event data */,
  mdevice: {
    order: 9,
    type: 'struct',
    schema: SDL_MouseDeviceEvent,
    isInline: true,
  } /**< Mouse device change event data */,
  motion: {
    order: 10,
    type: 'struct',
    schema: SDL_MouseMotionEvent,
    isInline: true,
  } /**< Mouse motion event data */,
  button: {
    order: 11,
    type: 'struct',
    schema: SDL_MouseButtonEvent,
    isInline: true,
  } /**< Mouse button event data */,
  wheel: {
    order: 12,
    type: 'struct',
    schema: SDL_MouseWheelEvent,
    isInline: true,
  } /**< Mouse wheel event data */,
  jdevice: {
    order: 13,
    type: 'struct',
    schema: SDL_JoyDeviceEvent,
    isInline: true,
  } /**< Joystick device change event data */,
  jaxis: {
    order: 14,
    type: 'struct',
    schema: SDL_JoyAxisEvent,
    isInline: true,
  } /**< Joystick axis event data */,
  jball: {
    order: 15,
    type: 'struct',
    schema: SDL_JoyBallEvent,
    isInline: true,
  } /**< Joystick ball event data */,
  jhat: {
    order: 16,
    type: 'struct',
    schema: SDL_JoyHatEvent,
    isInline: true,
  } /**< Joystick hat event data */,
  jbutton: {
    order: 17,
    type: 'struct',
    schema: SDL_JoyButtonEvent,
    isInline: true,
  } /**< Joystick button event data */,
  jbattery: {
    order: 18,
    type: 'struct',
    schema: SDL_JoyBatteryEvent,
    isInline: true,
  } /**< Joystick battery event data */,
  gdevice: {
    order: 19,
    type: 'struct',
    schema: SDL_GamepadDeviceEvent,
    isInline: true,
  } /**< Gamepad device event data */,
  gaxis: {
    order: 20,
    type: 'struct',
    schema: SDL_GamepadAxisEvent,
    isInline: true,
  } /**< Gamepad axis event data */,
  gbutton: {
    order: 21,
    type: 'struct',
    schema: SDL_GamepadButtonEvent,
    isInline: true,
  } /**< Gamepad button event data */,
  gtouchpad: {
    order: 22,
    type: 'struct',
    schema: SDL_GamepadTouchpadEvent,
    isInline: true,
  } /**< Gamepad touchpad event data */,
  gsensor: {
    order: 23,
    type: 'struct',
    schema: SDL_GamepadSensorEvent,
    isInline: true,
  } /**< Gamepad sensor event data */,
  adevice: {
    order: 24,
    type: 'struct',
    schema: SDL_AudioDeviceEvent,
    isInline: true,
  } /**< Audio device event data */,
  cdevice: {
    order: 25,
    type: 'struct',
    schema: SDL_CameraDeviceEvent,
    isInline: true,
  } /**< Camera device event data */,
  sensor: {
    order: 26,
    type: 'struct',
    schema: SDL_SensorEvent,
    isInline: true,
  } /**< Sensor event data */,
  quit: {
    order: 27,
    type: 'struct',
    schema: SDL_QuitEvent,
    isInline: true,
  } /**< Quit request event data */,
  user: {
    order: 28,
    type: 'struct',
    schema: SDL_UserEvent,
    isInline: true,
  } /**< Custom event data */,
  tfinger: {
    order: 29,
    type: 'struct',
    schema: SDL_TouchFingerEvent,
    isInline: true,
  } /**< Touch finger event data */,
  pproximity: {
    order: 30,
    type: 'struct',
    schema: SDL_PenProximityEvent,
    isInline: true,
  } /**< Pen proximity event data */,
  ptouch: {
    order: 31,
    type: 'struct',
    schema: SDL_PenTouchEvent,
    isInline: true,
  } /**< Pen tip touching event data */,
  pmotion: {
    order: 32,
    type: 'struct',
    schema: SDL_PenMotionEvent,
    isInline: true,
  } /**< Pen motion event data */,
  pbutton: {
    order: 33,
    type: 'struct',
    schema: SDL_PenButtonEvent,
    isInline: true,
  } /**< Pen button event data */,
  paxis: {
    order: 34,
    type: 'struct',
    schema: SDL_PenAxisEvent,
    isInline: true,
  } /**< Pen axis event data */,
  render: {
    order: 35,
    type: 'struct',
    schema: SDL_RenderEvent,
    isInline: true,
  } /**< Render event data */,
  drop: {
    order: 36,
    type: 'struct',
    schema: SDL_DropEvent,
    isInline: true,
  } /**< Drag and drop event data */,
  clipboard: {
    order: 37,
    type: 'struct',
    schema: SDL_ClipboardEvent,
    isInline: true,
  } /**< Clipboard event data */,

  /** This is necessary for ABI compatibility between Visual C++ and GCC.
       Visual C++ will respect the push pack pragma and use 52 bytes (size of
       SDL_TextEditingEvent, the largest structure for 32-bit and 64-bit
       architectures) for this union, and GCC will use the alignment of the
       largest datatype within the union, which is 8 bytes on 64-bit
       architectures.

       So... we'll add padding to force the size to be the same for both.

       On architectures where pointers are 16 bytes, this needs rounding up to
       the next multiple of 16, 64, and on architectures where pointers are
       even larger the size of SDL_UserEvent will dominate as being 3 pointers.
    */
  padding: { order: 38, type: 'array', to: 'u8', length: 128 },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Event
 */
export class SDL_Event extends BunStruct<typeof SDL_EventSchema> {
  constructor() {
    super(SDL_EventSchema, true)
  }
}
