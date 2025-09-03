import { SDL_EventType } from '../../enum/events'
import { SDL_Scancode } from '../../enum/scancode'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_KeyboardEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_KEY_DOWN or SDL_EVENT_KEY_UP  */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
  which: { order: 4, type: 'u32' } /**< The joystick instance id */,
  scancode: {
    order: 5,
    type: 'enum',
    enum: SDL_Scancode,
  } /**< SDL physical key code */,
  key: { order: 6, type: 'u32' } /**< SDL virtual key code */,
  mod: { order: 7, type: 'u16' } /**< current key modifiers */,
  raw: {
    order: 8,
    type: 'u16',
  } /**< The platform dependent scancode for this event */,
  down: { order: 9, type: 'boolean' } /**< true if the key is pressed */,
  repeat: { order: 10, type: 'boolean' } /**< true if this is a key repeat */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_KeyboardEvent
 */
export class SDL_KeyboardEvent extends BunStruct<
  typeof SDL_KeyboardEventSchema
> {
  constructor() {
    super(SDL_KeyboardEventSchema)
  }
}
