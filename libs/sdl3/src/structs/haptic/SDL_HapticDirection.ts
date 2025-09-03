import { BunStruct, type StructSchema } from '../_struct';

const SDL_HapticDirectionSchema = {
  type: { order: 0, type: 'u16' } /**< The type of encoding. */,
  dir: {
    order: 1,
    type: 'array',
    to: 'i32',
    length: 3,
  } /**< The encoded direction. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticDirection
 */
export class SDL_HapticDirection extends BunStruct<
  typeof SDL_HapticDirectionSchema
> {
  constructor() {
    super(SDL_HapticDirectionSchema);
  }
}
