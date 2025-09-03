import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_RenderEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_RENDER_TARGETS_RESET, SDL_EVENT_RENDER_DEVICE_RESET, SDL_EVENT_RENDER_DEVICE_LOST */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_RenderEvent
 */
export class SDL_RenderEvent extends BunStruct<typeof SDL_RenderEventSchema> {
  constructor() {
    super(SDL_RenderEventSchema)
  }
}
