import { Event, type EventOptions } from './Event';

export type GamepadTouchpadEventOptions = {} & EventOptions;

export class GamepadTouchpadEvent extends Event {
  constructor(options: GamepadTouchpadEventOptions) {
    super(options);
  }
}
