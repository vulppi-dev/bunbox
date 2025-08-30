import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUIndexedIndirectDrawCommandSchema = {
  num_indices: {
    order: 0,
    type: 'u32',
  } /**< The number of indices to draw per instance. */,
  num_instances: {
    order: 1,
    type: 'u32',
  } /**< The number of instances to draw. */,
  first_index: {
    order: 2,
    type: 'u32',
  } /**< The base index within the index buffer. */,
  vertex_offset: {
    order: 3,
    type: 'i32',
  } /**< The value added to the vertex index before indexing into the vertex buffer. */,
  first_instance: {
    order: 4,
    type: 'u32',
  } /**< The ID of the first instance to draw. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUIndexedIndirectDrawCommand
 */
export class SDL_GPUIndexedIndirectDrawCommand extends BunStruct<
  typeof SDL_GPUIndexedIndirectDrawCommandSchema
> {
  constructor() {
    super(SDL_GPUIndexedIndirectDrawCommandSchema)
  }
}
