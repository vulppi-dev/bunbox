import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GamepadTouchpadEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_GAMEPAD_TOUCHPAD_DOWN or SDL_EVENT_GAMEPAD_TOUCHPAD_MOTION or SDL_EVENT_GAMEPAD_TOUCHPAD_UP */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  touchpad: { order: 4, type: 'i32' } /**< The index of the touchpad */,
  finger: {
    order: 5,
    type: 'i32',
  } /**< The index of the finger on the touchpad */,
  x: {
    order: 6,
    type: 'f32',
  } /**< Normalized in the range 0...1 with 0 being on the left */,
  y: {
    order: 7,
    type: 'f32',
  } /**< Normalized in the range 0...1 with 0 being at the top */,
  pressure: { order: 8, type: 'f32' } /**< Normalized in the range 0...1 */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadTouchpadEvent
 */
export class SDL_GamepadTouchpadEvent extends BunStruct<
  typeof SDL_GamepadTouchpadEventSchema
> {
  constructor() {
    super(SDL_GamepadTouchpadEventSchema)
  }
}
