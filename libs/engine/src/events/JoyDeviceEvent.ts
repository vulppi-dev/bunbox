import { Event, type EventOptions } from './Event';

export type JoyDeviceEventOptions = {} & EventOptions;

export class JoyDeviceEvent extends Event {
  constructor(options: JoyDeviceEventOptions) {
    super(options);
  }
}
