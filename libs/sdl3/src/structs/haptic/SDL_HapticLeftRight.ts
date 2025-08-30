import { BunStruct, type StructSchema } from '../_struct'

export const SDL_HapticLeftRightSchema = {
  /* Header */
  type: { order: 0, type: 'u16' } /**< SDL_HAPTIC_LEFTRIGHT */,
  /* Replay */
  length: {
    order: 1,
    type: 'u32',
  } /**< Duration of the effect in milliseconds. */,
  /* Rumble */
  large_magnitude: {
    order: 2,
    type: 'u16',
  } /**< Control of the large controller motor. */,
  small_magnitude: {
    order: 3,
    type: 'u16',
  } /**< Control of the small controller motor. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticLeftRight
 */
export class SDL_HapticLeftRight extends BunStruct<
  typeof SDL_HapticLeftRightSchema
> {
  constructor() {
    super(SDL_HapticLeftRightSchema)
  }
}
