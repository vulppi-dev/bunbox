import { BunStruct, type StructSchema } from '../_struct'

const SDL_FColorSchema = {
  r: { order: 0, type: 'f32' },
  g: { order: 1, type: 'f32' },
  b: { order: 2, type: 'f32' },
  a: { order: 3, type: 'f32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FColor
 */
export class SDL_FColor extends BunStruct<typeof SDL_FColorSchema> {
  constructor() {
    super(SDL_FColorSchema)
  }
}
