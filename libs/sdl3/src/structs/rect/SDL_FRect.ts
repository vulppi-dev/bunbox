import { BunStruct, type StructSchema } from '../_struct';

const SDL_FRectSchema = {
  x: { order: 0, type: 'f32' },
  y: { order: 1, type: 'f32' },
  w: { order: 2, type: 'f32' },
  h: { order: 3, type: 'f32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FRect
 */
export class SDL_FRect extends BunStruct<typeof SDL_FRectSchema> {
  constructor() {
    super(SDL_FRectSchema);
  }
}
