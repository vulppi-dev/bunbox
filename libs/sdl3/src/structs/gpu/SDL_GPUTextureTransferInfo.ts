import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUTextureTransferInfoSchema = {
  transfer_buffer: {
    order: 0,
    type: 'void',
  } /**< The transfer buffer used in the transfer operation. */,
  offset: {
    order: 1,
    type: 'u32',
  } /**< The starting byte of the image data in the transfer buffer. */,
  pixels_per_row: {
    order: 2,
    type: 'u32',
  } /**< The number of pixels from one row to the next. */,
  rows_per_layer: {
    order: 3,
    type: 'u32',
  } /**< The number of rows from one layer/depth-slice to the next. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureTransferInfo
 */
export class SDL_GPUTextureTransferInfo extends BunStruct<
  typeof SDL_GPUTextureTransferInfoSchema
> {
  constructor() {
    super(SDL_GPUTextureTransferInfoSchema)
  }
}
