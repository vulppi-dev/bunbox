import { SDL_GPULoadOp, SDL_GPUStoreOp } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUDepthStencilTargetInfoSchema = {
  texture: {
    order: 0,
    type: 'void',
  } /**< The texture that will be used as the depth stencil target by the render pass. */,
  clear_depth: {
    order: 1,
    type: 'f32',
  } /**< The value to clear the depth component to at the beginning of the render pass. Ignored if SDL_GPU_LOADOP_CLEAR is not used. */,
  load_op: {
    order: 2,
    type: 'enum',
    enum: SDL_GPULoadOp,
  } /**< What is done with the depth contents at the beginning of the render pass. */,
  store_op: {
    order: 3,
    type: 'enum',
    enum: SDL_GPUStoreOp,
  } /**< What is done with the depth results of the render pass. */,
  stencil_load_op: {
    order: 4,
    type: 'enum',
    enum: SDL_GPULoadOp,
  } /**< What is done with the stencil contents at the beginning of the render pass. */,
  stencil_store_op: {
    order: 5,
    type: 'enum',
    enum: SDL_GPUStoreOp,
  } /**< What is done with the stencil results of the render pass. */,
  cycle: {
    order: 6,
    type: 'boolean',
  } /**< true cycles the texture if the texture is bound and any load ops are not LOAD */,
  clear_stencil: {
    order: 7,
    type: 'u8',
  } /**< The value to clear the stencil component to at the beginning of the render pass. Ignored if SDL_GPU_LOADOP_CLEAR is not used. */,
  padding1: { order: 8, type: 'u8' },
  padding2: { order: 9, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUDepthStencilTargetInfo
 */
export class SDL_GPUDepthStencilTargetInfo extends BunStruct<
  typeof SDL_GPUDepthStencilTargetInfoSchema
> {
  constructor() {
    super(SDL_GPUDepthStencilTargetInfoSchema)
  }
}
