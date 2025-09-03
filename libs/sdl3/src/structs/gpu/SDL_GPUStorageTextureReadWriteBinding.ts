import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUStorageTextureReadWriteBindingSchema = {
  texture: {
    order: 0,
    type: 'void',
  } /**< The texture to bind. Must have been created with SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_WRITE or SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_SIMULTANEOUS_READ_WRITE. */,
  mip_level: { order: 1, type: 'u32' } /**< The mip level index to bind. */,
  layer: { order: 2, type: 'u32' } /**< The layer index to bind. */,
  cycle: {
    order: 3,
    type: 'boolean',
  } /**< true cycles the buffer if it is already bound. */,
  padding1: { order: 4, type: 'u8' },
  padding2: { order: 5, type: 'u8' },
  padding3: { order: 6, type: 'u8' },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUStorageTextureReadWriteBinding
 */
export class SDL_GPUStorageTextureReadWriteBinding extends BunStruct<
  typeof SDL_GPUStorageTextureReadWriteBindingSchema
> {
  constructor() {
    super(SDL_GPUStorageTextureReadWriteBindingSchema);
  }
}
