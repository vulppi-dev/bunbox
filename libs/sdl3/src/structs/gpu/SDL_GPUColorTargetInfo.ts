import { SDL_GPULoadOp, SDL_GPUStoreOp } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_FColor } from '../pixels/SDL_FColor'
import { SDL_GPUTextureCreateInfo } from './SDL_GPUTextureCreateInfo'

const SDL_GPUColorTargetInfoSchema = {
  texture: {
    order: 0,
    type: 'struct',
    schema: SDL_GPUTextureCreateInfo,
  } /**< The texture that will be used as a color target by a render pass. */,
  mip_level: {
    order: 1,
    type: 'u32',
  } /**< The mip level to use as a color target. */,
  layer_or_depth_plane: {
    order: 2,
    type: 'u32',
  } /**< The layer index or depth plane to use as a color target. This value is treated as a layer index on 2D array and cube textures, and as a depth plane on 3D textures. */,
  clear_color: {
    order: 3,
    type: 'struct',
    schema: SDL_FColor,
    isInline: true,
  } /**< The color to clear the color target to at the start of the render pass. Ignored if SDL_GPU_LOADOP_CLEAR is not used. */,
  load_op: {
    order: 4,
    type: 'enum',
    enum: SDL_GPULoadOp,
  } /**< What is done with the contents of the color target at the beginning of the render pass. */,
  store_op: {
    order: 5,
    type: 'enum',
    enum: SDL_GPUStoreOp,
  } /**< What is done with the results of the render pass. */,
  resolve_texture: {
    order: 6,
    type: 'struct',
    schema: SDL_GPUTextureCreateInfo,
  } /**< The texture that will receive the results of a multisample resolve operation. Ignored if a RESOLVE* store_op is not used. */,
  resolve_mip_level: {
    order: 7,
    type: 'u32',
  } /**< The mip level of the resolve texture to use for the resolve operation. Ignored if a RESOLVE* store_op is not used. */,
  resolve_layer: {
    order: 8,
    type: 'u32',
  } /**< The layer index of the resolve texture to use for the resolve operation. Ignored if a RESOLVE* store_op is not used. */,
  cycle: {
    order: 9,
    type: 'boolean',
  } /**< true cycles the texture if the texture is bound and load_op is not LOAD */,
  cycle_resolve_texture: {
    order: 10,
    type: 'boolean',
  } /**< true cycles the resolve texture if the resolve texture is bound. Ignored if a RESOLVE* store_op is not used. */,
  padding1: { order: 11, type: 'u8' },
  padding2: { order: 12, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUColorTargetInfo
 */
export class SDL_GPUColorTargetInfo extends BunStruct<
  typeof SDL_GPUColorTargetInfoSchema
> {
  constructor() {
    super(SDL_GPUColorTargetInfoSchema)
  }
}
