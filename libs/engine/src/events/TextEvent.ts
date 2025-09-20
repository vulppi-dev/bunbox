import { Event, type EventOptions } from './Event';

export type TextEventOptions = {
  windowID: number;
  text: string;
  start?: number;
  length?: number;
  candidate?: string;
  candidates?: string[];
  horizontal?: boolean;
} & EventOptions;

export class TextEvent extends Event {
  #windowID: number;
  #text: string;
  #start?: number;
  #length?: number;
  #candidates?: string[];
  #horizontal?: boolean;

  constructor(options: TextEventOptions) {
    super(options);
    this.#windowID = options.windowID;
    this.#text = options.text;
    this.#start = options.start;
    this.#length = options.length;
    this.#candidates = options.candidates;
    this.#horizontal = options.horizontal;
  }

  get windowID() {
    return this.#windowID;
  }

  get text() {
    return this.#text;
  }

  get start() {
    return this.#start;
  }

  get length() {
    return this.#length;
  }

  get candidates() {
    return this.#candidates;
  }

  get horizontal() {
    return this.#horizontal;
  }
}
