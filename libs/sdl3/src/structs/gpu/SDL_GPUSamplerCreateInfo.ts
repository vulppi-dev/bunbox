import {
  SDL_GPUCompareOp,
  SDL_GPUFilter,
  SDL_GPUSamplerAddressMode,
  SDL_GPUSamplerMipmapMode,
} from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUSamplerCreateInfoSchema = {
  min_filter: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUFilter,
  } /**< The minification filter to apply to lookups. */,
  mag_filter: {
    order: 1,
    type: 'enum',
    enum: SDL_GPUFilter,
  } /**< The magnification filter to apply to lookups. */,
  mipmap_mode: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUSamplerMipmapMode,
  } /**< The mipmap filter to apply to lookups. */,
  address_mode_u: {
    order: 3,
    type: 'enum',
    enum: SDL_GPUSamplerAddressMode,
  } /**< The addressing mode for U coordinates outside [0, 1). */,
  address_mode_v: {
    order: 4,
    type: 'enum',
    enum: SDL_GPUSamplerAddressMode,
  } /**< The addressing mode for V coordinates outside [0, 1). */,
  address_mode_w: {
    order: 5,
    type: 'enum',
    enum: SDL_GPUSamplerAddressMode,
  } /**< The addressing mode for W coordinates outside [0, 1). */,
  mip_lod_bias: {
    order: 6,
    type: 'f32',
  } /**< The bias to be added to mipmap LOD calculation. */,
  max_anisotropy: {
    order: 7,
    type: 'f32',
  } /**< The anisotropy value clamp used by the sampler. If enable_anisotropy is false, this is ignored. */,
  compare_op: {
    order: 8,
    type: 'enum',
    enum: SDL_GPUCompareOp,
  } /**< The comparison operator to apply to fetched data before filtering. */,
  min_lod: {
    order: 9,
    type: 'f32',
  } /**< Clamps the minimum of the computed LOD value. */,
  max_lod: {
    order: 10,
    type: 'f32',
  } /**< Clamps the maximum of the computed LOD value. */,
  enable_anisotropy: {
    order: 11,
    type: 'boolean',
  } /**< true to enable anisotropic filtering. */,
  enable_compare: {
    order: 12,
    type: 'boolean',
  } /**< true to enable comparison against a reference value during lookups. */,
  padding1: { order: 13, type: 'u8' },
  padding2: { order: 14, type: 'u8' },
  props: {
    order: 15,
    type: 'u64',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUSamplerCreateInfo
 */
export class SDL_GPUSamplerCreateInfo extends BunStruct<
  typeof SDL_GPUSamplerCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUSamplerCreateInfoSchema)
  }
}
