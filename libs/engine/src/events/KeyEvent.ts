import { Event, type EventOptions } from './Event';

export type KeyEventOptions = {
  windowId: number;
  deviceId: number;
  code: number;
  key: number;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  repeat: boolean;
} & EventOptions;

export class KeyEvent extends Event {
  #windowId: number;
  #deviceId: number;
  #code: number;
  #key: number;
  #ctrl: boolean;
  #shift: boolean;
  #alt: boolean;
  #meta: boolean;
  #repeat: boolean;

  constructor(options: KeyEventOptions) {
    super(options);
    this.#windowId = options.windowId;
    this.#deviceId = options.deviceId;
    this.#code = options.code;
    this.#key = options.key;
    this.#ctrl = options.ctrl;
    this.#shift = options.shift;
    this.#alt = options.alt;
    this.#meta = options.meta;
    this.#repeat = options.repeat;
  }

  get windowId() {
    return this.#windowId;
  }

  get deviceId() {
    return this.#deviceId;
  }

  get code() {
    return this.#code;
  }

  get key() {
    return this.#key;
  }

  get ctrl() {
    return this.#ctrl;
  }

  get shift() {
    return this.#shift;
  }

  get alt() {
    return this.#alt;
  }

  get meta() {
    return this.#meta;
  }

  get repeat() {
    return this.#repeat;
  }
}
