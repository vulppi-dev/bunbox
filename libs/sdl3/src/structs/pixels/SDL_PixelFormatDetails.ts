import { SDL_PixelFormat } from '../../enum/pixels';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_PixelFormatDetailsSchema = {
  format: { order: 0, type: 'enum', enum: SDL_PixelFormat },
  bits_per_pixel: { order: 1, type: 'u8' },
  bytes_per_pixel: { order: 2, type: 'u8' },
  padding: { order: 3, type: 'array', to: 'u8', length: 2 },
  Rmask: { order: 4, type: 'u32' },
  Gmask: { order: 5, type: 'u32' },
  Bmask: { order: 6, type: 'u32' },
  Amask: { order: 7, type: 'u32' },
  Rbits: { order: 8, type: 'u8' },
  Gbits: { order: 9, type: 'u8' },
  Bbits: { order: 10, type: 'u8' },
  Abits: { order: 11, type: 'u8' },
  Rshift: { order: 12, type: 'u8' },
  Gshift: { order: 13, type: 'u8' },
  Bshift: { order: 14, type: 'u8' },
  Ashift: { order: 15, type: 'u8' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PixelFormatDetails
 */
export class SDL_PixelFormatDetails extends BunStruct<
  typeof SDL_PixelFormatDetailsSchema
> {
  constructor() {
    super(SDL_PixelFormatDetailsSchema);
  }
}
