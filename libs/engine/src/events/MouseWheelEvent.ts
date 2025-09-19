import { Event, type EventOptions } from './Event';

export type MouseWheelEventOptions = {} & EventOptions;

export class MouseWheelEvent extends Event {
  constructor(options: MouseWheelEventOptions) {
    super(options);
  }
}
