import { BunStruct, type StructSchema } from '../_struct'

export const SDL_MessageBoxColorSchema = {
  r: { order: 0, type: 'u8' },
  g: { order: 1, type: 'u8' },
  b: { order: 2, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MessageBoxColor
 */
export class SDL_MessageBoxColor extends BunStruct<
  typeof SDL_MessageBoxColorSchema
> {
  constructor() {
    super(SDL_MessageBoxColorSchema)
  }
}
