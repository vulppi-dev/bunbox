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
  #windowId: number;
  #deviceId: number;
  #pointerId: number;
  #pointerIndex?: number;
  #x: number;
  #y: number;
  #deltaX: number;
  #deltaY: number;
  #pressure: number;
  #isDoubleClick: boolean;
  #pointerType: PointerType;

  constructor(options: PointerEventOptions) {
    super(options);
    this.#windowId = options.windowId;
    this.#deviceId = options.deviceId;
    this.#pointerId = options.pointerId;
    this.#pointerIndex = options.pointerIndex;
    this.#x = options.x;
    this.#y = options.y;
    this.#deltaX = options.deltaX;
    this.#deltaY = options.deltaY;
    this.#pressure = options.pressure;
    this.#isDoubleClick = options.isDoubleClick;
    this.#pointerType = options.pointerType;
  }

  get windowId() {
    return this.#windowId;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get pointerId() {
    return this.#pointerId;
  }

  /**
   * For touch, this is the index of the touch point.
   * For pen, this is the flag state (e.g., barrel button pressed).
   * For gamepad, this is the touch index.
   */
  get pointerIndex() {
    return this.#pointerIndex;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get deltaX() {
    return this.#deltaX;
  }

  get deltaY() {
    return this.#deltaY;
  }

  get pressure() {
    return this.#pressure;
  }

  get isDoubleClick() {
    return this.#isDoubleClick;
  }

  get pointerType() {
    return this.#pointerType;
  }
}
