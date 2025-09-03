import { SDL_GPUTransferBufferUsage } from '../../enum/gpu';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUTransferBufferCreateInfoSchema = {
  usage: {
    order: 0,
    type: 'enum',
    enum: SDL_GPUTransferBufferUsage,
  } /**< How the transfer buffer is intended to be used by the client. */,
  size: {
    order: 1,
    type: 'u32',
  } /**< The size in bytes of the transfer buffer. */,
  props: {
    order: 2,
    type: 'u64',
  } /**< A properties ID for extensions. Should be 0 if no extensions are needed. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTransferBufferCreateInfo
 */
export class SDL_GPUTransferBufferCreateInfo extends BunStruct<
  typeof SDL_GPUTransferBufferCreateInfoSchema
> {
  constructor() {
    super(SDL_GPUTransferBufferCreateInfoSchema);
  }
}
