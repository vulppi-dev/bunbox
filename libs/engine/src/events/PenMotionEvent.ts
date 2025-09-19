import { Event, type EventOptions } from './Event';

export type PenMotionEventOptions = {} & EventOptions;

export class PenMotionEvent extends Event {
  constructor(options: PenMotionEventOptions) {
    super(options);
  }
}
