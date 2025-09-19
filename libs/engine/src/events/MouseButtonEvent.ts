import { Event, type EventOptions } from './Event';

export type MouseButtonEventOptions = {} & EventOptions;

export class MouseButtonEvent extends Event {
  constructor(options: MouseButtonEventOptions) {
    super(options);
  }
}
