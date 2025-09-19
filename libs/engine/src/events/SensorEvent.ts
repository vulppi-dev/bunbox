import { Event, type EventOptions } from './Event';

export type SensorEventOptions = {} & EventOptions;

export class SensorEvent extends Event {
  constructor(options: SensorEventOptions) {
    super(options);
  }
}
