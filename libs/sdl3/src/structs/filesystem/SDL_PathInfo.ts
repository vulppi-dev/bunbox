import { SDL_PathType } from '../../enum/filesystem'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_PathInfoSchema = {
  type: { order: 0, type: 'enum', enum: SDL_PathType } /**< the path type */,
  size: { order: 1, type: 'u64' } /**< the file size in bytes */,
  create_time: {
    order: 2,
    type: 'i64',
  } /**< the time when the path was created */,
  modify_time: {
    order: 3,
    type: 'i64',
  } /**< the last time the path was modified */,
  access_time: {
    order: 4,
    type: 'i64',
  } /**< the last time the path was read */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_PathInfo
 */
export class SDL_PathInfo extends BunStruct<typeof SDL_PathInfoSchema> {
  constructor() {
    super(SDL_PathInfoSchema)
  }
}
