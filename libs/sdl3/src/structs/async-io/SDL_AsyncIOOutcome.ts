import { BunStruct, type StructSchema } from '../_struct'

export const SDL_AsyncIOOutcomeSchema = {
  asyncio: { order: 0, type: 'void' },
  type: { order: 1, type: 'u32' },
  result: { order: 2, type: 'u32' },
  buffer: { order: 3, type: 'void' },
  offset: { order: 4, type: 'u64' },
  bytes_requested: { order: 5, type: 'u64' },
  bytes_transferred: { order: 6, type: 'u64' },
  userdata: { order: 7, type: 'void' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AsyncIOOutcome
 */
export class SDL_AsyncIOOutcome extends BunStruct<
  typeof SDL_AsyncIOOutcomeSchema
> {
  constructor() {
    super(SDL_AsyncIOOutcomeSchema)
  }
}
