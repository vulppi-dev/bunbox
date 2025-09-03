import { SDL_PixelFormat } from '../../enum/pixels';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_DisplayModeSchema = {
  displayID: { order: 0, type: 'u32' },
  format: { order: 1, type: 'enum', enum: SDL_PixelFormat },
  w: { order: 2, type: 'i32' },
  h: { order: 3, type: 'i32' },
  pixel_density: { order: 4, type: 'f32' },
  refresh_rate: { order: 5, type: 'f32' },
  refresh_rate_numerator: { order: 6, type: 'i32' },
  refresh_rate_denominator: { order: 7, type: 'i32' },
  internal: { order: 8, type: 'void' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_DisplayMode
 */
export class SDL_DisplayMode extends BunStruct<typeof SDL_DisplayModeSchema> {
  constructor() {
    super(SDL_DisplayModeSchema);
  }
}
