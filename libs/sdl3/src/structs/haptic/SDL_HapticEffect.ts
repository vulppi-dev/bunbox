import { BunStruct, type StructSchema } from '../_struct'
import { SDL_HapticCondition } from './SDL_HapticCondition'
import { SDL_HapticConstant } from './SDL_HapticConstant'
import { SDL_HapticCustom } from './SDL_HapticCustom'
import { SDL_HapticLeftRight } from './SDL_HapticLeftRight'
import { SDL_HapticPeriodic } from './SDL_HapticPeriodic'
import { SDL_HapticRamp } from './SDL_HapticRamp'

export const SDL_HapticEffectSchema = {
  /* Common for all force feedback effects */
  type: { order: 0, type: 'u16' } /**< Effect type. */,
  constant: {
    order: 1,
    type: 'struct',
    schema: SDL_HapticConstant,
    isInline: true,
  } /**< Constant effect. */,
  periodic: {
    order: 2,
    type: 'struct',
    schema: SDL_HapticPeriodic,
    isInline: true,
  } /**< Periodic effect. */,
  condition: {
    order: 3,
    type: 'struct',
    schema: SDL_HapticCondition,
    isInline: true,
  } /**< Condition effect. */,
  ramp: {
    order: 4,
    type: 'struct',
    schema: SDL_HapticRamp,
    isInline: true,
  } /**< Ramp effect. */,
  leftright: {
    order: 5,
    type: 'struct',
    schema: SDL_HapticLeftRight,
    isInline: true,
  } /**< Left/Right effect. */,
  custom: {
    order: 6,
    type: 'struct',
    schema: SDL_HapticCustom,
    isInline: true,
  } /**< Custom effect. */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_HapticEffect
 */
export class SDL_HapticEffect extends BunStruct<typeof SDL_HapticEffectSchema> {
  constructor() {
    super(SDL_HapticEffectSchema, true)
  }
}
