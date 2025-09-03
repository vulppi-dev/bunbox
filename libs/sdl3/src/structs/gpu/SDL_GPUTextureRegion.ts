import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUTextureRegionSchema = {
  texture: {
    order: 0,
    type: 'void',
  } /**< The texture used in the copy operation. */,
  mip_level: {
    order: 1,
    type: 'u32',
  } /**< The mip level index to transfer. */,
  layer: { order: 2, type: 'u32' } /**< The layer index to transfer. */,
  x: { order: 3, type: 'u32' } /**< The left offset of the region. */,
  y: { order: 4, type: 'u32' } /**< The top offset of the region. */,
  z: { order: 5, type: 'u32' } /**< The front offset of the region. */,
  w: { order: 6, type: 'u32' } /**< The width of the region. */,
  h: { order: 7, type: 'u32' } /**< The height of the region. */,
  d: { order: 8, type: 'u32' } /**< The depth of the region. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureRegion
 */
export class SDL_GPUTextureRegion extends BunStruct<
  typeof SDL_GPUTextureRegionSchema
> {
  constructor() {
    super(SDL_GPUTextureRegionSchema);
  }
}
