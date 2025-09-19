import { Event, type EventOptions } from './Event';

export type GamepadButtonEventOptions = {} & EventOptions;

export class GamepadButtonEvent extends Event {
  constructor(options: GamepadButtonEventOptions) {
    super(options);
  }
}
