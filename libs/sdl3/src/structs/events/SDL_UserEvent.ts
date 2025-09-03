import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_UserEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_USER through SDL_EVENT_LAST-1, Uint32 because these are not in the SDL_EventType enumeration */,
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
  code: {
    order: 4,
    type: 'i32',
  } /**< The user-defined event code */,
  data1: {
    order: 5,
    type: 'void',
  } /**< User-defined event data */,
  data2: {
    order: 6,
    type: 'void',
  } /**< User-defined event data */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_UserEvent
 */
export class SDL_UserEvent extends BunStruct<typeof SDL_UserEventSchema> {
  constructor() {
    super(SDL_UserEventSchema)
  }
}
