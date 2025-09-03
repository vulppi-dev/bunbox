import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUTextureLocationSchema = {
  texture: {
    order: 0,
    type: 'void',
  } /**< The texture used in the copy operation. */,
  mip_level: {
    order: 1,
    type: 'u32',
  } /**< The mip level index of the location. */,
  layer: { order: 2, type: 'u32' } /**< The layer index of the location. */,
  x: { order: 3, type: 'u32' } /**< The left offset of the location. */,
  y: { order: 4, type: 'u32' } /**< The top offset of the location. */,
  z: { order: 5, type: 'u32' } /**< The front offset of the location. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureLocation
 */
export class SDL_GPUTextureLocation extends BunStruct<
  typeof SDL_GPUTextureLocationSchema
> {
  constructor() {
    super(SDL_GPUTextureLocationSchema)
  }
}
