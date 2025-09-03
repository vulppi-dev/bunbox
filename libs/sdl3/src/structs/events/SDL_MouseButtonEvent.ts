import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_MouseButtonEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_MOUSE_BUTTON_DOWN or SDL_EVENT_MOUSE_BUTTON_UP */,
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
  button: { order: 5, type: 'u8' } /**< The mouse button index */,
  down: { order: 6, type: 'boolean' } /**< true if the button is pressed */,
  clicks: {
    order: 7,
    type: 'u8',
  } /**< 1 for single-click, 2 for double-click, etc. */,
  padding: { order: 8, type: 'u8' },
  x: { order: 9, type: 'f32' } /**< X coordinate, relative to window */,
  y: { order: 10, type: 'f32' } /**< Y coordinate, relative to window */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseButtonEvent
 */
export class SDL_MouseButtonEvent extends BunStruct<
  typeof SDL_MouseButtonEventSchema
> {
  constructor() {
    super(SDL_MouseButtonEventSchema)
  }
}
