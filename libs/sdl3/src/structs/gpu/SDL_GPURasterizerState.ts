import {
  SDL_GPUCullMode,
  SDL_GPUFillMode,
  SDL_GPUFrontFace,
} from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPURasterizerStateSchema = {
  fill_mode: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUFillMode,
  } /**< Whether polygons will be filled in or drawn as lines. */,
  cull_mode: {
    order: 1,
    type: 'enum',
    enum: SDL_GPUCullMode,
  } /**< The facing direction in which triangles will be culled. */,
  front_face: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUFrontFace,
  } /**< The vertex winding that will cause a triangle to be determined as front-facing. */,
  depth_bias_constant_factor: {
    order: 3,
    type: 'f32',
  } /**< A scalar factor controlling the depth value added to each fragment. */,
  depth_bias_clamp: {
    order: 4,
    type: 'f32',
  } /**< The maximum depth bias of a fragment. */,
  depth_bias_slope_factor: {
    order: 5,
    type: 'f32',
  } /**< A scalar factor applied to a fragment's slope in depth calculations. */,
  enable_depth_bias: {
    order: 6,
    type: 'boolean',
  } /**< true to bias fragment depth values. */,
  enable_depth_clip: {
    order: 7,
    type: 'boolean',
  } /**< true to enable depth clip, false to enable depth clamp. */,
  padding1: { order: 8, type: 'u8' },
  padding2: { order: 9, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPURasterizerState
 */
export class SDL_GPURasterizerState extends BunStruct<
  typeof SDL_GPURasterizerStateSchema
> {
  constructor() {
    super(SDL_GPURasterizerStateSchema)
  }
}
