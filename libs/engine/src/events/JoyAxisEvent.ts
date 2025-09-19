import { Event, type EventOptions } from './Event';

export type JoyAxisEventOptions = {} & EventOptions;

export class JoyAxisEvent extends Event {
  constructor(options: JoyAxisEventOptions) {
    super(options);
  }
}
