import { cstr, SDL } from '@bunbox/sdl3';
import {
  APP_FEATURES_MAP,
  APP_LOG_CATEGORY_MAP,
  APP_LOG_PRIORITY_MAP,
} from '../constants';
import type { AppFeature, AppLogCategory, AppLogPriority } from '../types';
import { EventEmitter } from '@bunbox/utils';

export type AppOptions = {
  /** @default ['video','events'] */
  features?: AppFeature[];
  name?: string;
  version?: string;
  identifier?: string;
};

declare global {
  const appInstance: InstanceType<typeof App>;
}

export class App extends EventEmitter {
  static #singleAppInstance: App | null = null;

  constructor(options?: AppOptions) {
    super();

    if (App.#singleAppInstance) {
      throw new Error(
        'App instance already exists. Only one instance is allowed.',
      );
    }

    const {
      name = 'Bunbox App',
      version = '1.0.0',
      identifier = 'dev.vulppi.bunbox.app',
      features = ['video', 'events'],
    } = options || {};

    let flags = 0;
    for (const feature of features) {
      flags |= APP_FEATURES_MAP[feature] ?? 0;

      // Initialize SDL with the specified flags
      const result = SDL.SDL_Init(flags);
      if (!result) {
        throw new Error(`SDL: ${SDL.SDL_GetError()}`);
      }

      SDL.SDL_SetAppMetadata(cstr(name), cstr(version), cstr(identifier));
      SDL.SDL_SetHint(cstr('SDL_LOGGING'), cstr('test=verbose,*=info'));

      this.on('dispose', () => {
        SDL.SDL_Quit();
        App.#singleAppInstance = null;
      });

      process.on('exit', () => {
        this.dispose();
      });

      Object.defineProperty(globalThis, 'appInstance', {
        value: this,
        writable: false,
        configurable: false,
        enumerable: true,
      });
    }
  }

  setLogPriority(priority: AppLogPriority) {
    SDL.SDL_SetLogPriorities(APP_LOG_PRIORITY_MAP[priority]);
  }

  setCategoryLogPriority(category: AppLogCategory, priority: AppLogPriority) {
    SDL.SDL_SetLogPriority(
      APP_LOG_CATEGORY_MAP[category],
      APP_LOG_PRIORITY_MAP[priority],
    );
  }
}
