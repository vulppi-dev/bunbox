import { Event, type EventOptions } from './Event';

export type PenTouchEventOptions = {} & EventOptions;

export class PenTouchEvent extends Event {
  constructor(options: PenTouchEventOptions) {
    super(options);
  }
}
