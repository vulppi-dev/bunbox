import { Event, type EventOptions } from './Event';

export type JoyBatteryEventOptions = {} & EventOptions;

export class JoyBatteryEvent extends Event {
  constructor(options: JoyBatteryEventOptions) {
    super(options);
  }
}
