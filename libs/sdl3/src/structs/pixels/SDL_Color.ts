import { BunStruct, type StructSchema } from '../_struct'

export const SDL_ColorSchema = {
  r: { order: 0, type: 'u8' },
  g: { order: 1, type: 'u8' },
  b: { order: 2, type: 'u8' },
  a: { order: 3, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Color
 */
export class SDL_Color extends BunStruct<typeof SDL_ColorSchema> {
  constructor() {
    super(SDL_ColorSchema)
  }
}
