import { BunStruct, type StructSchema } from '../_struct';

const SDL_VirtualJoystickTouchpadDescSchema = {
  nfingers: {
    order: 0,
    type: 'u16',
  } /**< the number of simultaneous fingers on this touchpad */,
  padding: { order: 1, type: 'array', to: 'u16', length: 3 },
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_VirtualJoystickTouchpadDesc
 */
export class SDL_VirtualJoystickTouchpadDesc extends BunStruct<
  typeof SDL_VirtualJoystickTouchpadDescSchema
> {
  constructor() {
    super(SDL_VirtualJoystickTouchpadDescSchema);
  }
}
