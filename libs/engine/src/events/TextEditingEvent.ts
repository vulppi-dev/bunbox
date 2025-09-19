import { Event, type EventOptions } from './Event';

export type TextEditingEventOptions = {} & EventOptions;

export class TextEditingEvent extends Event {
  constructor(options: TextEditingEventOptions) {
    super(options);
  }
}
