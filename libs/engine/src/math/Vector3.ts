import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

export class Vector3 extends AbstractVector<3> {
  #x: number;
  #y: number;
  #z: number;

  static Zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  static One(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  static Up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static Down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  static Left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  static Right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static Forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  static Backward(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.#x = x;
    this.#y = y;
    this.#z = z;
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

  override sum(vector: this): this {
    this.#x += vector.x;
    this.#y += vector.y;
    this.#z += vector.z;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.#x -= vector.x;
    this.#y -= vector.y;
    this.#z -= vector.z;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.#x *= vector.x;
    this.#y *= vector.y;
    this.#z *= vector.z;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.#x /= vector.x;
    this.#y /= vector.y;
    this.#z /= vector.z;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.#x *= scalar;
    this.#y *= scalar;
    this.#z *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#x /= scalar;
    this.#y /= scalar;
    this.#z /= scalar;
    return this.markAsDirty();
  }

  override dot(vector: this): number {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }

  cross(vector: this): this {
    const rx = this.y * vector.z - this.z * vector.y;
    const ry = this.z * vector.x - this.x * vector.z;
    const rz = this.x * vector.y - this.y * vector.x;

    this.#x = rx;
    this.#y = ry;
    this.#z = rz;
    return this.markAsDirty();
  }

  override set(x: number, y: number, z: number): this {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    return this.markAsDirty();
  }

  override copy(vector: this): this {
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#z = vector.#z;
    return this.markAsDirty();
  }

  override toArray(): FixedArray<number, 3> {
    return [this.x, this.y, this.z];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#z]);
  }

  override toString(): string {
    return `Vector3(x: ${this.x}, y: ${this.y}, z: ${this.z})`;
  }
}
