import type { EventMap } from '@bunbox/utils';
import { Node } from '../core';
import type { TextureImage } from '../elements';
/**
 * Logical render surface that owns a render target texture and viewport rectangle.
 * A child Camera renders into this target; Window can composite multiple viewports.
 */
export class Viewport<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node<P, M, T> {
  /** Optional render target; when null, rendering uses default backbuffer. */
  #target: TextureImage | null = null;

  #x: number = 0;
  #y: number = 0;
  #width: number = 0;
  #height: number = 0;

  constructor() {
    super();
  }

  /** Render target texture this viewport writes into, or null for backbuffer. */
  get target(): TextureImage | null {
    return this.#target;
  }

  /** Viewport X origin in pixels. */
  get x(): number {
    return this.#x;
  }

  /** Viewport Y origin in pixels. */
  get y(): number {
    return this.#y;
  }

  /** Viewport width in pixels. */
  get width(): number {
    return this.#width;
  }

  /** Viewport height in pixels. */
  get height(): number {
    return this.#height;
  }

  set target(value: TextureImage | null) {
    this.#target = value;
    this.markAsDirty();
  }

  set x(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  set y(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  set width(value: number) {
    this.#width = value;
    this.markAsDirty();
  }

  set height(value: number) {
    this.#height = value;
    this.markAsDirty();
  }
}
