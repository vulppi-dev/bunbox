import { BunStruct, type StructSchema } from '../_struct'
import { SDL_FColor } from '../pixels/SDL_FColor'
import { SDL_FPoint } from '../rect/SDL_FPoint'

export const SDL_VertexSchema = {
  position: {
    order: 0,
    type: 'struct',
    schema: SDL_FPoint,
    isInline: true,
  } /**< Vertex position, in SDL_Renderer coordinates  */,
  color: {
    order: 1,
    type: 'struct',
    schema: SDL_FColor,
    isInline: true,
  } /**< Vertex color */,
  tex_coord: {
    order: 2,
    type: 'struct',
    schema: SDL_FPoint,
    isInline: true,
  } /**< Normalized texture coordinates, if needed */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Vertex
 */
export class SDL_Vertex extends BunStruct<typeof SDL_VertexSchema> {
  constructor() {
    super(SDL_VertexSchema)
  }
}
