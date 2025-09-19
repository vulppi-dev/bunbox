import { Event, type EventOptions } from './Event';

export type TouchFingerEventOptions = {} & EventOptions;

export class TouchFingerEvent extends Event {
  constructor(options: TouchFingerEventOptions) {
    super(options);
  }
}
