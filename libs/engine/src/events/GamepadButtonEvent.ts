import { Event, type EventOptions } from './Event';

export type GamepadButtonEventOptions = {
  deviceId: number;
  key: number;
} & EventOptions;

export class GamepadButtonEvent extends Event {
  constructor(options: GamepadButtonEventOptions) {
    super(options);
  }
}
