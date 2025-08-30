import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GUIDSchema = {
  data: { order: 0, type: 'array', to: 'u8', length: 16 },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GUID
 */
export class SDL_GUID extends BunStruct<typeof SDL_GUIDSchema> {
  constructor() {
    super(SDL_GUIDSchema)
  }
}
