import { Event, type EventOptions } from './Event';

export type ThemeEventOptions = {
  mode?: 'light' | 'dark' | 'system';
} & EventOptions;

export class ThemeEvent extends Event {
  private __mode: 'light' | 'dark' | 'system' = 'system';

  constructor(options: ThemeEventOptions) {
    super(options);
    this.__mode = options.mode ?? 'system';
  }

  get mode() {
    return this.__mode;
  }
}
