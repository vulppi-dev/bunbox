import { BunStruct, type StructSchema } from '../_struct'

export const SDL_GPUTransferBufferLocationSchema = {
  transfer_buffer: {
    order: 0,
    type: 'void',
  } /**< The transfer buffer used in the transfer operation. */,
  offset: {
    order: 1,
    type: 'u32',
  } /**< The starting byte of the buffer data in the transfer buffer. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTransferBufferLocation
 */
export class SDL_GPUTransferBufferLocation extends BunStruct<
  typeof SDL_GPUTransferBufferLocationSchema
> {
  constructor() {
    super(SDL_GPUTransferBufferLocationSchema)
  }
}
