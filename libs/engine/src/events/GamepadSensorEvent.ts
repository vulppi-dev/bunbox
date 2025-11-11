import type { Vector3 } from '../math';
import { Event, type EventOptions } from './Event';

export type SensorType =
  | 'accelerometer'
  | 'gyroscope'
  | 'rightAccelerometer'
  | 'rightGyroscope'
  | 'leftAccelerometer'
  | 'leftGyroscope'
  | 'unknown';

export type GamepadSensorEventOptions = {
  deviceId: number;
  value: Vector3;
  sensorType: SensorType;
} & EventOptions;

export class GamepadSensorEvent extends Event {
  private __deviceId: number;
  private __value: Vector3;
  private __sensorType: SensorType;

  constructor(options: GamepadSensorEventOptions) {
    super(options);
    this.__deviceId = options.deviceId;
    this.__value = options.value;
    this.__sensorType = options.sensorType;
  }

  get deviceId() {
    return this.__deviceId;
  }

  get value() {
    return this.__value;
  }

  get sensorType() {
    return this.__sensorType;
  }
}
