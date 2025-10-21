import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUVertexInputStateSchema = {
  vertex_buffer_descriptions: {
    order: 0,
    type: 'array',
    to: 'void',
  } /**< A pointer to an array of vertex buffer descriptions. */,
  num_vertex_buffers: {
    order: 1,
    type: 'u32',
  } /**< The number of vertex buffer descriptions in the above array. */,
  vertex_attributes: {
    order: 2,
    type: 'array',
    to: 'void',
  } /**< A pointer to an array of vertex attribute descriptions. */,
  num_vertex_attributes: {
    order: 3,
    type: 'u32',
  } /**< The number of vertex attribute descriptions in the above array. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUVertexInputState
 */
export class SDL_GPUVertexInputState extends BunStruct<
  typeof SDL_GPUVertexInputStateSchema
> {
  constructor() {
    super(SDL_GPUVertexInputStateSchema);
  }
}
