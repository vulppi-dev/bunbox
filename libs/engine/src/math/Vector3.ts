import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

/**
 * 3D vector utility used across the engine for positions, directions and scales.
 *
 * Right-handed convention. Units follow the engine standard (meters).
 */
export class Vector3 extends AbstractVector<3> {
  #x: number;
  #y: number;
  #z: number;

  /**
   * Returns a zero vector (0, 0, 0).
   */
  static Zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /**
   * Returns a unit vector with all components set to 1 (1, 1, 1).
   */
  static One(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  /**
   * Returns the up direction (0, 1, 0).
   */
  static Up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  /**
   * Returns the down direction (0, -1, 0).
   */
  static Down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  /**
   * Returns the left direction (-1, 0, 0).
   */
  static Left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  /**
   * Returns the right direction (1, 0, 0).
   */
  static Right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  /**
   * Returns the forward direction (0, 0, 1).
   */
  static Forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  /**
   * Returns the backward direction (0, 0, -1).
   */
  static Backward(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  /**
   * Create a new Vector3.
   * @param x X component
   * @param y Y component
   * @param z Z component
   */
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  /** X component */
  get x() {
    return this.#x;
  }
  /** Y component */
  get y() {
    return this.#y;
  }
  /** Z component */
  get z() {
    return this.#z;
  }
  /** X component */
  set x(value) {
    this.#x = value;
    this.markAsDirty();
  }
  /** Y component */
  set y(value) {
    this.#y = value;
    this.markAsDirty();
  }
  /** Z component */
  set z(value) {
    this.#z = value;
    this.markAsDirty();
  }

  /**
   * Adds another vector to this vector component-wise.
   * @param vector Vector to add
   * @returns this
   */
  override sum(vector: this): this {
    this.#x += vector.x;
    this.#y += vector.y;
    this.#z += vector.z;
    return this.markAsDirty();
  }

  /**
   * Subtracts another vector from this vector component-wise.
   * @param vector Vector to subtract
   * @returns this
   */
  override sub(vector: this): this {
    this.#x -= vector.x;
    this.#y -= vector.y;
    this.#z -= vector.z;
    return this.markAsDirty();
  }

  /**
   * Multiplies this vector by another vector component-wise.
   * @param vector Vector to multiply with
   * @returns this
   */
  override mul(vector: this): this {
    this.#x *= vector.x;
    this.#y *= vector.y;
    this.#z *= vector.z;
    return this.markAsDirty();
  }

  /**
   * Divides this vector by another vector component-wise.
   * @param vector Vector to divide by
   * @returns this
   */
  override div(vector: this): this {
    this.#x /= vector.x;
    this.#y /= vector.y;
    this.#z /= vector.z;
    return this.markAsDirty();
  }

  /**
   * Multiplies this vector by a scalar.
   * @param scalar Scalar value
   * @returns this
   */
  override mulS(scalar: number): this {
    this.#x *= scalar;
    this.#y *= scalar;
    this.#z *= scalar;
    return this.markAsDirty();
  }

  /**
   * Divides this vector by a scalar.
   * @param scalar Scalar value (non-zero)
   * @returns this
   */
  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#x /= scalar;
    this.#y /= scalar;
    this.#z /= scalar;
    return this.markAsDirty();
  }

  /**
   * Computes the dot product with another vector.
   * @param vector Other vector
   * @returns Dot product value
   */
  override dot(vector: this): number {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  /**
   * Computes the cross product with another vector, storing the result in-place.
   * @param vector Other vector
   * @returns this containing the cross product
   */
  cross(vector: this): this {
    const rx = this.y * vector.z - this.z * vector.y;
    const ry = this.z * vector.x - this.x * vector.z;
    const rz = this.x * vector.y - this.y * vector.x;

    this.#x = rx;
    this.#y = ry;
    this.#z = rz;
    return this.markAsDirty();
  }

  /**
   * Sets vector components.
   * @param x X component
   * @param y Y component
   * @param z Z component
   * @returns this
   */
  override set(x: number, y: number, z: number): this {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    return this.markAsDirty();
  }

  /**
   * Copies another vector's components into this vector.
   * @param vector Source vector
   * @returns this
   */
  override copy(vector: this): this {
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#z = vector.#z;
    return this.markAsDirty();
  }

  /**
   * Returns an array representation of the vector.
   */
  override toArray(): FixedArray<number, 3> {
    return [this.x, this.y, this.z];
  }

  /**
   * Returns a Float32Array buffer [x, y, z].
   */
  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#z]);
  }

  /**
   * String representation for debugging.
   */
  override toString(): string {
    return `Vector3(x: ${this.x}, y: ${this.y}, z: ${this.z})`;
  }
}
