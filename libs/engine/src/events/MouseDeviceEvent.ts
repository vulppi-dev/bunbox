import { Event, type EventOptions } from './Event';

export type MouseDeviceEventOptions = {} & EventOptions;

export class MouseDeviceEvent extends Event {
  constructor(options: MouseDeviceEventOptions) {
    super(options);
  }
}
