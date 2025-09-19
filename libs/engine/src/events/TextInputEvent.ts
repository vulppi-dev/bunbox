import { Event, type EventOptions } from './Event';

export type TextInputEventOptions = {} & EventOptions;

export class TextInputEvent extends Event {
  constructor(options: TextInputEventOptions) {
    super(options);
  }
}
