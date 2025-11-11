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
  private __windowId: number;
  private __currentDisplayId: number;
  private __x: number;
  private __y: number;
  private __width: number;
  private __height: number;

  constructor(options: WindowEventOptions) {
    super(options);
    this.__windowId = options.windowId;
    this.__currentDisplayId = options.currentDisplayId;
    this.__x = options.x;
    this.__y = options.y;
    this.__width = options.width;
    this.__height = options.height;
  }

  get windowId() {
    return this.__windowId;
  }

  get currentDisplayId() {
    return this.__currentDisplayId;
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
