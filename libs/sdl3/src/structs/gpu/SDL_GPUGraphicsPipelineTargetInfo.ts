import { SDL_GPUTextureFormat } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_GPUColorTargetDescription } from './SDL_GPUColorTargetDescription'

const SDL_GPUGraphicsPipelineTargetInfoSchema = {
  color_target_descriptions: {
    order: 0,
    type: 'struct',
    schema: SDL_GPUColorTargetDescription,
  } /**< A pointer to an array of color target descriptions. */,
  num_color_targets: {
    order: 1,
    type: 'u32',
  } /**< The number of color target descriptions in the above array. */,
  depth_stencil_format: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUTextureFormat,
  } /**< The pixel format of the depth-stencil target. Ignored if has_depth_stencil_target is false. */,
  has_depth_stencil_target: {
    order: 3,
    type: 'boolean',
  } /**< true specifies that the pipeline uses a depth-stencil target. */,
  padding1: { order: 4, type: 'u8' },
  padding2: { order: 5, type: 'u8' },
  padding3: { order: 6, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUGraphicsPipelineTargetInfo
 */
export class SDL_GPUGraphicsPipelineTargetInfo extends BunStruct<
  typeof SDL_GPUGraphicsPipelineTargetInfoSchema
> {
  constructor() {
    super(SDL_GPUGraphicsPipelineTargetInfoSchema)
  }
}
