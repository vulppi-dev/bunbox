import { BunStruct, type StructSchema } from '../_struct'

const SDL_VirtualJoystickDescSchema = {
  // TODO:
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_VirtualJoystickDesc
 */
export class SDL_VirtualJoystickDesc extends BunStruct<
  typeof SDL_VirtualJoystickDescSchema
> {
  constructor() {
    super(SDL_VirtualJoystickDescSchema)
  }
}
