export type EventOptions = {
  type: string;
  timestamp: Date;
};

export class Event {
  #type: string;
  #timestamp: Date;

  constructor({ type, timestamp }: EventOptions) {
    this.#type = type;
    this.#timestamp = timestamp;
  }

  get type() {
    return this.#type;
  }

  get timestamp() {
    return this.#timestamp;
  }
}
