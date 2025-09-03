import { BunStruct, type StructSchema } from '../_struct';

const SDL_FPointSchema = {
  x: { order: 0, type: 'f32' },
  y: { order: 1, type: 'f32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_FPoint
 */
export class SDL_FPoint extends BunStruct<typeof SDL_FPointSchema> {
  constructor() {
    super(SDL_FPointSchema);
  }
}
