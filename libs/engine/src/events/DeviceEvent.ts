import { Event, type EventOptions } from './Event';

export type DeviceType =
  | 'keyboard'
  | 'mouse'
  | 'gamepad'
  | 'audio'
  | 'camera'
  | 'joystick';

export type DeviceEventOptions = {
  deviceType: DeviceType;
  deviceId: number;
} & EventOptions;

export class DeviceEvent extends Event {
  #deviceType: DeviceType;
  #deviceId: number;

  constructor(options: DeviceEventOptions) {
    super(options);
    this.#deviceType = options.deviceType;
    this.#deviceId = options.deviceId;
  }

  get deviceType() {
    return this.#deviceType;
  }

  get deviceId() {
    return this.#deviceId;
  }
}
