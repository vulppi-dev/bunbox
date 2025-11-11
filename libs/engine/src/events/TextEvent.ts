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
  private __windowID: number;
  private __text: string;
  private __start?: number;
  private __length?: number;
  private __candidates?: string[];
  private __horizontal?: boolean;

  constructor(options: TextEventOptions) {
    super(options);
    this.__windowID = options.windowID;
    this.__text = options.text;
    this.__start = options.start;
    this.__length = options.length;
    this.__candidates = options.candidates;
    this.__horizontal = options.horizontal;
  }

  get windowID() {
    return this.__windowID;
  }

  get text() {
    return this.__text;
  }

  get start() {
    return this.__start;
  }

  get length() {
    return this.__length;
  }

  get candidates() {
    return this.__candidates;
  }

  get horizontal() {
    return this.__horizontal;
  }
}
