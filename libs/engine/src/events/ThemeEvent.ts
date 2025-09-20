import { Event, type EventOptions } from './Event';

export type ThemeEventOptions = {
  mode?: 'light' | 'dark' | 'system';
} & EventOptions;

export class ThemeEvent extends Event {
  #mode: 'light' | 'dark' | 'system' = 'system';

  constructor(options: ThemeEventOptions) {
    super(options);
    this.#mode = options.mode ?? 'system';
  }

  get mode() {
    return this.#mode;
  }
}
