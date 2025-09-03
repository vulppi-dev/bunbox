import { BunStruct, type StructSchema } from '../_struct'
import { SDL_HapticDirection } from './SDL_HapticDirection'

const SDL_HapticRampSchema = {
  /* Header */
  type: { order: 0, type: 'u16' } /**< SDL_HAPTIC_RAMP */,
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
  /* Constant */
  start: { order: 6, type: 'i16' } /**< Beginning strength level. */,
  end: { order: 7, type: 'i16' } /**< Ending strength level. */,
  /* Envelope */
  attack_length: { order: 8, type: 'u16' } /**< Duration of the attack. */,
  attack_level: {
    order: 9,
    type: 'u16',
  } /**< Level at the start of the attack. */,
  fade_length: { order: 10, type: 'u16' } /**< Duration of the fade. */,
  fade_level: { order: 11, type: 'u16' } /**< Level at the end of the fade. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticRamp
 */
export class SDL_HapticRamp extends BunStruct<typeof SDL_HapticRampSchema> {
  constructor() {
    super(SDL_HapticRampSchema)
  }
}
