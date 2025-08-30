import { SDL_GPUTextureFormat } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_GPUColorTargetBlendState } from './SDL_GPUColorTargetBlendState'

export const SDL_GPUColorTargetDescriptionSchema = {
  format: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUTextureFormat,
  } /**< The pixel format of the texture to be used as a color target. */,
  blend_state: {
    order: 1,
    type: 'struct',
    schema: SDL_GPUColorTargetBlendState,
    isInline: true,
  } /**< The blend state to be used for the color target. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUColorTargetDescription
 */
export class SDL_GPUColorTargetDescription extends BunStruct<
  typeof SDL_GPUColorTargetDescriptionSchema
> {
  constructor() {
    super(SDL_GPUColorTargetDescriptionSchema)
  }
}
