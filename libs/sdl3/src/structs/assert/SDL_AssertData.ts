import { BunStruct, type StructSchema } from '../_struct'

export const SDL_AssertDataSchema = {
  always_ignore: { order: 0, type: 'boolean' },
  trigger_count: { order: 1, type: 'u32' },
  condition: { order: 2, type: 'string' },
  filename: { order: 3, type: 'string' },
  linenum: { order: 4, type: 'i32' },
  function: { order: 5, type: 'string' },
  next: { order: 6, type: 'struct', schema: 'self' },
  asd: { order: 7, type: 'i64' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AssertData
 */
export class SDL_AssertData extends BunStruct<typeof SDL_AssertDataSchema> {
  constructor() {
    super(SDL_AssertDataSchema)
  }
}
