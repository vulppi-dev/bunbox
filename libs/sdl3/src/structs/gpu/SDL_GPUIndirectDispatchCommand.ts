import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUIndirectDispatchCommandSchema = {
  groupcount_x: {
    order: 0,
    type: 'u32',
  } /**< The number of local workgroups to dispatch in the X dimension. */,
  groupcount_y: {
    order: 1,
    type: 'u32',
  } /**< The number of local workgroups to dispatch in the Y dimension. */,
  groupcount_z: {
    order: 2,
    type: 'u32',
  } /**< The number of local workgroups to dispatch in the Z dimension. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUIndirectDispatchCommand
 */
export class SDL_GPUIndirectDispatchCommand extends BunStruct<
  typeof SDL_GPUIndirectDispatchCommandSchema
> {
  constructor() {
    super(SDL_GPUIndirectDispatchCommandSchema)
  }
}
