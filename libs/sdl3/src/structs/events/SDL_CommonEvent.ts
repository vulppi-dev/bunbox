import { BunStruct, type StructSchema } from '../_struct'

const SDL_CommonEventSchema = {
  type: { order: 0, type: 'u32' },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CommonEvent
 */
export class SDL_CommonEvent extends BunStruct<typeof SDL_CommonEventSchema> {
  constructor() {
    super(SDL_CommonEventSchema)
  }
}
