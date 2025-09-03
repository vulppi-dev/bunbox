import { BunStruct, type StructSchema } from '../_struct'

const SDL_AudioSpecSchema = {
  format: { order: 0, type: 'u32' },
  channels: { order: 1, type: 'i32' },
  freq: { order: 2, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AudioSpec
 */
export class SDL_AudioSpec extends BunStruct<typeof SDL_AudioSpecSchema> {
  constructor() {
    super(SDL_AudioSpecSchema)
  }
}
