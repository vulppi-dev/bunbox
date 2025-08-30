import { BunStruct, type StructSchema } from '../_struct'

export const SDL_RectSchema = {
  x: { order: 0, type: 'i32' },
  y: { order: 1, type: 'i32' },
  w: { order: 2, type: 'i32' },
  h: { order: 3, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Rect
 */
export class SDL_Rect extends BunStruct<typeof SDL_RectSchema> {
  constructor() {
    super(SDL_RectSchema)
  }
}
