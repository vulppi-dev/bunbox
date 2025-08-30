import { SDL_PixelFormat } from '../../enum/pixels'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_TextureSchema = {
  format: { order: 0, type: 'enum', enum: SDL_PixelFormat },
  w: { order: 1, type: 'i32' },
  h: { order: 2, type: 'i32' },
  refcount: { order: 3, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Texture
 */
export class SDL_Texture extends BunStruct<typeof SDL_TextureSchema> {
  constructor() {
    super(SDL_TextureSchema)
  }
}
