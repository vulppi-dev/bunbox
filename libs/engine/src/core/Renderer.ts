import {
  SDL,
  SDL_FColor,
  SDL_GPUColorTargetInfo,
  SDL_GPULoadOp,
  SDL_GPUStoreOp,
} from '@bunbox/sdl3';
import type { Pointer } from 'bun:ffi';
import { Color } from '../math';
import { POINTERS_MAP } from '../stores/global';
import { getChildrenStack } from '../utils/node';
import { Window } from './Window';
import { Mesh } from '../elements/Mesh';
import { Node } from './Node';

export class Renderer extends Node {
  #clearColor = new Color();
  #winPtr: Pointer | null = null;
  #devicePtr: Pointer | null = null;
  #background: 'vulkan' | 'metal' = 'vulkan';
  #swapFormat: number = 0;

  // Helpers
  #currentCmd: Pointer | null = null;
  #texPtr = new BigUint64Array(1);
  #widthPtr = new Uint32Array(1);
  #heightPtr = new Uint32Array(1);

  #ready = false;
  #meshes: Mesh[] = [];

  constructor() {
    super();

    this.on('add-child', () => {
      if (!this.#ready) return;
      this.#meshes = getChildrenStack(this, Mesh);
    });
    this.on('remove-child', () => {
      if (!this.#ready) return;
      this.#meshes = getChildrenStack(this, Mesh);
    });
  }

  protected override _getType(): string {
    return 'Renderer';
  }

  get clearColor() {
    return this.#clearColor;
  }

  set clearColor(value: Color) {
    this.#clearColor.copy(value);
    this.markAsDirty();
  }

  protected override _ready(): void {
    const win = this.findByType(Window)[0];
    if (!win) throw new Error('No window parent found in the node tree');
    this.#winPtr = POINTERS_MAP.get(win.id) ?? null;
    this.#devicePtr = POINTERS_MAP.get(`${win.id}-device`) ?? null;
    this.#background = process.platform === 'darwin' ? 'metal' : 'vulkan';
    this.#swapFormat = SDL.SDL_GetGPUSwapchainTextureFormat(
      this.#devicePtr,
      this.#winPtr,
    );

    this.#ready = true;
    this.#meshes = getChildrenStack(this, Mesh);
  }

  override _afterRender(_: number): void {
    if (!this.#winPtr || !this.#devicePtr) return;

    this.#currentCmd = SDL.SDL_AcquireGPUCommandBuffer(this.#devicePtr);
    if (!this.#currentCmd) {
      console.warn('SDL_AcquireGPUCommandBuffer failed');
      return;
    }

    let success = SDL.SDL_AcquireGPUSwapchainTexture(
      this.#currentCmd,
      this.#winPtr,
      this.#texPtr,
      this.#widthPtr,
      this.#heightPtr,
    );

    if (
      !success ||
      !this.#texPtr[0] ||
      this.#widthPtr[0] === 0 ||
      this.#heightPtr[0] === 0
    ) {
      SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
      return;
    }

    this.#clearScreen();

    // TODO: render children

    SDL.SDL_SubmitGPUCommandBuffer(this.#currentCmd);
    this.#currentCmd = null;
    const err = SDL.SDL_GetError().toString();
    if (err) console.log('[SDL ERROR]', err);
  }

  #clearScreen() {
    const colorTarget = new SDL_GPUColorTargetInfo();
    colorTarget.properties.texture = this.#texPtr[0]!;
    const clear_color = new SDL_FColor();

    clear_color.properties.r = this.#clearColor.r;
    clear_color.properties.g = this.#clearColor.g;
    clear_color.properties.b = this.#clearColor.b;
    clear_color.properties.a = this.#clearColor.a;
    colorTarget.properties.clear_color = clear_color;
    colorTarget.properties.load_op = SDL_GPULoadOp.SDL_GPU_LOADOP_CLEAR;
    colorTarget.properties.store_op = SDL_GPUStoreOp.SDL_GPU_STOREOP_STORE;

    const pass = SDL.SDL_BeginGPURenderPass(
      this.#currentCmd,
      colorTarget.bunPointer,
      1,
      null,
    );
    SDL.SDL_EndGPURenderPass(pass);
  }
}
