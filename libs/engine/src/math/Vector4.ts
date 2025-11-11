import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

/**
 * 4D vector utility. Often used for homogeneous coordinates or generic 4-tuples.
 * All operations are in-place and return `this` for chaining.
 */
export class Vector4 extends AbstractVector<4> {
  private __x: number;
  private __y: number;
  private __z: number;
  private __w: number;

  /**
   * Create a new Vector4.
   * @param x X component
   * @param y Y component
   * @param z Z component
   * @param w W component
   */
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    super();
    this.__x = x;
    this.__y = y;
    this.__z = z;
    this.__w = w;
  }

  /** X component */
  get x() {
    return this.__x;
  }
  /** Y component */
  get y() {
    return this.__y;
  }
  /** Z component */
  get z() {
    return this.__z;
  }
  /** W component */
  get w() {
    return this.__w;
  }
  /** X component */
  set x(value) {
    this.__x = value;
    this.markAsDirty();
  }
  /** Y component */
  set y(value) {
    this.__y = value;
    this.markAsDirty();
  }
  /** Z component */
  set z(value) {
    this.__z = value;
    this.markAsDirty();
  }
  /** W component */
  set w(value) {
    this.__w = value;
    this.markAsDirty();
  }

  /** Component-wise addition. */
  override sum(vector: this): this {
    this.__x += vector.x;
    this.__y += vector.y;
    this.__z += vector.z;
    this.__w += vector.w;
    return this.markAsDirty();
  }

  /** Component-wise subtraction. */
  override sub(vector: this): this {
    this.__x -= vector.x;
    this.__y -= vector.y;
    this.__z -= vector.z;
    this.__w -= vector.w;
    return this.markAsDirty();
  }

  /** Component-wise multiplication. */
  override mul(vector: this): this {
    this.__x *= vector.x;
    this.__y *= vector.y;
    this.__z *= vector.z;
    this.__w *= vector.w;
    return this.markAsDirty();
  }

  /** Component-wise division. */
  override div(vector: this): this {
    this.__x /= vector.x;
    this.__y /= vector.y;
    this.__z /= vector.z;
    this.__w /= vector.w;
    return this.markAsDirty();
  }

  /** Multiply by scalar. */
  override mulS(scalar: number): this {
    this.__x *= scalar;
    this.__y *= scalar;
    this.__z *= scalar;
    this.__w *= scalar;
    return this.markAsDirty();
  }

  /** Divide by scalar. */
  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.__x /= scalar;
    this.__y /= scalar;
    this.__z /= scalar;
    this.__w /= scalar;
    return this.markAsDirty();
  }

  /** Dot product. */
  override dot(vector: this): number {
    return (
      this.x * vector.x +
      this.y * vector.y +
      this.z * vector.z +
      this.w * vector.w
    );
  }

  /** Set all components. */
  override set(x: number, y: number, z: number, w: number): this {
    this.__x = x;
    this.__y = y;
    this.__z = z;
    this.__w = w;
    return this.markAsDirty();
  }

  /** Copy all components from another vector. */
  override copy(vector: this): this {
    this.__x = vector.__x;
    this.__y = vector.__y;
    this.__z = vector.__z;
    this.__w = vector.__w;
    return this.markAsDirty();
  }

  /** Returns [x, y, z, w]. */
  override toArray(): FixedArray<number, 4> {
    return [this.x, this.y, this.z, this.w];
  }

  /** Returns Float32Array [x, y, z, w]. */
  override toBuffer(): Float32Array {
    return new Float32Array([this.__x, this.__y, this.__z, this.__w]);
  }

  /** String representation for debugging. */
  override toString(): string {
    return `Vector4(x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w})`;
  }
}
