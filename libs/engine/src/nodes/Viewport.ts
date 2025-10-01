import type { EventMap } from '@bunbox/utils';
import { Node3D } from './Node3D';
import { Texture } from '../elements';
/**
 * Logical render surface that owns a render target texture and viewport rectangle.
 * A child Camera renders into this target; Window can composite multiple viewports.
 */
export class Viewport<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node3D<P, M, T> {
  /** Optional render target; when null, rendering uses default backbuffer. */
  #target: Texture | null = null;

  #x: number = 0;
  #y: number = 0;
  #width: number = 0;
  #height: number = 0;

  constructor() {
    super();
  }

  protected override _getType(): string {
    return 'Viewport';
  }

  /** Render target texture this viewport writes into, or null for backbuffer. */
  get target(): Texture | null {
    return this.#target;
  }
  set target(value: Texture | null) {
    this.#target = value;
    this.markAsDirty();
  }

  /** Viewport X origin in pixels. */
  get x(): number {
    return this.#x;
  }
  set x(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  /** Viewport Y origin in pixels. */
  get y(): number {
    return this.#y;
  }
  set y(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  /** Viewport width in pixels. */
  get width(): number {
    return this.#width;
  }
  set width(value: number) {
    this.#width = value;
    this.markAsDirty();
  }

  /** Viewport height in pixels. */
  get height(): number {
    return this.#height;
  }
  set height(value: number) {
    this.#height = value;
    this.markAsDirty();
  }
}
