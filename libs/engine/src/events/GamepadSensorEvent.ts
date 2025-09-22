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
  #deviceId: number;
  #value: Vector3;
  #sensorType: SensorType;

  constructor(options: GamepadSensorEventOptions) {
    super(options);
    this.#deviceId = options.deviceId;
    this.#value = options.value;
    this.#sensorType = options.sensorType;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get value() {
    return this.#value;
  }

  get sensorType() {
    return this.#sensorType;
  }
}
