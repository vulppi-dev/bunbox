import { Event, type EventOptions } from './Event';

export type JoyButtonEventOptions = {} & EventOptions;

export class JoyButtonEvent extends Event {
  constructor(options: JoyButtonEventOptions) {
    super(options);
  }
}
