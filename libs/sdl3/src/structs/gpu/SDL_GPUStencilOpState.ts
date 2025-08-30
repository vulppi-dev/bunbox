import { SDL_GPUCompareOp, SDL_GPUStencilOp } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUStencilOpStateSchema = {
  fail_op: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUStencilOp,
  } /**< The action performed on samples that fail the stencil test. */,
  pass_op: {
    order: 1,
    type: 'enum',
    enum: SDL_GPUStencilOp,
  } /**< The action performed on samples that pass the depth and stencil tests. */,
  depth_fail_op: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUStencilOp,
  } /**< The action performed on samples that pass the stencil test and fail the depth test. */,
  compare_op: {
    order: 3,
    type: 'enum',
    enum: SDL_GPUCompareOp,
  } /**< The comparison operator used in the stencil test. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUStencilOpState
 */
export class SDL_GPUStencilOpState extends BunStruct<
  typeof SDL_GPUStencilOpStateSchema
> {
  constructor() {
    super(SDL_GPUStencilOpStateSchema)
  }
}
