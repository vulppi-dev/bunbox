import { Event, type EventOptions } from './Event';

export type QuitEventOptions = {} & EventOptions;

export class QuitEvent extends Event {
  constructor(options: QuitEventOptions) {
    super(options);
  }
}
