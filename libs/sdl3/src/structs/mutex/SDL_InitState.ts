import { BunStruct, type StructSchema } from '../_struct'
import { SDL_AtomicInt } from '../atomic/SDL_AtomicInt'

const SDL_InitStateSchema = {
  status: {
    order: 0,
    type: 'struct',
    schema: SDL_AtomicInt,
  },
  thread: {
    order: 1,
    type: 'u64',
  },
  reserved: {
    order: 2,
    type: 'void',
  },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_InitState
 */
export class SDL_InitState extends BunStruct<typeof SDL_InitStateSchema> {
  constructor() {
    super(SDL_InitStateSchema)
  }
}
