import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_WindowEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_WINDOW */,
  reserved: {
    order: 1,
    type: 'u32',
  },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
  data1: {
    order: 4,
    type: 'i32',
  } /**< User-defined event data */,
  data2: {
    order: 5,
    type: 'i32',
  } /**< User-defined event data */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_WindowEvent
 */
export class SDL_WindowEvent extends BunStruct<typeof SDL_WindowEventSchema> {
  constructor() {
    super(SDL_WindowEventSchema)
  }
}
