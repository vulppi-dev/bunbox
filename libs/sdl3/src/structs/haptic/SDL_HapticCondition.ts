import { BunStruct, type StructSchema } from '../_struct'
import { SDL_HapticDirection } from './SDL_HapticDirection'

const SDL_HapticConditionSchema = {
  /* Header */
  type: { order: 0, type: 'u16' } /**< SDL_HAPTIC_SPRING, SDL_HAPTIC_DAMPER,
                                         SDL_HAPTIC_INERTIA or SDL_HAPTIC_FRICTION */,
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
  /* Condition */
  right_sat: {
    order: 6,
    type: 'array',
    to: 'u16',
    length: 3,
  } /**< Level when joystick is to the positive side; max 0xFFFF. */,
  left_sat: {
    order: 7,
    type: 'array',
    to: 'u16',
    length: 3,
  } /**< Level when joystick is to the negative side; max 0xFFFF. */,
  right_coeff: {
    order: 8,
    type: 'array',
    to: 'i16',
    length: 3,
  } /**< How fast to increase the force towards the positive side. */,
  left_coeff: {
    order: 9,
    type: 'array',
    to: 'i16',
    length: 3,
  } /**< How fast to increase the force towards the negative side. */,
  deadband: {
    order: 10,
    type: 'array',
    to: 'u16',
    length: 3,
  } /**< Size of the dead zone; max 0xFFFF: whole axis-range when 0-centered. */,
  center: {
    order: 11,
    type: 'array',
    to: 'i16',
    length: 3,
  } /**< Position of the dead zone. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticCondition
 */
export class SDL_HapticCondition extends BunStruct<
  typeof SDL_HapticConditionSchema
> {
  constructor() {
    super(SDL_HapticConditionSchema)
  }
}
