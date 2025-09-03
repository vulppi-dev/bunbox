import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_TextEditingEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_TEXT_EDITING */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
  text: {
    order: 4,
    type: 'string',
  } /**< The editing text */,
  start: {
    order: 5,
    type: 'i32',
  } /**< The start cursor of selected editing text, or -1 if not set */,
  length: {
    order: 6,
    type: 'i32',
  } /**< The length of selected editing text, or -1 if not set */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextEditingEvent
 */
export class SDL_TextEditingEvent extends BunStruct<
  typeof SDL_TextEditingEventSchema
> {
  constructor() {
    super(SDL_TextEditingEventSchema)
  }
}
