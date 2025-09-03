import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUBufferRegionSchema = {
  buffer: { order: 0, type: 'void' } /**< The buffer. */,
  offset: {
    order: 1,
    type: 'u32',
  } /**< The starting byte within the buffer. */,
  size: {
    order: 2,
    type: 'u32',
  } /**< The size in bytes of the region. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBufferRegion
 */
export class SDL_GPUBufferRegion extends BunStruct<
  typeof SDL_GPUBufferRegionSchema
> {
  constructor() {
    super(SDL_GPUBufferRegionSchema);
  }
}
