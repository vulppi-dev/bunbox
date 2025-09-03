import { SDL_GPUVertexInputRate } from '../../enum/gpu';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUVertexBufferDescriptionSchema = {
  slot: {
    order: 0,
    type: 'u32',
  } /**< The binding slot of the vertex buffer. */,
  pitch: {
    order: 1,
    type: 'u32',
  } /**< The size of a single element + the offset between elements. */,
  input_rate: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUVertexInputRate,
  } /**< Whether attribute addressing is a function of the vertex index or instance index. */,
  instance_step_rate: {
    order: 3,
    type: 'u32',
  } /**< Reserved for future use. Must be set to 0. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUVertexBufferDescription
 */
export class SDL_GPUVertexBufferDescription extends BunStruct<
  typeof SDL_GPUVertexBufferDescriptionSchema
> {
  constructor() {
    super(SDL_GPUVertexBufferDescriptionSchema);
  }
}
