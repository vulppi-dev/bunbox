import { Event, type EventOptions } from './Event';

export type ClipboardEventOptions = {} & EventOptions;

export class ClipboardEvent extends Event {
  constructor(options: ClipboardEventOptions) {
    super(options);
  }
}
