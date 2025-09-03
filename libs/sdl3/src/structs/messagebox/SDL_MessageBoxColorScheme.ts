import { BunStruct, type StructSchema } from '../_struct';
import { SDL_MessageBoxColor } from './SDL_MessageBoxColor';

const SDL_MessageBoxColorSchemeSchema = {
  colors0: {
    order: 0,
    type: 'struct',
    schema: SDL_MessageBoxColor,
    isInline: true,
  },
  colors1: {
    order: 1,
    type: 'struct',
    schema: SDL_MessageBoxColor,
    isInline: true,
  },
  colors2: {
    order: 2,
    type: 'struct',
    schema: SDL_MessageBoxColor,
    isInline: true,
  },
  colors3: {
    order: 3,
    type: 'struct',
    schema: SDL_MessageBoxColor,
    isInline: true,
  },
  colors4: {
    order: 4,
    type: 'struct',
    schema: SDL_MessageBoxColor,
    isInline: true,
  },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MessageBoxColorScheme
 */
export class SDL_MessageBoxColorScheme extends BunStruct<
  typeof SDL_MessageBoxColorSchemeSchema
> {
  constructor() {
    super(SDL_MessageBoxColorSchemeSchema);
  }
}
