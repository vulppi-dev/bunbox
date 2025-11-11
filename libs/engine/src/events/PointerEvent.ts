import { Event, type EventOptions } from './Event';

type PointerType = 'mouse' | 'pen' | 'pen-axis' | 'touch' | 'gamepad';

export type PointerEventOptions = {
  windowId: number;
  deviceId: number;
  pointerId: number;
  pointerIndex?: number;
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  pressure: number;
  isDoubleClick: boolean;
  pointerType: PointerType;
} & EventOptions;

export class PointerEvent extends Event {
  private __windowId: number;
  private __deviceId: number;
  private __pointerId: number;
  private __pointerIndex?: number;
  private __x: number;
  private __y: number;
  private __deltaX: number;
  private __deltaY: number;
  private __pressure: number;
  private __isDoubleClick: boolean;
  private __pointerType: PointerType;

  constructor(options: PointerEventOptions) {
    super(options);
    this.__windowId = options.windowId;
    this.__deviceId = options.deviceId;
    this.__pointerId = options.pointerId;
    this.__pointerIndex = options.pointerIndex;
    this.__x = options.x;
    this.__y = options.y;
    this.__deltaX = options.deltaX;
    this.__deltaY = options.deltaY;
    this.__pressure = options.pressure;
    this.__isDoubleClick = options.isDoubleClick;
    this.__pointerType = options.pointerType;
  }

  get windowId() {
    return this.__windowId;
  }

  get deviceId() {
    return this.__deviceId;
  }

  get pointerId() {
    return this.__pointerId;
  }

  /**
   * For touch, this is the index of the touch point.
   * For pen, this is the flag state (e.g., barrel button pressed).
   * For gamepad, this is the touch index.
   */
  get pointerIndex() {
    return this.__pointerIndex;
  }

  get x() {
    return this.__x;
  }

  get y() {
    return this.__y;
  }

  get deltaX() {
    return this.__deltaX;
  }

  get deltaY() {
    return this.__deltaY;
  }

  get pressure() {
    return this.__pressure;
  }

  get isDoubleClick() {
    return this.__isDoubleClick;
  }

  get pointerType() {
    return this.__pointerType;
  }
}
