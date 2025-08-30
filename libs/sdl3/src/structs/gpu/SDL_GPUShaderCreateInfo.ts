import { SDL_GPUShaderStage } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUShaderCreateInfoSchema = {
  code_size: {
    order: 0,
    type: 'u64',
  } /**< The size in bytes of the code pointed to. */,
  code: {
    order: 1,
    type: 'array',
    to: 'u8',
  } /**< A pointer to shader code. */,
  entrypoint: {
    order: 2,
    type: 'string',
  } /**< A pointer to a null-terminated UTF-8 string specifying the entry point function name for the shader. */,
  format: { order: 3, type: 'u32' } /**< The format of the shader code. */,
  stage: {
    order: 4,
    type: 'enum',
    enum: SDL_GPUShaderStage,
  } /**< The stage the shader program corresponds to. */,
  num_samplers: {
    order: 5,
    type: 'u32',
  } /**< The number of samplers defined in the shader. */,
  num_storage_textures: {
    order: 6,
    type: 'u32',
  } /**< The number of storage textures defined in the shader. */,
  num_storage_buffers: {
    order: 7,
    type: 'u32',
  } /**< The number of storage buffers defined in the shader. */,
  num_uniform_buffers: {
    order: 8,
    type: 'u32',
  } /**< The number of uniform buffers defined in the shader. */,
  props: {
    order: 9,
    type: 'u64',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUShaderCreateInfo
 */
export class SDL_GPUShaderCreateInfo extends BunStruct<
  typeof SDL_GPUShaderCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUShaderCreateInfoSchema)
  }
}
