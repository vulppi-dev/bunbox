import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUBlitRegionSchema = {
  texture: { order: 0, type: 'void' } /**< The texture. */,
  mip_level: {
    order: 1,
    type: 'u32',
  } /**< The mip level index of the region. */,
  layer_or_depth_plane: {
    order: 2,
    type: 'u32',
  } /**< The layer index or depth plane of the region. This value is treated as a layer index on 2D array and cube textures, and as a depth plane on 3D textures. */,
  x: { order: 3, type: 'u32' } /**< The left offset of the region. */,
  y: { order: 4, type: 'u32' } /**< The top offset of the region. */,
  w: { order: 5, type: 'u32' } /**< The width of the region. */,
  h: { order: 6, type: 'u32' } /**< The height of the region. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBlitRegion
 */
export class SDL_GPUBlitRegion extends BunStruct<
  typeof SDL_GPUBlitRegionSchema
> {
  constructor() {
    super(SDL_GPUBlitRegionSchema)
  }
}
