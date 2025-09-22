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
  #deviceId: number;
  #batteryLevel: number;
  #state: GamepadBatteryPowerState;

  constructor(options: GamepadBatteryEventOptions) {
    super(options);
    this.#deviceId = options.deviceId;
    this.#batteryLevel = options.batteryLevel;
    this.#state = options.state;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get batteryLevel() {
    return this.#batteryLevel;
  }

  get state() {
    return this.#state;
  }
}
