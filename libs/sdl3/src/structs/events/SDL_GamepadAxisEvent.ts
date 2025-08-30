import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GamepadAxisEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_GAMEPAD_AXIS_MOTION */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  axis: { order: 4, type: 'u8' } /**< The gamepad axis (SDL_GamepadAxis) */,
  padding1: { order: 5, type: 'u8' },
  padding2: { order: 6, type: 'u8' },
  padding3: { order: 7, type: 'u8' },
  value: {
    order: 8,
    type: 'i16',
  } /**< The axis value (range: -32768 to 32767) */,
  padding4: { order: 9, type: 'u16' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadAxisEvent
 */
export class SDL_GamepadAxisEvent extends BunStruct<
  typeof SDL_GamepadAxisEventSchema
> {
  constructor() {
    super(SDL_GamepadAxisEventSchema)
  }
}
