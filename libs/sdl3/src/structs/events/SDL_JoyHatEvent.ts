import { SDL_EventType } from '../../enum/events'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_JoyHatEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_JOYSTICK_HAT_MOTION */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  hat: { order: 4, type: 'u8' } /**< The joystick hat index */,
  value: { order: 5, type: 'i8' },
  /**< The hat position value.
   *   \sa SDL_HAT_LEFTUP SDL_HAT_UP SDL_HAT_RIGHTUP
   *   \sa SDL_HAT_LEFT SDL_HAT_CENTERED SDL_HAT_RIGHT
   *   \sa SDL_HAT_LEFTDOWN SDL_HAT_DOWN SDL_HAT_RIGHTDOWN
   *
   *   Note that zero means the POV is centered.
   */ padding1: { order: 6, type: 'u8' },
  padding2: { order: 7, type: 'u8' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_JoyHatEvent
 */
export class SDL_JoyHatEvent extends BunStruct<typeof SDL_JoyHatEventSchema> {
  constructor() {
    super(SDL_JoyHatEventSchema)
  }
}
