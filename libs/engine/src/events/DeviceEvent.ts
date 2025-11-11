import { Event, type EventOptions } from './Event';

export type DeviceType =
  | 'keyboard'
  | 'mouse'
  | 'gamepad'
  | 'audio'
  | 'camera'
  | 'joystick'
  | 'sensor';

export type DeviceEventOptions = {
  deviceType: DeviceType;
  deviceId: number;
} & EventOptions;

export class DeviceEvent extends Event {
  private __deviceType: DeviceType;
  private __deviceId: number;

  constructor(options: DeviceEventOptions) {
    super(options);
    this.__deviceType = options.deviceType;
    this.__deviceId = options.deviceId;
  }

  get deviceType() {
    return this.__deviceType;
  }

  get deviceId() {
    return this.__deviceId;
  }
}
