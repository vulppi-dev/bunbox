import { Event, type EventOptions } from './Event';

export type WindowEventOptions = {} & EventOptions;

export class WindowEvent extends Event {
  constructor(options: WindowEventOptions) {
    super(options);
  }
}
