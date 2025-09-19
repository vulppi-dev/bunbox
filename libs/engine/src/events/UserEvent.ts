import { Event, type EventOptions } from './Event';

export type UserEventOptions = {} & EventOptions;

export class UserEvent extends Event {
  constructor(options: UserEventOptions) {
    super(options);
  }
}
