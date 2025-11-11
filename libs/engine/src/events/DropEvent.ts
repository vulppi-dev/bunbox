import { Event, type EventOptions } from './Event';

export type DropEventOptions = {
  windowId: number;
  x: number;
  y: number;
  source: string;
  data: string;
  dropType: 'file' | 'text' | 'unknown';
} & EventOptions;

export class DropEvent extends Event {
  private __windowId: number;
  private __x: number;
  private __y: number;
  private __source: string;
  private __data: string;
  private __dropType: 'file' | 'text' | 'unknown';

  constructor(options: DropEventOptions) {
    super(options);
    this.__windowId = options.windowId;
    this.__x = options.x;
    this.__y = options.y;
    this.__source = options.source;
    this.__data = options.data;
    this.__dropType = options.dropType;
  }

  get windowId() {
    return this.__windowId;
  }

  get x() {
    return this.__x;
  }

  get y() {
    return this.__y;
  }

  get source() {
    return this.__source;
  }

  get data() {
    return this.__data;
  }

  get dropType() {
    return this.__dropType;
  }
}
