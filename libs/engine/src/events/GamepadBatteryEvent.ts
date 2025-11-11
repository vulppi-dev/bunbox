import { Event, type EventOptions } from './Event';

export type GamepadBatteryPowerState =
  | 'error'
  | 'unknown'
  | 'onBattery'
  | 'noBattery'
  | 'charging'
  | 'charged';

export type GamepadBatteryEventOptions = {
  deviceId: number;
  batteryLevel: number;
  state: GamepadBatteryPowerState;
} & EventOptions;

export class GamepadBatteryEvent extends Event {
  private __deviceId: number;
  private __batteryLevel: number;
  private __state: GamepadBatteryPowerState;

  constructor(options: GamepadBatteryEventOptions) {
    super(options);
    this.__deviceId = options.deviceId;
    this.__batteryLevel = options.batteryLevel;
    this.__state = options.state;
  }

  get deviceId() {
    return this.__deviceId;
  }

  get batteryLevel() {
    return this.__batteryLevel;
  }

  get state() {
    return this.__state;
  }
}
