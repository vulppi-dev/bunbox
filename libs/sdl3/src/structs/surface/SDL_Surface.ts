import { SDL_PixelFormat } from '../../enum/pixels'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_SurfaceSchema = {
  flags: { order: 0, type: 'u32' } /**< The flags of the surface, read-only */,
  format: {
    order: 1,
    type: 'enum',
    enum: SDL_PixelFormat,
  } /**< The format of the surface, read-only */,
  w: { order: 2, type: 'i32' } /**< The width of the surface, read-only. */,
  h: { order: 3, type: 'i32' } /**< The height of the surface, read-only. */,
  pitch: {
    order: 4,
    type: 'i32',
  } /**< The distance in bytes between rows of pixels, read-only */,
  pixels: {
    order: 5,
    type: 'void',
  } /**< A pointer to the pixels of the surface, the pixels are writeable if non-NULL */,
  refcount: {
    order: 6,
    type: 'i32',
  } /**< Application reference count, used when freeing surface */,
  reserved: { order: 7, type: 'void' } /**< Reserved for internal use */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Surface
 */
export class SDL_Surface extends BunStruct<typeof SDL_SurfaceSchema> {
  constructor() {
    super(SDL_SurfaceSchema)
  }
}
