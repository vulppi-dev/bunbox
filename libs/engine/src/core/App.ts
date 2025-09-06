import { cstr, SDL, SDL_InitFlags } from '@bunbox/sdl3';
import { EventEmitter } from '../abstract/EventEmitter';
import { RETAIN_MAP } from '../utils/retain';

type AppFeatures =
  | 'audio'
  | 'video'
  | 'joystick'
  | 'haptic'
  | 'gamepad'
  | 'events'
  | 'sensor'
  | 'camera';

export type AppOptions = {
  /** @default ['video','events'] */
  features?: AppFeatures[];
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
      switch (feature) {
        case 'audio':
          flags |= SDL_InitFlags.SDL_INIT_AUDIO;
          break;
        case 'video':
          flags |= SDL_InitFlags.SDL_INIT_VIDEO;
          break;
        case 'joystick':
          flags |= SDL_InitFlags.SDL_INIT_JOYSTICK;
          break;
        case 'haptic':
          flags |= SDL_InitFlags.SDL_INIT_HAPTIC;
          break;
        case 'gamepad':
          flags |= SDL_InitFlags.SDL_INIT_GAMEPAD;
          break;
        case 'events':
          flags |= SDL_InitFlags.SDL_INIT_EVENTS;
          break;
        case 'sensor':
          flags |= SDL_InitFlags.SDL_INIT_SENSOR;
          break;
        case 'camera':
          flags |= SDL_InitFlags.SDL_INIT_CAMERA;
          break;
        default:
          throw new Error(`Unknown feature: ${feature}`);
      }

      // Initialize SDL with the specified flags
      const result = SDL.SDL_Init(flags);
      if (!result) {
        throw new Error(`Failed to initialize SDL: ${SDL.SDL_GetError()}`);
      }

      const nameValue = cstr(name);
      const versionValue = cstr(version);
      const identifierValue = cstr(identifier);
      RETAIN_MAP.set(`${this.id}-name`, nameValue);
      RETAIN_MAP.set(`${this.id}-version`, versionValue);
      RETAIN_MAP.set(`${this.id}-identifier`, identifierValue);

      SDL.SDL_SetAppMetadata(nameValue, versionValue, identifierValue);

      this.on('dispose', () => {
        RETAIN_MAP.delete(`${this.id}-name`);
        RETAIN_MAP.delete(`${this.id}-version`);
        RETAIN_MAP.delete(`${this.id}-identifier`);

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
}
