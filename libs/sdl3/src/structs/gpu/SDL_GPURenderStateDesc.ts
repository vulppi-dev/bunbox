import { BunStruct, type StructSchema } from '../_struct'
import { SDL_GPUTextureSamplerBinding } from './SDL_GPUTextureSamplerBinding'

const SDL_GPURenderStateDescSchema = {
  version: { order: 0, type: 'u32' } /**< the version of this interface */,
  fragment_shader: {
    order: 1,
    type: 'void',
  } /**< The fragment shader to use when this render state is active */,
  num_sampler_bindings: {
    order: 2,
    type: 'i32',
  } /**< The number of additional fragment samplers to bind when this render state is active */,
  sampler_bindings: {
    order: 3,
    type: 'struct',
    schema: SDL_GPUTextureSamplerBinding,
  } /**< Additional fragment samplers to bind when this render state is active */,
  num_storage_textures: {
    order: 4,
    type: 'i32',
  } /**< The number of storage textures to bind when this render state is active */,
  storage_textures: {
    order: 5,
    type: 'void',
  } /**< Storage textures to bind when this render state is active */,
  num_storage_buffers: {
    order: 6,
    type: 'i32',
  } /**< The number of storage buffers to bind when this render state is active */,
  storage_buffers: {
    order: 7,
    type: 'void',
  } /**< Storage buffers to bind when this render state is active */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPURenderStateDesc
 */
export class SDL_GPURenderStateDesc extends BunStruct<
  typeof SDL_GPURenderStateDescSchema
> {
  constructor() {
    super(SDL_GPURenderStateDescSchema)
  }
}
