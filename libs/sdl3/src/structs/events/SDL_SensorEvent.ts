import { SDL_EventType } from '../../enum/events';
import { BunStruct, type StructSchema } from '../_struct';

const SDL_SensorEventSchema = {
  type: {
    order: 0,
    type: 'enum',
    enum: SDL_EventType,
  } /**< SDL_EVENT_SENSOR_UPDATE */,
  reserved: { order: 1, type: 'u32' },
  timestamp: {
    order: 2,
    type: 'u64',
  } /**< In nanoseconds, populated using SDL_GetTicksNS() */,
  which: { order: 3, type: 'u32' } /**< The joystick instance id */,
  data: {
    order: 4,
    type: 'array',
    to: 'f32',
    length: 6,
  } /**< Up to 6 values from the sensor - additional values can be queried using SDL_GetSensorData() */,
  sensor_timestamp: {
    order: 5,
    type: 'u64',
  } /**< The timestamp of the sensor reading in nanoseconds, not necessarily synchronized with the system clock */,
} as const satisfies StructSchema;

/**
 * @description https://wiki.libsdl.org/SDL3/SDL_SensorEvent
 */
export class SDL_SensorEvent extends BunStruct<typeof SDL_SensorEventSchema> {
  constructor() {
    super(SDL_SensorEventSchema);
  }
}
