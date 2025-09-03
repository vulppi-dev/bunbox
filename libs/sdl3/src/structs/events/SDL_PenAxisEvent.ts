import { SDL_EventType } from '../../enum/events'
import { SDL_PenAxis } from '../../enum/pen'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_PenAxisEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_PEN_AXIS  */,
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
  pen_state: {
    order: 5,
    type: 'u32',
  } /**< Complete pen input state at time of event */,
  x: { order: 6, type: 'f32' } /**< X coordinate, relative to window */,
  y: { order: 7, type: 'f32' } /**< Y coordinate, relative to window */,
  axis: {
    order: 8,
    type: 'enum',
    enum: SDL_PenAxis,
  } /**< Axis that has changed */,
  value: { order: 9, type: 'f32' } /**< New value of axis */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PenAxisEvent
 */
export class SDL_PenAxisEvent extends BunStruct<typeof SDL_PenAxisEventSchema> {
  constructor() {
    super(SDL_PenAxisEventSchema)
  }
}
