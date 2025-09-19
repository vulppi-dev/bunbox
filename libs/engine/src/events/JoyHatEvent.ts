import { Event, type EventOptions } from './Event';

export type JoyHatEventOptions = {} & EventOptions;

export class JoyHatEvent extends Event {
  constructor(options: JoyHatEventOptions) {
    super(options);
  }
}
