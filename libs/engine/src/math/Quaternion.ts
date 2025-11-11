import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';
import type { Vector3 } from './Vector3';

/** Represents a rotation in 3D space. */
export class Quaternion extends AbstractVector<4> {
  private __w: number;
  private __x: number;
  private __y: number;
  private __z: number;

  constructor(w: number = 1, x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.__w = w;
    this.__x = x;
    this.__y = y;
    this.__z = z;
  }

  /** Scalar component */
  get w() {
    return this.__w;
  }
  /** X vector component */
  get x() {
    return this.__x;
  }
  /** Y vector component */
  get y() {
    return this.__y;
  }
  /** Z vector component */
  get z() {
    return this.__z;
  }
  set w(value) {
    this.__w = value;
    this.markAsDirty();
  }
  set x(value) {
    this.__x = value;
    this.markAsDirty();
  }
  set y(value) {
    this.__y = value;
    this.markAsDirty();
  }
  set z(value) {
    this.__z = value;
    this.markAsDirty();
  }

  /**
   * Adds another quaternion to this quaternion.
   * @param vector The quaternion to add.
   * @returns This quaternion after addition.
   */
  override sum(vector: this): this {
    this.__w += vector.w;
    this.__x += vector.x;
    this.__y += vector.y;
    this.__z += vector.z;
    return this.markAsDirty();
  }

  /**
   * Subtracts another quaternion from this quaternion.
   * @param vector The quaternion to subtract.
   * @returns This quaternion after subtraction.
   */
  override sub(vector: this): this {
    this.__w -= vector.w;
    this.__x -= vector.x;
    this.__y -= vector.y;
    this.__z -= vector.z;
    return this.markAsDirty();
  }

  /** Multiplies this quaternion by another (Hamilton product). */
  override mul(vector: this): this {
    const w1 = this.__w,
      x1 = this.__x,
      y1 = this.__y,
      z1 = this.__z;
    const w2 = vector.__w,
      x2 = vector.__x,
      y2 = vector.__y,
      z2 = vector.__z;
    this.__w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.__x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    this.__y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
    this.__z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
    return this.markAsDirty();
  }

  /** Divides this quaternion by another quaternion. */
  override div(vector: this): this {
    const inv = vector.inverse();
    this.mul(inv);
    return this.markAsDirty();
  }

  /**
   * Multiplies this quaternion by a scalar.
   * @param scalar The scalar to multiply by.
   * @returns This quaternion after multiplication.
   */
  override mulS(scalar: number): this {
    this.__w *= scalar;
    this.__x *= scalar;
    this.__y *= scalar;
    this.__z *= scalar;
    return this.markAsDirty();
  }

  /**
   * Divides this quaternion by a scalar.
   * @param scalar The scalar to divide by.
   * @returns This quaternion after division.
   */
  override divS(scalar: number): this {
    if (scalar === 0) throw new Error('Division by zero');
    this.__w /= scalar;
    this.__x /= scalar;
    this.__y /= scalar;
    this.__z /= scalar;
    return this.markAsDirty();
  }

  /**
   * Computes the dot product of this quaternion with another quaternion.
   * @param vector The quaternion to dot with.
   * @returns The dot product.
   */
  override dot(vector: this): number {
    return (
      this.__w * vector.w +
      this.__x * vector.x +
      this.__y * vector.y +
      this.__z * vector.z
    );
  }

  /** Normalizes this quaternion. */
  override normalize(): this {
    const n = this.length();
    if (n > 0) {
      this.__w /= n;
      this.__x /= n;
      this.__y /= n;
      this.__z /= n;
    }
    return this.markAsDirty();
  }

  /** Sets quaternion components. */
  override set(w: number, x: number, y: number, z: number): this {
    this.__w = w;
    this.__x = x;
    this.__y = y;
    this.__z = z;
    return this.markAsDirty();
  }

  /**
   * Copies the components of another quaternion to this quaternion.
   * @param vector The quaternion to copy from.
   * @returns This quaternion after copying the components.
   */
  override copy(vector: this): this {
    this.__w = vector.w;
    this.__x = vector.x;
    this.__y = vector.y;
    this.__z = vector.z;
    return this.markAsDirty();
  }

  /** Returns [w, x, y, z] array. */
  override toArray(): FixedArray<number, 4> {
    return [this.__w, this.__x, this.__y, this.__z];
  }

  /** Returns Float32Array [w, x, y, z]. */
  override toBuffer(): Float32Array {
    return new Float32Array([this.__w, this.__x, this.__y, this.__z]);
  }

  /**
   * Converts this quaternion to a string.
   * @returns The string representation of the quaternion.
   */
  override toString(): string {
    return `Quaternion(w: ${this.__w}, x: ${this.__x}, y: ${this.__y}, z: ${this.__z})`;
  }

  /** Returns the conjugate quaternion. */
  conjugate(): this {
    return new Quaternion(this.__w, -this.__x, -this.__y, -this.__z) as this;
  }

  /** Returns the inverse quaternion. */
  inverse(): this {
    const normSq = this.dot(this);
    if (normSq === 0)
      throw new Error('Cannot invert a quaternion with zero norm');
    return this.conjugate().divS(normSq);
  }

  /** Rotate by axis-angle (radians). */
  rotate(axis: Vector3, rad: number): this {
    const len = Math.hypot(axis.x, axis.y, axis.z);
    if (len === 0) return this;
    const half = rad * 0.5;
    const s = Math.sin(half) / len;
    const c = Math.cos(half);
    const q = new Quaternion(c, axis.x * s, axis.y * s, axis.z * s) as this;
    return this.mul(q).normalize();
  }

  /** Apply rotation to vector in-place: v' = q * v * q^{-1}. */
  applyToVector(v: Vector3): this {
    const vq = new Quaternion(0, v.x, v.y, v.z) as this;
    const resQ = this.clone().mul(vq).mul(this.clone().inverse());
    v.x = resQ.x;
    v.y = resQ.y;
    v.z = resQ.z;
    return this;
  }
}
