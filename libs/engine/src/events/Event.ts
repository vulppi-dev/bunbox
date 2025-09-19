export type EventOptions = {
  type: string;
  reserved: number;
  timestamp: Date;
};

export class Event {
  #type: string;
  #reserved: number;
  #timestamp: Date;

  constructor({ type, reserved, timestamp }: EventOptions) {
    this.#type = type;
    this.#reserved = reserved;
    this.#timestamp = timestamp;
  }

  get type() {
    return this.#type;
  }

  get reserved() {
    return this.#reserved;
  }

  get timestamp() {
    return this.#timestamp;
  }
}
