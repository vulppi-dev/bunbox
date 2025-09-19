import { Event, type EventOptions } from './Event';

export type GamepadAxisEventOptions = {} & EventOptions;

export class GamepadAxisEvent extends Event {
  constructor(options: GamepadAxisEventOptions) {
    super(options);
  }
}
