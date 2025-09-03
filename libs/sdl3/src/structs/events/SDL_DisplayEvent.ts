import { BunStruct, type StructSchema } from '../_struct'

const SDL_DisplayEventSchema = {
  type: { order: 0, type: 'u32' },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
  displayID: { order: 3, type: 'u32' },
  data1: { order: 4, type: 'i32' },
  data2: { order: 5, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayEvent
 */
export class SDL_DisplayEvent extends BunStruct<typeof SDL_DisplayEventSchema> {
  constructor() {
    super(SDL_DisplayEventSchema)
  }
}
