import { BunStruct, type StructSchema } from '../_struct';

const SDL_GPUViewportSchema = {
  x: {
    order: 0,
    type: 'f32',
  } /**< The left offset of the viewport. */,
  y: {
    order: 1,
    type: 'f32',
  } /**< The top offset of the viewport. */,
  w: {
    order: 2,
    type: 'f32',
  } /**< The width of the viewport. */,
  h: {
    order: 3,
    type: 'f32',
  } /**< The height of the viewport. */,
  min_depth: {
    order: 4,
    type: 'f32',
  } /**< The minimum depth of the viewport. */,
  max_depth: {
    order: 5,
    type: 'f32',
  } /**< The maximum depth of the viewport. */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GPUViewport
 */
export class SDL_GPUViewport extends BunStruct<typeof SDL_GPUViewportSchema> {
  constructor() {
    super(SDL_GPUViewportSchema);
  }
}
