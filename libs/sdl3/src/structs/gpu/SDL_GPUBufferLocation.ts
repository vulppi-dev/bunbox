import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUBufferLocationSchema = {
  buffer: { order: 0, type: 'void' } /**< The buffer. */,
  offset: {
    order: 1,
    type: 'u32',
  } /**< The starting byte within the buffer. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBufferLocation
 */
export class SDL_GPUBufferLocation extends BunStruct<
  typeof SDL_GPUBufferLocationSchema
> {
  constructor() {
    super(SDL_GPUBufferLocationSchema)
  }
}
