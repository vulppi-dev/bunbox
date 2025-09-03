import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_JoyBallEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_JOYSTICK_BALL_MOTION */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  ball: { order: 4, type: 'u8' } /**< The joystick trackball index */,
  padding1: { order: 5, type: 'u8' },
  padding2: { order: 6, type: 'u8' },
  padding3: { order: 7, type: 'u8' },
  xrel: {
    order: 8,
    type: 'i16',
  } /**< The relative motion in the X direction */,
  yrel: {
    order: 9,
    type: 'i16',
  } /**< The relative motion in the Y direction */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_JoyBallEvent
 */
export class SDL_JoyBallEvent extends BunStruct<typeof SDL_JoyBallEventSchema> {
  constructor() {
    super(SDL_JoyBallEventSchema)
  }
}
