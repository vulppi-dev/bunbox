import { SDL_GPUCompareOp } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_GPUStencilOpState } from './SDL_GPUStencilOpState'

export const SDL_GPUDepthStencilStateSchema = {
  compare_op: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUCompareOp,
  } /**< The comparison operator used for depth testing. */,
  back_stencil_state: {
    order: 1,
    type: 'struct',
    schema: SDL_GPUStencilOpState,
    isInline: true,
  } /**< The stencil op state for back-facing triangles. */,
  front_stencil_state: {
    order: 2,
    type: 'struct',
    schema: SDL_GPUStencilOpState,
    isInline: true,
  } /**< The stencil op state for front-facing triangles. */,
  compare_mask: {
    order: 3,
    type: 'u8',
  } /**< Selects the bits of the stencil values participating in the stencil test. */,
  write_mask: {
    order: 4,
    type: 'u8',
  } /**< Selects the bits of the stencil values updated by the stencil test. */,
  enable_depth_test: {
    order: 5,
    type: 'boolean',
  } /**< true enables the depth test. */,
  enable_depth_write: {
    order: 6,
    type: 'boolean',
  } /**< true enables depth writes. Depth writes are always disabled when enable_depth_test is false. */,
  enable_stencil_test: {
    order: 7,
    type: 'boolean',
  } /**< true enables the stencil test. */,
  padding1: { order: 8, type: 'u8' },
  padding2: { order: 9, type: 'u8' },
  padding3: { order: 10, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUDepthStencilState
 */
export class SDL_GPUDepthStencilState extends BunStruct<
  typeof SDL_GPUDepthStencilStateSchema
> {
  constructor() {
    super(SDL_GPUDepthStencilStateSchema)
  }
}
