import { Event, type EventOptions } from './Event';

export type GamepadDeviceEventOptions = {} & EventOptions;

export class GamepadDeviceEvent extends Event {
  constructor(options: GamepadDeviceEventOptions) {
    super(options);
  }
}
