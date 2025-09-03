import { BunStruct, type StructSchema } from '../_struct'

const SDL_GPUStorageBufferReadWriteBindingSchema = {
  buffer: {
    order: 0,
    type: 'void',
  } /**< The buffer to bind. Must have been created with SDL_GPU_BUFFERUSAGE_COMPUTE_STORAGE_WRITE. */,
  cycle: {
    order: 1,
    type: 'boolean',
  } /**< true cycles the buffer if it is already bound. */,
  padding1: { order: 2, type: 'u8' },
  padding2: { order: 3, type: 'u8' },
  padding3: { order: 4, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUStorageBufferReadWriteBinding
 */
export class SDL_GPUStorageBufferReadWriteBinding extends BunStruct<
  typeof SDL_GPUStorageBufferReadWriteBindingSchema
> {
  constructor() {
    super(SDL_GPUStorageBufferReadWriteBindingSchema)
  }
}
