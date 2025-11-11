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
  private __displayId: number;
  private __orientation: DisplayOrientation;
  private __x: number;
  private __y: number;
  private __width: number;
  private __height: number;

  constructor(options: DisplayEventOptions) {
    super(options);
    this.__displayId = options.displayId;
    this.__orientation = options.orientation ?? 'unknown';
    this.__x = options.x;
    this.__y = options.y;
    this.__width = options.width;
    this.__height = options.height;
  }

  get displayId() {
    return this.__displayId;
  }

  get orientation() {
    return this.__orientation;
  }

  get x() {
    return this.__x;
  }

  get y() {
    return this.__y;
  }

  get width() {
    return this.__width;
  }

  get height() {
    return this.__height;
  }
}
