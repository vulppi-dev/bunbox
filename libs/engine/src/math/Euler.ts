import { Calculable } from '@bunbox/utils';
import type { FixedArray } from '../types';

export const EULER_ORDERS = ['xyz', 'xzy', 'yxz', 'yzx', 'zxy', 'zyx'] as const;

/**
 * Represents the order of Euler angles.
 */
export type EulerOrder = (typeof EULER_ORDERS)[number];

/**
 * Represents a set of Euler angles.
 * Provides methods for common operations on Euler angles.
 */
export class Euler extends Calculable<3> {
  #x: number;
  #y: number;
  #z: number;
  #order: EulerOrder;

  constructor(x: number = 0, y: number = 0, z: number = 0, order: EulerOrder = 'zyx') {
    super();
    if (!EULER_ORDERS.includes(order)) throw new Error(`Invalid Euler order: ${order}`);
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#order = order;
  }

  get x(): number {
    return this.#x;
  }
  get y(): number {
    return this.#y;
  }
  get z(): number {
    return this.#z;
  }
  get order(): EulerOrder {
    return this.#order;
  }
  set x(val: number) {
    this.#x = val;
    this.markAsDirty();
  }
  set y(val: number) {
    this.#y = val;
    this.markAsDirty();
  }
  set z(val: number) {
    this.#z = val;
    this.markAsDirty();
  }
  set order(val: EulerOrder) {
    if (!EULER_ORDERS.includes(val)) throw new Error(`Invalid Euler order: ${val}`);
    this.#order = val;
    this.markAsDirty();
  }

  /**
   * Adds another set of Euler angles to this set.
   * @param e The Euler angles to add.
   * @returns This set of Euler angles after addition.
   */
  override sum(e: this): this {
    if (!(e instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    this.#x += e.x;
    this.#y += e.y;
    this.#z += e.z;
    return this.markAsDirty();
  }

  /**
   * Subtracts another set of Euler angles from this set.
   * @param e The Euler angles to subtract.
   * @returns This set of Euler angles after subtraction.
   */
  override sub(e: this): this {
    if (!(e instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    this.#x -= e.x;
    this.#y -= e.y;
    this.#z -= e.z;
    return this.markAsDirty();
  }

  /**
   * Multiplies this set of Euler angles by another set.
   * @param e The Euler angles to multiply by.
   * @returns This set of Euler angles after multiplication.
   */
  override mul(e: this): this {
    if (!(e instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    this.#x *= e.x;
    this.#y *= e.y;
    this.#z *= e.z;
    return this.markAsDirty();
  }

  /**
   * Divides this set of Euler angles by another set.
   * @param e The Euler angles to divide by.
   * @returns This set of Euler angles after division.
   */
  override div(e: this): this {
    if (!(e instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    if (e.x === 0 || e.y === 0 || e.z === 0) throw new Error('Division by zero');
    this.#x /= e.x;
    this.#y /= e.y;
    this.#z /= e.z;
    return this.markAsDirty();
  }

  /**
   * Multiplies this set of Euler angles by a scalar.
   * @param scalar The scalar to multiply by.
   * @returns This set of Euler angles after multiplication.
   */
  override mulS(scalar: number): this {
    if (isNaN(scalar)) throw new Error('Invalid scalar');
    this.#x *= scalar;
    this.#y *= scalar;
    this.#z *= scalar;
    return this.markAsDirty();
  }

  /**
   * Divides this set of Euler angles by a scalar.
   * @param scalar The scalar to divide by.
   * @returns This set of Euler angles after division.
   */
  override divS(scalar: number): this {
    if (scalar === 0) throw new Error('Division by zero');
    this.#x /= scalar;
    this.#y /= scalar;
    this.#z /= scalar;
    return this.markAsDirty();
  }

  /**
   * Computes the dot product of this set of Euler angles with another set.
   * @param e The Euler angles to dot with.
   * @returns The dot product.
   */
  override dot(e: this): number {
    if (!(e instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    return this.#x * e.x + this.#y * e.y + this.#z * e.z;
  }

  /**
   * Sets the components of this set of Euler angles.
   * @param x The new x component.
   * @param y The new y component.
   * @param z The new z component.
   * @returns This set of Euler angles after setting the components.
   */
  override set(x: number, y: number, z: number): this {
    if (isNaN(x) || isNaN(y) || isNaN(z)) throw new Error('Invalid Euler angles');
    this.#x = x;
    this.#y = y;
    this.#z = z;
    return this.markAsDirty();
  }

  /**
   * Copies the components of another set of Euler angles to this set.
   * @param e The Euler angles to copy from.
   * @returns This set of Euler angles after copying the components.
   */
  override copy(vector: this): this {
    if (!(vector instanceof Euler)) throw new Error('Argument must be an instance of Euler');
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#z = vector.#z;
    this.#order = vector.order;
    return this.markAsDirty();
  }

  /**
   * Converts this set of Euler angles to an array.
   * @returns The array representation of the Euler angles.
   */
  override toArray(): FixedArray<number, 3> {
    return [this.#x, this.#y, this.#z];
  }

  /**
   * Converts this set of Euler angles to a buffer.
   * @returns The buffer representation of the Euler angles.
   */
  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#z]);
  }

  /**
   * Converts this set of Euler angles to a string.
   * @returns The string representation of the Euler angles.
   */
  override toString(): string {
    return `Euler(order: '${this.#order}', x: ${this.#x.toFixed(3)}, y: ${this.#y.toFixed(3)}, z: ${this.#z.toFixed(3)})`;
  }
}
