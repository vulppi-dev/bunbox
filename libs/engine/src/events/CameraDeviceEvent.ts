import { Event, type EventOptions } from './Event';

export type CameraDeviceEventOptions = {} & EventOptions;

export class CameraDeviceEvent extends Event {
  constructor(options: CameraDeviceEventOptions) {
    super(options);
  }
}
