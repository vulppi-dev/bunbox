import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_GamepadSensorEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_GAMEPAD_BUTTON_DOWN or SDL_EVENT_GAMEPAD_BUTTON_UP */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  sensor: {
    order: 4,
    type: 'i32',
  } /**< The type of the sensor, one of the values of SDL_SensorType */,
  data: {
    order: 5,
    type: 'array',
    to: 'f32',
    length: 3,
  } /**< Up to 3 values from the sensor, as defined in SDL_sensor.h */,
  sensor_timestamp: {
    order: 6,
    type: 'u64',
  } /**< The timestamp of the sensor reading in nanoseconds, not necessarily synchronized with the system clock */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_GamepadSensorEvent
 */
export class SDL_GamepadSensorEvent extends BunStruct<
  typeof SDL_GamepadSensorEventSchema
> {
  constructor() {
    super(SDL_GamepadSensorEventSchema);
  }
}
