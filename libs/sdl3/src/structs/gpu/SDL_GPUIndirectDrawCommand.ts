import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUIndirectDrawCommandSchema = {
  num_vertices: {
    order: 0,
    type: 'u32',
  } /**< The number of vertices to draw. */,
  num_instances: {
    order: 1,
    type: 'u32',
  } /**< The number of instances to draw. */,
  first_vertex: {
    order: 2,
    type: 'u32',
  } /**< The index of the first vertex to draw. */,
  first_instance: {
    order: 3,
    type: 'u32',
  } /**< The ID of the first instance to draw. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUIndirectDrawCommand
 */
export class SDL_GPUIndirectDrawCommand extends BunStruct<
  typeof SDL_GPUIndirectDrawCommandSchema
> {
  constructor() {
    super(SDL_GPUIndirectDrawCommandSchema)
  }
}
