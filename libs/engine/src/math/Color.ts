import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

/**
 * RGBA color utility with float channels in range [0..1].
 * Commonly used for material base colors, clear colors, etc.
 */
export class Color extends AbstractVector<4> {
  private __r: number;
  private __g: number;
  private __b: number;
  private __a: number;

  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    super();
    this.__r = r;
    this.__g = g;
    this.__b = b;
    this.__a = a;
  }

  /** Red channel [0..1] */
  get r() {
    return this.__r;
  }
  /** Green channel [0..1] */
  get g() {
    return this.__g;
  }
  /** Blue channel [0..1] */
  get b() {
    return this.__b;
  }
  /** Alpha channel [0..1] */
  get a() {
    return this.__a;
  }

  /** Red channel [0..1] */
  set r(value) {
    this.__r = value;
    this.markAsDirty();
  }
  /** Green channel [0..1] */
  set g(value) {
    this.__g = value;
    this.markAsDirty();
  }

  /** Blue channel [0..1] */
  set b(value) {
    this.__b = value;
    this.markAsDirty();
  }

  /** Alpha channel [0..1] */
  set a(value) {
    this.__a = value;
    this.markAsDirty();
  }

  override sum(vector: this): this {
    this.__r += vector.r;
    this.__g += vector.g;
    this.__b += vector.b;
    this.__a += vector.a;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.__r -= vector.r;
    this.__g -= vector.g;
    this.__b -= vector.b;
    this.__a -= vector.a;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.__r *= vector.r;
    this.__g *= vector.g;
    this.__b *= vector.b;
    this.__a *= vector.a;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.__r /= vector.r;
    this.__g /= vector.g;
    this.__b /= vector.b;
    this.__a /= vector.a;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.__r *= scalar;
    this.__g *= scalar;
    this.__b *= scalar;
    this.__a *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.__r /= scalar;
    this.__g /= scalar;
    this.__b /= scalar;
    this.__a /= scalar;
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
    this.__r = r;
    this.__g = g;
    this.__b = b;
    this.__a = a;
    return this.markAsDirty();
  }

  /**
   * Sets the color from an RGB hex like 0xffcc00 and optional alpha.
   */
  setHex(hex: number, alpha?: number): this {
    this.__r = ((hex >> 16) & 0xff) / 0xff;
    this.__g = ((hex >> 8) & 0xff) / 0xff;
    this.__b = (hex & 0xff) / 0xff;
    this.__a = alpha !== undefined ? alpha : this.__a;
    return this.markAsDirty();
  }

  override copy(vector: this): this {
    this.__r = vector.__r;
    this.__g = vector.__g;
    this.__b = vector.__b;
    this.__a = vector.__a;
    return this.markAsDirty();
  }

  override toArray(): FixedArray<number, 4> {
    return [this.r, this.g, this.b, this.a];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.__r, this.__g, this.__b, this.__a]);
  }

  override toString(): string {
    return `Color(r: ${this.r}, g: ${this.g}, b: ${this.b}, a: ${this.a})`;
  }
}
