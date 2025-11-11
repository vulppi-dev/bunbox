import { Event, type EventOptions } from './Event';

export type ClipboardEventOptions = {
  origin: 'self' | 'external';
  mimeTypes: string[];
} & EventOptions;

export class ClipboardEvent extends Event {
  private __origin: 'self' | 'external';
  private __mimeTypes: string[];

  constructor(options: ClipboardEventOptions) {
    super(options);
    this.__origin = options.origin;
    this.__mimeTypes = options.mimeTypes;
  }

  get origin() {
    return this.__origin;
  }

  get mimeTypes() {
    return this.__mimeTypes;
  }
}
