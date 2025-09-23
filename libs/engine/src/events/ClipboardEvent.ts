import { Event, type EventOptions } from './Event';

export type ClipboardEventOptions = {
  origin: 'self' | 'external';
  mimeTypes: string[];
} & EventOptions;

export class ClipboardEvent extends Event {
  #origin: 'self' | 'external';
  #mimeTypes: string[];

  constructor(options: ClipboardEventOptions) {
    super(options);
    this.#origin = options.origin;
    this.#mimeTypes = options.mimeTypes;
  }

  get origin() {
    return this.#origin;
  }

  get mimeTypes() {
    return this.#mimeTypes;
  }
}
