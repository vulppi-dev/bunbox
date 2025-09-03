import { BunStruct, type StructSchema } from '../_struct';

const SDL_AtomicIntSchema = {
  value: { order: 0, type: 'i32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_AtomicInt
 */
export class SDL_AtomicInt extends BunStruct<typeof SDL_AtomicIntSchema> {
  constructor() {
    super(SDL_AtomicIntSchema);
  }
}
