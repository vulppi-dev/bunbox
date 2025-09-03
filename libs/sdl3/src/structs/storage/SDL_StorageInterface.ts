import { BunStruct, type StructSchema } from '../_struct'

const SDL_StorageInterfaceSchema = {
  // TODO:
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_StorageInterface
 */
export class SDL_StorageInterface extends BunStruct<
  typeof SDL_StorageInterfaceSchema
> {
  constructor() {
    super(SDL_StorageInterfaceSchema)
  }
}
