import { BunStruct, type StructSchema } from '../_struct'

const SDL_IOStreamInterfaceSchema = {
  // TODO:
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_IOStreamInterface
 */
export class SDL_IOStreamInterface extends BunStruct<
  typeof SDL_IOStreamInterfaceSchema
> {
  constructor() {
    super(SDL_IOStreamInterfaceSchema)
  }
}
