import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';
import type { Vector3 } from './Vector3';

/** Represents a rotation in 3D space. */
export class Quaternion extends AbstractVector<4> {
  #w: number;
  #x: number;
  #y: number;
  #z: number;

  constructor(w: number = 1, x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.#w = w;
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  /** Scalar component */
  get w() {
    return this.#w;
  }
  set w(value) {
    this.#w = value;
    this.markAsDirty();
  }

  /** X vector component */
  get x() {
    return this.#x;
  }
  set x(value) {
    this.#x = value;
    this.markAsDirty();
  }

  /** Y vector component */
  get y() {
    return this.#y;
  }
  set y(value) {
    this.#y = value;
    this.markAsDirty();
  }

  /** Z vector component */
  get z() {
    return this.#z;
  }
  set z(value) {
    this.#z = value;
    this.markAsDirty();
  }

  /**
   * Adds another quaternion to this quaternion.
   * @param vector The quaternion to add.
   * @returns This quaternion after addition.
   */
  override sum(vector: this): this {
    this.#w += vector.w;
    this.#x += vector.x;
    this.#y += vector.y;
    this.#z += vector.z;
    return this.markAsDirty();
  }

  /**
   * Subtracts another quaternion from this quaternion.
   * @param vector The quaternion to subtract.
   * @returns This quaternion after subtraction.
   */
  override sub(vector: this): this {
    this.#w -= vector.w;
    this.#x -= vector.x;
    this.#y -= vector.y;
    this.#z -= vector.z;
    return this.markAsDirty();
  }

  /** Multiplies this quaternion by another (Hamilton product). */
  override mul(vector: this): this {
    const w1 = this.#w,
      x1 = this.#x,
      y1 = this.#y,
      z1 = this.#z;
    const w2 = vector.#w,
      x2 = vector.#x,
      y2 = vector.#y,
      z2 = vector.#z;
    this.#w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.#x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    this.#y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
    this.#z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
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
    this.#w *= scalar;
    this.#x *= scalar;
    this.#y *= scalar;
    this.#z *= scalar;
    return this.markAsDirty();
  }

  /**
   * Divides this quaternion by a scalar.
   * @param scalar The scalar to divide by.
   * @returns This quaternion after division.
   */
  override divS(scalar: number): this {
    if (scalar === 0) throw new Error('Division by zero');
    this.#w /= scalar;
    this.#x /= scalar;
    this.#y /= scalar;
    this.#z /= scalar;
    return this.markAsDirty();
  }

  /**
   * Computes the dot product of this quaternion with another quaternion.
   * @param vector The quaternion to dot with.
   * @returns The dot product.
   */
  override dot(vector: this): number {
    return (
      this.#w * vector.w +
      this.#x * vector.x +
      this.#y * vector.y +
      this.#z * vector.z
    );
  }

  /** Normalizes this quaternion. */
  override normalize(): this {
    const n = this.length();
    if (n > 0) {
      this.#w /= n;
      this.#x /= n;
      this.#y /= n;
      this.#z /= n;
    }
    return this.markAsDirty();
  }

  /** Sets quaternion components. */
  override set(w: number, x: number, y: number, z: number): this {
    this.#w = w;
    this.#x = x;
    this.#y = y;
    this.#z = z;
    return this.markAsDirty();
  }

  /**
   * Copies the components of another quaternion to this quaternion.
   * @param vector The quaternion to copy from.
   * @returns This quaternion after copying the components.
   */
  override copy(vector: this): this {
    this.#w = vector.w;
    this.#x = vector.x;
    this.#y = vector.y;
    this.#z = vector.z;
    return this.markAsDirty();
  }

  /** Returns [w, x, y, z] array. */
  override toArray(): FixedArray<number, 4> {
    return [this.#w, this.#x, this.#y, this.#z];
  }

  /** Returns Float32Array [w, x, y, z]. */
  override toBuffer(): Float32Array {
    return new Float32Array([this.#w, this.#x, this.#y, this.#z]);
  }

  /**
   * Converts this quaternion to a string.
   * @returns The string representation of the quaternion.
   */
  override toString(): string {
    return `Quaternion(w: ${this.#w}, x: ${this.#x}, y: ${this.#y}, z: ${this.#z})`;
  }

  /** Returns the conjugate quaternion. */
  conjugate(): this {
    return new Quaternion(this.#w, -this.#x, -this.#y, -this.#z) as this;
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
