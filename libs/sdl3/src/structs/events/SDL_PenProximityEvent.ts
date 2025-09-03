import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_PenProximityEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_PEN_PROXIMITY_IN or SDL_EVENT_PEN_PROXIMITY_OUT */,
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
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PenProximityEvent
 */
export class SDL_PenProximityEvent extends BunStruct<
  typeof SDL_PenProximityEventSchema
> {
  constructor() {
    super(SDL_PenProximityEventSchema)
  }
}
