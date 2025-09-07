import { AbstractVector } from '../abstract';
import type { FixedArray } from '../types';
import type { Vector3 } from './Vector3';

/**
 * Represents a quaternion, a mathematical object used to represent rotations in 3D space.
 */
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

  get w() {
    return this.#w;
  }
  set w(value) {
    this.#w = value;
    this.markAsDirty();
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

  /**
   * Multiplies this quaternion by another quaternion.
   * Using Hamilton product
   *
   * @param vector The quaternion to multiply.
   * @returns This quaternion after multiplication.
   */
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

  /**
   * Divides this quaternion by another quaternion.
   * @param vector The quaternion to divide by.
   * @returns This quaternion after division.
   */
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

  /**
   * Normalizes this quaternion.
   * @returns This quaternion after normalization.
   */
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

  /**
   * Sets the components of this quaternion.
   * @param w The new w component.
   * @param x The new x component.
   * @param y The new y component.
   * @param z The new z component.
   * @returns This quaternion after setting the components.
   */
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

  /**
   * Converts this quaternion to an array.
   * @returns The array representation of the quaternion.
   */
  override toArray(): FixedArray<number, 4> {
    return [this.#w, this.#x, this.#y, this.#z];
  }

  /**
   * Converts this quaternion to a buffer.
   * @returns The buffer representation of the quaternion.
   */
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

  /**
   * Computes the conjugate of this quaternion.
   * @returns The conjugate quaternion.
   */
  conjugate(): this {
    return new Quaternion(this.#w, -this.#x, -this.#y, -this.#z) as this;
  }

  /**
   * Computes the inverse of this quaternion.
   * @returns The inverse quaternion.
   */
  inverse(): this {
    const normSq = this.dot(this);
    if (normSq === 0)
      throw new Error('Cannot invert a quaternion with zero norm');
    return this.conjugate().divS(normSq);
  }

  /**
   * Rotates this quaternion by a given axis and angle.
   * @param axis The axis to rotate around.
   * @param rad The angle to rotate by, in radians.
   * @returns This quaternion after rotation.
   */
  rotate(axis: Vector3, rad: number): this {
    const len = Math.hypot(axis.x, axis.y, axis.z);
    if (len === 0) return this;
    const half = rad * 0.5;
    const s = Math.sin(half) / len;
    const c = Math.cos(half);
    const q = new Quaternion(c, axis.x * s, axis.y * s, axis.z * s) as this;
    return this.mul(q).normalize();
  }

  /**
   * Applies this quaternion to a vector, rotating it in-place.
   * Rotate vector in-place: v' = q * v * q^{-1}
   *
   * @param v The vector to rotate.
   * @returns The rotated vector.
   */
  applyToVector(v: Vector3): this {
    const vq = new Quaternion(0, v.x, v.y, v.z) as this;
    const resQ = this.clone().mul(vq).mul(this.clone().inverse());
    v.x = resQ.x;
    v.y = resQ.y;
    v.z = resQ.z;
    return this;
  }
}
