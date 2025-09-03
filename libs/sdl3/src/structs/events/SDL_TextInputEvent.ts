import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_TextInputEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_TEXT_INPUT */,
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
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TextInputEvent
 */
export class SDL_TextInputEvent extends BunStruct<
  typeof SDL_TextInputEventSchema
> {
  constructor() {
    super(SDL_TextInputEventSchema)
  }
}
