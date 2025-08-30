import { BunStruct, type StructSchema } from '../_struct'

export const SDL_CameraSpecSchema = {
  format: { order: 0, type: 'u32' },
  colorspace: { order: 1, type: 'u32' },
  width: { order: 2, type: 'i32' },
  height: { order: 3, type: 'i32' },
  framerate_numerator: { order: 4, type: 'i32' },
  framerate_denominator: { order: 5, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_CameraSpec
 */
export class SDL_CameraSpec extends BunStruct<typeof SDL_CameraSpecSchema> {
  constructor() {
    super(SDL_CameraSpecSchema)
  }
}
