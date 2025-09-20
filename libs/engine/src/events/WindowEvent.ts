import { Event, type EventOptions } from './Event';

export type WindowEventOptions = {
  windowId: number;
  currentDisplayId: number;
  x: number;
  y: number;
  width: number;
  height: number;
} & EventOptions;

export class WindowEvent extends Event {
  #windowId: number;
  #currentDisplayId: number;
  #x: number;
  #y: number;
  #width: number;
  #height: number;

  constructor(options: WindowEventOptions) {
    super(options);
    this.#windowId = options.windowId;
    this.#currentDisplayId = options.currentDisplayId;
    this.#x = options.x;
    this.#y = options.y;
    this.#width = options.width;
    this.#height = options.height;
  }

  get windowId() {
    return this.#windowId;
  }

  get currentDisplayId() {
    return this.#currentDisplayId;
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
