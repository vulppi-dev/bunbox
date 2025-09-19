import { Event, type EventOptions } from './Event';

export type RenderEventOptions = {} & EventOptions;

export class RenderEvent extends Event {
  constructor(options: RenderEventOptions) {
    super(options);
  }
}
