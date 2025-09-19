import { Event, type EventOptions } from './Event';

export type KeyboardDeviceEventOptions = {} & EventOptions;

export class KeyboardDeviceEvent extends Event {
  constructor(options: KeyboardDeviceEventOptions) {
    super(options);
  }
}
