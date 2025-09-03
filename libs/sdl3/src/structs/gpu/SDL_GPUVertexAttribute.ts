import { SDL_GPUVertexElementFormat } from '../../enum/gpu'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUVertexAttributeSchema = {
  location: {
    order: 0,
    type: 'u32',
  } /**< The shader input location index. */,
  buffer_slot: {
    order: 1,
    type: 'u32',
  } /**< The binding slot of the associated vertex buffer. */,
  format: {
    order: 2,
    type: 'enum',
    enum: SDL_GPUVertexElementFormat,
  } /**< The size and type of the attribute data. */,
  offset: {
    order: 3,
    type: 'u32',
  } /**< The byte offset of this attribute relative to the start of the vertex element. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUVertexAttribute
 */
export class SDL_GPUVertexAttribute extends BunStruct<
  typeof SDL_GPUVertexAttributeSchema
> {
  constructor() {
    super(SDL_GPUVertexAttributeSchema)
  }
}
