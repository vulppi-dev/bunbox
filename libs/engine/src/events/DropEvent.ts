import { Event, type EventOptions } from './Event';

export type DropEventOptions = {} & EventOptions;

export class DropEvent extends Event {
  constructor(options: DropEventOptions) {
    super(options);
  }
}
