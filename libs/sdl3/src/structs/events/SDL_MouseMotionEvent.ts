import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_MouseMotionEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_MOUSE_MOTION */,
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
  state: { order: 5, type: 'u32' } /**< The state of the mouse buttons */,
  x: { order: 6, type: 'f32' } /**< X coordinate, relative to window */,
  y: { order: 7, type: 'f32' } /**< Y coordinate, relative to window */,
  xrel: { order: 8, type: 'f32' } /**< Relative motion in the X direction */,
  yrel: { order: 9, type: 'f32' } /**< Relative motion in the Y direction */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseMotionEvent
 */
export class SDL_MouseMotionEvent extends BunStruct<
  typeof SDL_MouseMotionEventSchema
> {
  constructor() {
    super(SDL_MouseMotionEventSchema)
  }
}
