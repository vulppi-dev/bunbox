import { Event, type EventOptions } from './Event';

export type PenProximityEventOptions = {} & EventOptions;

export class PenProximityEvent extends Event {
  constructor(options: PenProximityEventOptions) {
    super(options);
  }
}
