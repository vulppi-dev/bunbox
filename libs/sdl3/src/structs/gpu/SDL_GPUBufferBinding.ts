import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUBufferBindingSchema = {
  buffer: {
    order: 0,
    type: 'void',
  } /**< The buffer to bind. Must have been created with SDL_GPU_BUFFERUSAGE_VERTEX for SDL_BindGPUVertexBuffers, or SDL_GPU_BUFFERUSAGE_INDEX for SDL_BindGPUIndexBuffer. */,
  offset: {
    order: 1,
    type: 'u32',
  } /**< The starting byte of the data to bind in the buffer. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBufferBinding
 */
export class SDL_GPUBufferBinding extends BunStruct<
  typeof SDL_GPUBufferBindingSchema
> {
  constructor() {
    super(SDL_GPUBufferBindingSchema);
  }
}
