import {
  SDL_GamepadAxis,
  SDL_GamepadBindingType,
  SDL_GamepadButton,
} from '../../enum/gamepad'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_GamepadBindingSchema = {
  input_type: { order: 0, type: 'enum', enum: SDL_GamepadBindingType },
  input_button: { order: 1, type: 'i32' },
  input_axis: { order: 2, type: 'i32' },
  input_axis_min: { order: 3, type: 'i32' },
  input_axis_max: { order: 4, type: 'i32' },
  input_hat: { order: 5, type: 'i32' },
  input_hat_mask: { order: 6, type: 'i32' },
  output_type: { order: 7, type: 'enum', enum: SDL_GamepadBindingType },
  output_button: { order: 8, type: 'enum', enum: SDL_GamepadButton },
  output_axis: { order: 9, type: 'enum', enum: SDL_GamepadAxis },
  output_axis_min: { order: 10, type: 'i32' },
  output_axis_max: { order: 11, type: 'i32' },
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadBinding
 */
export class SDL_GamepadBinding extends BunStruct<
  typeof SDL_GamepadBindingSchema
> {
  constructor() {
    super(SDL_GamepadBindingSchema)
  }
}
