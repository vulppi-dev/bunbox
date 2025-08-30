import { SDL_GPUBlendFactor, SDL_GPUBlendOp } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUColorTargetBlendStateSchema = {
  src_color_blendfactor: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUBlendFactor,
  } /**< The value to be multiplied by the source RGB value. */,
  dst_color_blendfactor: {
    order: 1,
    type: 'enum',
    enum: SDL_GPUBlendFactor,
  } /**< The value to be multiplied by the destination RGB value. */,
  color_blend_op: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUBlendOp,
  } /**< The blend operation for the RGB components. */,
  src_alpha_blendfactor: {
    order: 3,
    type: 'enum',
    enum: SDL_GPUBlendFactor,
  } /**< The value to be multiplied by the source alpha. */,
  dst_alpha_blendfactor: {
    order: 4,
    type: 'enum',
    enum: SDL_GPUBlendFactor,
  } /**< The value to be multiplied by the destination alpha. */,
  alpha_blend_op: {
    order: 5,
    type: 'enum',
    enum: SDL_GPUBlendOp,
  } /**< The blend operation for the alpha component. */,
  color_write_mask: {
    order: 6,
    type: 'u8',
  } /**< A bitmask specifying which of the RGBA components are enabled for writing. Writes to all channels if enable_color_write_mask is false. */,
  enable_blend: {
    order: 7,
    type: 'boolean',
  } /**< Whether blending is enabled for the color target. */,
  enable_color_write_mask: {
    order: 8,
    type: 'boolean',
  } /**< Whether the color write mask is enabled. */,
  padding1: { order: 9, type: 'u8' },
  padding2: { order: 10, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUColorTargetBlendState
 */
export class SDL_GPUColorTargetBlendState extends BunStruct<
  typeof SDL_GPUColorTargetBlendStateSchema
> {
  constructor() {
    super(SDL_GPUColorTargetBlendStateSchema)
  }
}
