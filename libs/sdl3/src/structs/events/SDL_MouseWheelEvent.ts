import { SDL_EventType } from '../../enum/events';
import { SDL_MouseWheelDirection } from '../../enum/mouse';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_MouseWheelEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_MOUSE_WHEEL  */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  windowID: {
    order: 3,
    type: 'u32',
  } /**< The window with keyboard focus, if any */,
  which: { order: 4, type: 'u32' } /**< The joystick instance id */,
  x: {
    order: 5,
    type: 'f32',
  } /**< The amount scrolled horizontally, positive to the right and negative to the left */,
  y: {
    order: 6,
    type: 'f32',
  } /**< The amount scrolled vertically, positive away from the user and negative toward the user */,
  direction: {
    order: 7,
    type: 'enum',
    enum: SDL_MouseWheelDirection,
  } /**< Set to one of the SDL_MOUSEWHEEL_* defines. When FLIPPED the values in X and Y will be opposite. Multiply by -1 to change them back */,
  mouse_x: { order: 8, type: 'f32' } /**< X coordinate, relative to window */,
  mouse_y: { order: 9, type: 'f32' } /**< Y coordinate, relative to window */,
  integer_x: {
    order: 10,
    type: 'i32',
  } /**< The amount scrolled horizontally, accumulated to whole scroll "ticks" (added in 3.2.12) */,
  integer_y: {
    order: 11,
    type: 'i32',
  } /**< The amount scrolled vertically, accumulated to whole scroll "ticks" (added in 3.2.12) */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_MouseWheelEvent
 */
export class SDL_MouseWheelEvent extends BunStruct<
  typeof SDL_MouseWheelEventSchema
> {
  constructor() {
    super(SDL_MouseWheelEventSchema);
  }
}
