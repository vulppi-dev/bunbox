import { cstr, SDL } from '@bunbox/sdl3';
import { EventEmitter } from '../abstract/EventEmitter';
import { Window } from './Window';
import { ptr, type Pointer } from 'bun:ffi';
import { POINTERS_MAP, RETAIN_MAP } from '../stores/global';
import { Node } from '../abstract/Node';

export class Renderer extends Node {
  #rendererPtr: Pointer | null = null;
  #widthBuffer = new Int32Array(1);
  #heightBuffer = new Int32Array(1);

  #width = 0;
  #height = 0;

  constructor() {
    super();
    this.on('dispose', () => {
      if (this.#rendererPtr) {
        SDL.SDL_DestroyRenderer(this.#rendererPtr);
        RETAIN_MAP.delete(`${this.id}-background`);
        POINTERS_MAP.delete(this.id);
        this.#rendererPtr = null;
      }
    });
  }

  protected override _ready(): void {
    const win = this.findByType(Window)[0];
    if (!win) throw new Error('No window parent found in the node tree');
    const winPtr = POINTERS_MAP.get(win.id)!;
    const background = cstr(process.platform === 'darwin' ? 'metal' : 'vulkan');
    RETAIN_MAP.set(`${this.id}-background`, background);
    if (this.#rendererPtr) {
      SDL.SDL_DestroyRenderer(this.#rendererPtr);
    }
    this.#rendererPtr = SDL.SDL_CreateRenderer(winPtr, background);
    if (!this.#rendererPtr) throw new Error(`SDL: ${SDL.SDL_GetError()}`);
    POINTERS_MAP.set(this.id, this.#rendererPtr);
  }

  override _process(deltaTime: number): void {
    if (!this.#rendererPtr) return;

    // Update width and height
    let success = SDL.SDL_GetRenderOutputSize(
      this.#rendererPtr,
      ptr(this.#widthBuffer),
      ptr(this.#heightBuffer),
    );
    if (success) {
      this.#width = this.#widthBuffer[0]!;
      this.#height = this.#heightBuffer[0]!;
    } else {
      this.#width = 0;
      this.#height = 0;
    }
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get viewport() {
    return { x: 0, y: 0, width: this.#width, height: this.#height };
  }
}
