import { Event, type EventOptions } from './Event';

export type LocaleEventOptions = {
  locales?: { language: string; country: string }[];
} & EventOptions;

export class LocaleEvent extends Event {
  private __locales: { language: string; country: string }[];

  constructor(options: LocaleEventOptions) {
    super(options);
    this.__locales = options.locales ?? [];
  }

  get locales() {
    return Object.freeze([...this.__locales]);
  }
}
