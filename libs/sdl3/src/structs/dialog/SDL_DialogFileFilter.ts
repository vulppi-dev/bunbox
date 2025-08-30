import { BunStruct, type StructSchema } from '../_struct'

export const SDL_DialogFileFilterSchema = {
  name: { order: 0, type: 'string' },
  pattern: { order: 1, type: 'string' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DialogFileFilter
 */
export class SDL_DialogFileFilter extends BunStruct<
  typeof SDL_DialogFileFilterSchema
> {
  constructor() {
    super(SDL_DialogFileFilterSchema)
  }
}
