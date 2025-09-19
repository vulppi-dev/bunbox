import { Event, type EventOptions } from './Event';

export type MouseMotionEventOptions = {} & EventOptions;

export class MouseMotionEvent extends Event {
  constructor(options: MouseMotionEventOptions) {
    super(options);
  }
}
