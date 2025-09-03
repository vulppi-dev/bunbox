import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_DropEventSchema = {
  type: { order: 0, type: 'enum', enum: SDL_EventType },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
  windowID: { order: 3, type: 'u32' },
  x: { order: 4, type: 'f32' },
  y: { order: 5, type: 'f32' },
  source: { order: 6, type: 'string' },
  data: { order: 7, type: 'string' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DropEvent
 */
export class SDL_DropEvent extends BunStruct<typeof SDL_DropEventSchema> {
  constructor() {
    super(SDL_DropEventSchema)
  }
}
