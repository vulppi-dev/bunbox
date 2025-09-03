import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUComputePipelineCreateInfoSchema = {
  code_size: {
    order: 0,
    type: 'u64',
  } /**< The size in bytes of the compute shader code pointed to. */,
  code: {
    order: 1,
    type: 'array',
    to: 'u8',
  } /**< A pointer to compute shader code. */,
  entrypoint: {
    order: 2,
    type: 'string',
  } /**< A pointer to a null-terminated UTF-8 string specifying the entry point function name for the shader. */,
  format: {
    order: 3,
    type: 'u32',
  } /**< The format of the compute shader code. */,
  num_samplers: {
    order: 4,
    type: 'u32',
  } /**< The number of samplers defined in the shader. */,
  num_readonly_storage_textures: {
    order: 5,
    type: 'u32',
  } /**< The number of readonly storage textures defined in the shader. */,
  num_readonly_storage_buffers: {
    order: 6,
    type: 'u32',
  } /**< The number of readonly storage buffers defined in the shader. */,
  num_readwrite_storage_textures: {
    order: 7,
    type: 'u32',
  } /**< The number of read-write storage textures defined in the shader. */,
  num_readwrite_storage_buffers: {
    order: 8,
    type: 'u32',
  } /**< The number of read-write storage buffers defined in the shader. */,
  num_uniform_buffers: {
    order: 9,
    type: 'u32',
  } /**< The number of uniform buffers defined in the shader. */,
  threadcount_x: {
    order: 10,
    type: 'u32',
  } /**< The number of threads in the X dimension. This should match the value in the shader. */,
  threadcount_y: {
    order: 11,
    type: 'u32',
  } /**< The number of threads in the Y dimension. This should match the value in the shader. */,
  threadcount_z: {
    order: 12,
    type: 'u32',
  } /**< The number of threads in the Z dimension. This should match the value in the shader. */,
  props: {
    order: 13,
    type: 'u64',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUComputePipelineCreateInfo
 */
export class SDL_GPUComputePipelineCreateInfo extends BunStruct<
  typeof SDL_GPUComputePipelineCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUComputePipelineCreateInfoSchema)
  }
}
