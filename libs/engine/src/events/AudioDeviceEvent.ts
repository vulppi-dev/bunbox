import { Event, type EventOptions } from './Event';

export type AudioDeviceEventOptions = {} & EventOptions;

export class AudioDeviceEvent extends Event {
  constructor(options: AudioDeviceEventOptions) {
    super(options);
  }
}
