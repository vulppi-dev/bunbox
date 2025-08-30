import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_PenTouchEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_PEN_DOWN or SDL_EVENT_PEN_UP */,
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
  eraser: {
    order: 8,
    type: 'boolean',
  } /**< true if eraser end is used (not all pens support this). */,
  down: {
    order: 9,
    type: 'boolean',
  } /**< true if the pen is touching or false if the pen is lifted off */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PenTouchEvent
 */
export class SDL_PenTouchEvent extends BunStruct<
  typeof SDL_PenTouchEventSchema
> {
  constructor() {
    super(SDL_PenTouchEventSchema)
  }
}
