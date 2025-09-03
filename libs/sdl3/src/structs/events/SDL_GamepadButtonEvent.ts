import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GamepadButtonEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_GAMEPAD_BUTTON_DOWN or SDL_EVENT_GAMEPAD_BUTTON_UP */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  button: {
    order: 4,
    type: 'u8',
  } /**< The gamepad button (SDL_GamepadButton) */,
  down: { order: 5, type: 'boolean' } /**< true if the button is pressed */,
  padding1: { order: 6, type: 'u8' },
  padding2: { order: 7, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadButtonEvent
 */
export class SDL_GamepadButtonEvent extends BunStruct<
  typeof SDL_GamepadButtonEventSchema
> {
  constructor() {
    super(SDL_GamepadButtonEventSchema)
  }
}
