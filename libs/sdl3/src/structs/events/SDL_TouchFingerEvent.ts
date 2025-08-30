import { BunStruct, type StructSchema } from '../_struct'

export const SDL_TouchFingerEventSchema = {
  type: {
    order: 0,
    type: 'u32',
  } /**< SDL_EVENT_FINGER_DOWN, SDL_EVENT_FINGER_UP, or SDL_EVENT_FINGER_MOTION */,
  reserved: {
    order: 1,
    type: 'u32',
  },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  touchId: { order: 3, type: 'u64' } /**< The touch device id */,
  fingerId: { order: 4, type: 'u64' } /**< The finger id */,
  x: { order: 5, type: 'f32' } /**< Normalized in the range 0...1 */,
  y: { order: 6, type: 'f32' } /**< Normalized in the range 0...1 */,
  dx: {
    order: 7,
    type: 'f32',
  } /**< Normalized in the range -1...1; may be zero if the finger hasn't moved */,
  dy: {
    order: 8,
    type: 'f32',
  } /**< Normalized in the range -1...1; may be zero if the finger hasn't moved */,
  pressure: {
    order: 9,
    type: 'f32',
  } /**< Normalized in the range 0...1; may be zero if the finger is not touching the screen */,
  windowID: {
    order: 10,
    type: 'u32',
  } /**< The window with touch focus, if any */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_TouchFingerEvent
 */
export class SDL_TouchFingerEvent extends BunStruct<
  typeof SDL_TouchFingerEventSchema
> {
  constructor() {
    super(SDL_TouchFingerEventSchema)
  }
}
