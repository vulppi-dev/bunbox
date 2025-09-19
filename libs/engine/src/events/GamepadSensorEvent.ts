import { Event, type EventOptions } from './Event';

export type GamepadSensorEventOptions = {} & EventOptions;

export class GamepadSensorEvent extends Event {
  constructor(options: GamepadSensorEventOptions) {
    super(options);
  }
}
