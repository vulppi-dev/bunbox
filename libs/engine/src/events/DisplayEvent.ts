import { Event, type EventOptions } from './Event';

export type DisplayOrientation =
  | 'unknown'
  | 'landscape'
  | 'landscape-flipped'
  | 'portrait'
  | 'portrait-flipped';

export type DisplayEventOptions = {
  displayId: number;
  orientation: DisplayOrientation;
  x: number;
  y: number;
  width: number;
  height: number;
} & EventOptions;

export class DisplayEvent extends Event {
  #displayId: number;
  #orientation: DisplayOrientation;
  #x: number;
  #y: number;
  #width: number;
  #height: number;

  constructor(options: DisplayEventOptions) {
    super(options);
    this.#displayId = options.displayId;
    this.#orientation = options.orientation ?? 'unknown';
    this.#x = options.x;
    this.#y = options.y;
    this.#width = options.width;
    this.#height = options.height;
  }

  get displayId() {
    return this.#displayId;
  }

  get orientation() {
    return this.#orientation;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }
}
