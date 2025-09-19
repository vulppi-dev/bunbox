import { Event, type EventOptions } from './Event';

export type PenAxisEventOptions = {} & EventOptions;

export class PenAxisEvent extends Event {
  constructor(options: PenAxisEventOptions) {
    super(options);
  }
}
