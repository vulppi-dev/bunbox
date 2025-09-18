import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

export class Color extends AbstractVector<4> {
  #r: number;
  #g: number;
  #b: number;
  #a: number;

  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    super();
    this.#r = r;
    this.#g = g;
    this.#b = b;
    this.#a = a;
  }

  get r() {
    return this.#r;
  }

  set r(value) {
    this.#r = value;
    this.markAsDirty();
  }

  get g() {
    return this.#g;
  }

  set g(value) {
    this.#g = value;
    this.markAsDirty();
  }

  get b() {
    return this.#b;
  }

  set b(value) {
    this.#b = value;
    this.markAsDirty();
  }

  get a() {
    return this.#a;
  }

  set a(value) {
    this.#a = value;
    this.markAsDirty();
  }

  override sum(vector: this): this {
    this.#r += vector.r;
    this.#g += vector.g;
    this.#b += vector.b;
    this.#a += vector.a;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.#r -= vector.r;
    this.#g -= vector.g;
    this.#b -= vector.b;
    this.#a -= vector.a;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.#r *= vector.r;
    this.#g *= vector.g;
    this.#b *= vector.b;
    this.#a *= vector.a;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.#r /= vector.r;
    this.#g /= vector.g;
    this.#b /= vector.b;
    this.#a /= vector.a;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.#r *= scalar;
    this.#g *= scalar;
    this.#b *= scalar;
    this.#a *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#r /= scalar;
    this.#g /= scalar;
    this.#b /= scalar;
    this.#a /= scalar;
    return this.markAsDirty();
  }

  override dot(vector: this): number {
    return (
      this.r * vector.r +
      this.g * vector.g +
      this.b * vector.b +
      this.a * vector.a
    );
  }

  override set(r: number, g: number, b: number, a: number): this {
    this.#r = r;
    this.#g = g;
    this.#b = b;
    this.#a = a;
    return this.markAsDirty();
  }

  override copy(vector: this): this {
    this.#r = vector.#r;
    this.#g = vector.#g;
    this.#b = vector.#b;
    this.#a = vector.#a;
    return this.markAsDirty();
  }

  override toArray(): FixedArray<number, 4> {
    return [this.r, this.g, this.b, this.a];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.#r, this.#g, this.#b, this.#a]);
  }

  override toString(): string {
    return `Color(r: ${this.r}, g: ${this.g}, b: ${this.b}, a: ${this.a})`;
  }
}
