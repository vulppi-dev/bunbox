import { AbstractVector } from '../abstract';
import type { FixedArray } from '../types';

export class Vector2 extends AbstractVector<2> {
  #x: number;
  #y: number;

  constructor(x: number = 0, y: number = 0) {
    super();
    this.#x = x;
    this.#y = y;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = value;
    this.markAsDirty();
  }

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = value;
    this.markAsDirty();
  }

  override sum(vector: this): this {
    this.#x += vector.x;
    this.#y += vector.y;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.#x -= vector.x;
    this.#y -= vector.y;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.#x *= vector.x;
    this.#y *= vector.y;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.#x /= vector.x;
    this.#y /= vector.y;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.#x *= scalar;
    this.#y *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#x /= scalar;
    this.#y /= scalar;
    return this.markAsDirty();
  }

  override dot(vector: this): number {
    return this.x * vector.x + this.y * vector.y;
  }

  override set(x: number, y: number): this {
    this.#x = x;
    this.#y = y;
    return this.markAsDirty();
  }

  override copy(vector: this): this {
    this.#x = vector.x;
    this.#y = vector.y;
    return this.markAsDirty();
  }

  override toArray(): FixedArray<number, 2> {
    return [this.x, this.y];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y]);
  }

  override toString(): string {
    return `Vector2(x: ${this.x}, y: ${this.y})`;
  }
}
