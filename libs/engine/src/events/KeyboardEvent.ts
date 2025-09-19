import { Event, type EventOptions } from './Event';

export type KeyboardEventOptions = {} & EventOptions;

export class KeyboardEvent extends Event {
  constructor(options: KeyboardEventOptions) {
    super(options);
  }
}
