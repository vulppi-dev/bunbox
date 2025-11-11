export type EventOptions = {
  type: string;
  timestamp: Date;
};

export class Event {
  private __type: string;
  private __timestamp: Date;

  constructor({ type, timestamp }: EventOptions) {
    this.__type = type;
    this.__timestamp = timestamp;
  }

  get type() {
    return this.__type;
  }

  get timestamp() {
    return this.__timestamp;
  }
}
