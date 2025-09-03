import { BunStruct, type StructSchema } from '../_struct';
import { SDL_Color } from './SDL_Color';

const SDL_PaletteSchema = {
  ncolors: { order: 0, type: 'i32' },
  colors: { order: 1, type: 'struct', schema: SDL_Color },
  version: { order: 2, type: 'u32' },
  refcount: { order: 3, type: 'i32' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Palette
 */
export class SDL_Palette extends BunStruct<typeof SDL_PaletteSchema> {
  constructor() {
    super(SDL_PaletteSchema);
  }
}
