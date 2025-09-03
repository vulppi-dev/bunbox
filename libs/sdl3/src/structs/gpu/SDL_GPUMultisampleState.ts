import { SDL_GPUSampleCount } from '../../enum/gpu';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUMultisampleStateSchema = {
  sample_count: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUSampleCount,
  } /**< The number of samples to be used in rasterization. */,
  sample_mask: {
    order: 1,
    type: 'u32',
  } /**< Reserved for future use. Must be set to 0. */,
  enable_mask: {
    order: 2,
    type: 'boolean',
  } /**< Reserved for future use. Must be set to false. */,
  enable_alpha_to_coverage: {
    order: 3,
    type: 'boolean',
  } /**< true enables the alpha-to-coverage feature. */,
  padding2: {
    order: 4,
    type: 'u8',
  },
  padding3: {
    order: 5,
    type: 'u8',
  },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUMultisampleState
 */
export class SDL_GPUMultisampleState extends BunStruct<
  typeof SDL_GPUMultisampleStateSchema
> {
  constructor() {
    super(SDL_GPUMultisampleStateSchema);
  }
}
