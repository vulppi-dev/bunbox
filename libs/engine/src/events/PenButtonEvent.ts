import { Event, type EventOptions } from './Event';

export type PenButtonEventOptions = {} & EventOptions;

export class PenButtonEvent extends Event {
  constructor(options: PenButtonEventOptions) {
    super(options);
  }
}
