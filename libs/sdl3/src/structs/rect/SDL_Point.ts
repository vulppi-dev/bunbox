import { BunStruct, type StructSchema } from '../_struct'

const SDL_PointSchema = {
  x: { order: 0, type: 'i32' },
  y: { order: 1, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Point
 */
export class SDL_Point extends BunStruct<typeof SDL_PointSchema> {
  constructor() {
    super(SDL_PointSchema)
  }
}
