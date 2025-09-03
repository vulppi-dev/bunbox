import { BunStruct, type StructSchema } from '../_struct'
import { SDL_HapticDirection } from './SDL_HapticDirection'

const SDL_HapticPeriodicSchema = {
  /* Header */
  type: { order: 0, type: 'u16' } /**<SDL_HAPTIC_SINE, SDL_HAPTIC_SQUARE
                                      SDL_HAPTIC_TRIANGLE, SDL_HAPTIC_SAWTOOTHUP or
                                      SDL_HAPTIC_SAWTOOTHDOWN */,
  direction: {
    order: 1,
    type: 'struct',
    schema: SDL_HapticDirection,
    isInline: true,
  } /**< Direction of the effect. */,
  /* Replay */
  length: { order: 2, type: 'u32' } /**< Duration of the effect. */,
  delay: { order: 3, type: 'u16' } /**< Delay before starting the effect. */,
  /* Trigger */
  button: { order: 4, type: 'u16' } /**< Button that triggers the effect. */,
  interval: {
    order: 5,
    type: 'u16',
  } /**< How soon it can be triggered again after button. */,
  /* Periodic */
  period: { order: 6, type: 'i16' } /**< Period of the wave. */,
  magnitude: {
    order: 7,
    type: 'u16',
  } /**< Peak value; if negative, equivalent to 180 degrees extra phase shift. */,
  offset: { order: 8, type: 'u16' } /**< Mean value of the wave. */,
  phase: {
    order: 9,
    type: 'i16',
  } /**< Positive phase shift given by hundredth of a degree. */,
  /* Envelope */
  attack_length: { order: 10, type: 'u16' } /**< Duration of the attack. */,
  attack_level: {
    order: 11,
    type: 'u16',
  } /**< Level at the start of the attack. */,
  fade_length: { order: 12, type: 'u16' } /**< Duration of the fade. */,
  fade_level: { order: 13, type: 'u16' } /**< Level at the end of the fade. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticPeriodic
 */
export class SDL_HapticPeriodic extends BunStruct<
  typeof SDL_HapticPeriodicSchema
> {
  constructor() {
    super(SDL_HapticPeriodicSchema)
  }
}
