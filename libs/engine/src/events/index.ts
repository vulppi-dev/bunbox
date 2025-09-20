import type { Event } from './Event';
import type { LocaleEvent } from './LocaleEvent';
import type { QuitEvent } from './QuitEvent';
import type { ThemeEvent } from './ThemeEvent';
import type { DisplayEvent } from './DisplayEvent';

export * from './Event';
export * from './LocaleEvent';
export * from './QuitEvent';
export * from './ThemeEvent';
export * from './DisplayEvent';

export type SDL_EventMap = {
  quit: [QuitEvent];
  terminating: [Event];
  lowMemory: [Event];
  locale: [LocaleEvent];
  theme: [ThemeEvent];
  orientation: [DisplayEvent];
  displayAdded: [DisplayEvent];
  displayRemoved: [DisplayEvent];
  displayMoved: [DisplayEvent];
};
