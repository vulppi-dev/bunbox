import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUTextureSamplerBindingSchema = {
  texture: {
    order: 0,
    type: 'void',
  } /**< The texture to bind. Must have been created with SDL_GPU_TEXTUREUSAGE_SAMPLER. */,
  sampler: {
    order: 1,
    type: 'void',
  } /**< The sampler to bind. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUTextureSamplerBinding
 */
export class SDL_GPUTextureSamplerBinding extends BunStruct<
  typeof SDL_GPUTextureSamplerBindingSchema
> {
  constructor() {
    super(SDL_GPUTextureSamplerBindingSchema);
  }
}
