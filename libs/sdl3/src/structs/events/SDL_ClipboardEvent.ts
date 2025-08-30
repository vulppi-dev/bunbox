import { BunStruct, type StructSchema } from '../_struct'

export const SDL_ClipboardEventSchema = {
  type: { order: 0, type: 'u32' },
  reserved: { order: 1, type: 'u32' },
  timestamp: { order: 2, type: 'u64' },
  owner: { order: 3, type: 'boolean' },
  num_mime_types: { order: 4, type: 'i32' },
  mime_types: { order: 5, type: 'array', to: 'string' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_ClipboardEvent
 */
export class SDL_ClipboardEvent extends BunStruct<
  typeof SDL_ClipboardEventSchema
> {
  constructor() {
    super(SDL_ClipboardEventSchema)
  }
}
