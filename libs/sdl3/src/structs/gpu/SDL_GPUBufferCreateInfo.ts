import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUBufferCreateInfoSchema = {
  usage: {
    order: 0,
    type: 'u32',
  } /**< How the buffer is intended to be used by the client. */,
  size: { order: 1, type: 'u32' } /**< The size in bytes of the buffer. */,
  props: {
    order: 2,
    type: 'u32',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBufferCreateInfo
 */
export class SDL_GPUBufferCreateInfo extends BunStruct<
  typeof SDL_GPUBufferCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUBufferCreateInfoSchema)
  }
}
