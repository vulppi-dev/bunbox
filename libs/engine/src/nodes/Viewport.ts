import type { EventMap } from '@bunbox/utils';
import { Node3D } from './Node3D';
import { Texture } from '../elements';

export class Viewport<
  P extends Record<string, any> = Record<string, any>,
  M extends Record<string, any> = Record<string, any>,
  T extends EventMap = {},
> extends Node3D<P, M, T> {
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

  get target(): Texture | null {
    return this.#target;
  }
  set target(value: Texture | null) {
    this.#target = value;
    this.markAsDirty();
  }

  get x(): number {
    return this.#x;
  }
  set x(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  get y(): number {
    return this.#y;
  }
  set y(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  get width(): number {
    return this.#width;
  }
  set width(value: number) {
    this.#width = value;
    this.markAsDirty();
  }

  get height(): number {
    return this.#height;
  }
  set height(value: number) {
    this.#height = value;
    this.markAsDirty();
  }
}
