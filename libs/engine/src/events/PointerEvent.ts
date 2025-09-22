import { Event, type EventOptions } from './Event';

type PointerType = 'mouse' | 'pen' | 'touch' | 'gamepad';

export type PointerEventOptions = {
  windowId: number;
  deviceId: number;
  pointerId: number;
  /** Only for gamepad touch events */
  touchIndex?: number;
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
  #touchIndex?: number;
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
    this.#touchIndex = options.touchIndex;
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

  /** Only for gamepad touch events */
  get touchIndex() {
    return this.#touchIndex;
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
