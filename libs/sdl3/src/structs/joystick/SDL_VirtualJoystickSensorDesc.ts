import { SDL_SensorType } from '../../enum/sensor'
import { BunStruct, type StructSchema } from '../_struct'

const SDL_VirtualJoystickSensorDescSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_SensorType,
  } /**< the type of this sensor */,
  rate: {
    order: 1,
    type: 'f32',
  } /**< the update frequency of this sensor, may be 0.0f */,
} as const satisfies StructSchema

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_VirtualJoystickSensorDesc
 */
export class SDL_VirtualJoystickSensorDesc extends BunStruct<
  typeof SDL_VirtualJoystickSensorDescSchema
> {
  constructor() {
    super(SDL_VirtualJoystickSensorDescSchema)
  }
}
