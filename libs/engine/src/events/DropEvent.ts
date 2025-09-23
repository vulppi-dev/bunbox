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
  #windowId: number;
  #x: number;
  #y: number;
  #source: string;
  #data: string;
  #dropType: 'file' | 'text' | 'unknown';

  constructor(options: DropEventOptions) {
    super(options);
    this.#windowId = options.windowId;
    this.#x = options.x;
    this.#y = options.y;
    this.#source = options.source;
    this.#data = options.data;
    this.#dropType = options.dropType;
  }

  get windowId() {
    return this.#windowId;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get source() {
    return this.#source;
  }

  get data() {
    return this.#data;
  }

  get dropType() {
    return this.#dropType;
  }
}
