import {
  SDL_GPUSampleCount,
  SDL_GPUTextureFormat,
  SDL_GPUTextureType,
} from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUTextureCreateInfoSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUTextureType,
  } /**< The base dimensionality of the texture. */,
  format: {
    order: 1,
    type: 'enum',
    enum: SDL_GPUTextureFormat,
  } /**< The pixel format of the texture. */,
  usage: {
    order: 2,
    type: 'u32',
  } /**< How the texture is intended to be used by the client. */,
  width: { order: 3, type: 'u32' } /**< The width of the texture. */,
  height: { order: 4, type: 'u32' } /**< The height of the texture. */,
  layer_count_or_depth: {
    order: 5,
    type: 'u32',
  } /**< The layer count or depth of the texture. This value is treated as a layer count on 2D array textures, and as a depth value on 3D textures. */,
  num_levels: {
    order: 6,
    type: 'u32',
  } /**< The number of mip levels in the texture. */,
  sample_count: {
    order: 7,
    type: 'enum',
    enum: SDL_GPUSampleCount,
  } /**< The number of samples per texel. Only applies if the texture is used as a render target. */,
  props: {
    order: 8,
    type: 'u64',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureCreateInfo
 */
export class SDL_GPUTextureCreateInfo extends BunStruct<
  typeof SDL_GPUTextureCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUTextureCreateInfoSchema)
  }
}
