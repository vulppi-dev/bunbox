import { BunStruct, type StructSchema } from '../_struct';

const SDL_FingerSchema = {
  id: { order: 0, type: 'u64' } /**< the finger ID */,
  x: {
    order: 1,
    type: 'f32',
  } /**< the x-axis location of the touch event, normalized (0...1) */,
  y: {
    order: 2,
    type: 'f32',
  } /**< the y-axis location of the touch event, normalized (0...1) */,
  pressure: {
    order: 3,
    type: 'f32',
  } /**< the quantity of pressure applied, normalized (0...1) */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_Finger
 */
export class SDL_Finger extends BunStruct<typeof SDL_FingerSchema> {
  constructor() {
    super(SDL_FingerSchema);
  }
}
