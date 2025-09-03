import { SDL_GPUFilter, SDL_GPULoadOp } from '../../enum/gpu'
import { SDL_FlipMode } from '../../enum/surface'
import { BunStruct, type StructSchema } from '../_struct'
import { SDL_FColor } from '../pixels/SDL_FColor'
import { SDL_GPUBlitRegion } from './SDL_GPUBlitRegion'

const SDL_GPUBlitInfoSchema = {
  source: {
    order: 0,
    type: 'struct',
    schema: SDL_GPUBlitRegion,
    isInline: true,
  } /**< The source region for the blit. */,
  destination: {
    order: 1,
    type: 'struct',
    schema: SDL_GPUBlitRegion,
    isInline: true,
  } /**< The destination region for the blit. */,
  load_op: {
    order: 2,
    type: 'enum',
    enum: SDL_GPULoadOp,
  } /**< What is done with the contents of the destination before the blit. */,
  clear_color: {
    order: 3,
    type: 'struct',
    schema: SDL_FColor,
    isInline: true,
  } /**< The color to clear the destination region to before the blit. Ignored if load_op is not SDL_GPU_LOADOP_CLEAR. */,
  flip_mode: {
    order: 4,
    type: 'enum',
    enum: SDL_FlipMode,
  } /**< The flip mode for the source region. */,
  filter: {
    order: 5,
    type: 'enum',
    enum: SDL_GPUFilter,
  } /**< The filter mode used when blitting. */,
  cycle: {
    order: 6,
    type: 'boolean',
  } /**< true cycles the destination texture if it is already bound. */,
  padding1: { order: 7, type: 'u8' },
  padding2: { order: 8, type: 'u8' },
  padding3: { order: 9, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUBlitInfo
 */
export class SDL_GPUBlitInfo extends BunStruct<typeof SDL_GPUBlitInfoSchema> {
  constructor() {
    super(SDL_GPUBlitInfoSchema)
  }
}
