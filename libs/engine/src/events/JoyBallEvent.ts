import { Event, type EventOptions } from './Event';

export type JoyBallEventOptions = {} & EventOptions;

export class JoyBallEvent extends Event {
  constructor(options: JoyBallEventOptions) {
    super(options);
  }
}
