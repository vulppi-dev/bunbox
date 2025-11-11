import { Event, type EventOptions } from './Event';

export type GamepadAxisType =
  | 'x'
  | 'y'
  | 'leftTrigger'
  | 'rightTrigger'
  | 'unknown';

export type GamepadAxisEventOptions = {
  deviceId: number;
  axis: GamepadAxisType;
  /** The value of the axis, ranging from -1.0 to 1.0 */
  value: number;
} & EventOptions;

export class GamepadAxisEvent extends Event {
  private __deviceId: number;
  private __axis: GamepadAxisType;
  private __value: number;

  constructor(options: GamepadAxisEventOptions) {
    super(options);
    this.__deviceId = options.deviceId;
    this.__axis = options.axis;
    this.__value = options.value;
  }

  get deviceId() {
    return this.__deviceId;
  }

  get axis() {
    return this.__axis;
  }

  get value() {
    return this.__value;
  }
}
