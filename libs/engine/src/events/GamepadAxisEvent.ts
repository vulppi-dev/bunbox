import { Event, type EventOptions } from './Event';

export type GamepadAxisType = 'x' | 'y' | 'leftTrigger' | 'rightTrigger' | 'unknown';

export type GamepadAxisEventOptions = {
  deviceId: number;
  axis: GamepadAxisType;
  /** The value of the axis, ranging from -1.0 to 1.0 */
  value: number;
} & EventOptions;

export class GamepadAxisEvent extends Event {
  #deviceId: number;
  #axis: GamepadAxisType;
  #value: number;

  constructor(options: GamepadAxisEventOptions) {
    super(options);
    this.#deviceId = options.deviceId;
    this.#axis = options.axis;
    this.#value = options.value;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get axis() {
    return this.#axis;
  }

  get value() {
    return this.#value;
  }
}
