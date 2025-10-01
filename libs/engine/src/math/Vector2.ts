import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

/**
 * 2D vector utility used for sizes, UVs and 2D positions.
 * All operations are in-place and return `this` for chaining.
 */
export class Vector2 extends AbstractVector<2> {
  #x: number;
  #y: number;

  /** Returns (0, 0). */
  static Zero(): Vector2 {
    return new Vector2(0, 0);
  }

  /** Returns (1, 1). */
  static One(): Vector2 {
    return new Vector2(1, 1);
  }

  /** Returns (0, 1). */
  static Up(): Vector2 {
    return new Vector2(0, 1);
  }

  /** Returns (0, -1). */
  static Down(): Vector2 {
    return new Vector2(0, -1);
  }

  /** Returns (-1, 0). */
  static Left(): Vector2 {
    return new Vector2(-1, 0);
  }

  /** Returns (1, 0). */
  static Right(): Vector2 {
    return new Vector2(1, 0);
  }

  /**
   * Create a new Vector2.
   * @param x X component
   * @param y Y component
   */
  constructor(x: number = 0, y: number = 0) {
    super();
    this.#x = x;
    this.#y = y;
  }

  /** X component */
  get x() {
    return this.#x;
  }

  /** X component */
  set x(value) {
    this.#x = value;
    this.markAsDirty();
  }

  /** Y component */
  get y() {
    return this.#y;
  }

  /** Y component */
  set y(value) {
    this.#y = value;
    this.markAsDirty();
  }

  /** Component-wise addition. */
  override sum(vector: this): this {
    this.#x += vector.x;
    this.#y += vector.y;
    return this.markAsDirty();
  }

  /** Component-wise subtraction. */
  override sub(vector: this): this {
    this.#x -= vector.x;
    this.#y -= vector.y;
    return this.markAsDirty();
  }

  /** Component-wise multiplication. */
  override mul(vector: this): this {
    this.#x *= vector.x;
    this.#y *= vector.y;
    return this.markAsDirty();
  }

  /** Component-wise division. */
  override div(vector: this): this {
    this.#x /= vector.x;
    this.#y /= vector.y;
    return this.markAsDirty();
  }

  /** Multiply by scalar. */
  override mulS(scalar: number): this {
    this.#x *= scalar;
    this.#y *= scalar;
    return this.markAsDirty();
  }

  /** Divide by scalar. */
  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#x /= scalar;
    this.#y /= scalar;
    return this.markAsDirty();
  }

  /** Dot product. */
  override dot(vector: this): number {
    return this.x * vector.x + this.y * vector.y;
  }

  /** Set both components. */
  override set(x: number, y: number): this {
    this.#x = x;
    this.#y = y;
    return this.markAsDirty();
  }

  /** Copy both components from another vector. */
  override copy(vector: this): this {
    this.#x = vector.x;
    this.#y = vector.y;
    return this.markAsDirty();
  }

  /** Returns [x, y]. */
  override toArray(): FixedArray<number, 2> {
    return [this.x, this.y];
  }

  /** Returns Float32Array [x, y]. */
  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y]);
  }

  /** String representation for debugging. */
  override toString(): string {
    return `Vector2(x: ${this.x}, y: ${this.y})`;
  }
}
