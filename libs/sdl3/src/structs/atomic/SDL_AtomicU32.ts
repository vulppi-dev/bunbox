import { BunStruct, type StructSchema } from '../_struct'

export const SDL_AtomicU32Schema = {
  value: { order: 0, type: 'u32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AtomicU32
 */
export class SDL_AtomicU32 extends BunStruct<typeof SDL_AtomicU32Schema> {
  constructor() {
    super(SDL_AtomicU32Schema)
  }
}
