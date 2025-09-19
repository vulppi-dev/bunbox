import { Event, type EventOptions } from './Event';

export type DisplayEventOptions = {} & EventOptions;

export class DisplayEvent extends Event {
  constructor(options: DisplayEventOptions) {
    super(options);
  }
}
