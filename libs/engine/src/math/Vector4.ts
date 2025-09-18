import type { FixedArray } from '../types';
import { AbstractVector } from './AbstractVector';

export class Vector4 extends AbstractVector<4> {
  #x: number;
  #y: number;
  #z: number;
  #w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    super();
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#w = w;
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

  get w() {
    return this.#w;
  }

  set w(value) {
    this.#w = value;
    this.markAsDirty();
  }

  override sum(vector: this): this {
    this.#x += vector.x;
    this.#y += vector.y;
    this.#z += vector.z;
    this.#w += vector.w;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.#x -= vector.x;
    this.#y -= vector.y;
    this.#z -= vector.z;
    this.#w -= vector.w;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.#x *= vector.x;
    this.#y *= vector.y;
    this.#z *= vector.z;
    this.#w *= vector.w;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.#x /= vector.x;
    this.#y /= vector.y;
    this.#z /= vector.z;
    this.#w /= vector.w;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.#x *= scalar;
    this.#y *= scalar;
    this.#z *= scalar;
    this.#w *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    if (scalar === 0) {
      throw new Error('Division by zero');
    }
    this.#x /= scalar;
    this.#y /= scalar;
    this.#z /= scalar;
    this.#w /= scalar;
    return this.markAsDirty();
  }

  override dot(vector: this): number {
    return (
      this.x * vector.x +
      this.y * vector.y +
      this.z * vector.z +
      this.w * vector.w
    );
  }

  override set(x: number, y: number, z: number, w: number): this {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#w = w;
    return this.markAsDirty();
  }

  override copy(vector: this): this {
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#z = vector.#z;
    this.#w = vector.#w;
    return this.markAsDirty();
  }

  override toArray(): FixedArray<number, 4> {
    return [this.x, this.y, this.z, this.w];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#z, this.#w]);
  }

  override toString(): string {
    return `Vector4(x: ${this.x}, y: ${this.y}, z: ${this.z}, w: ${this.w})`;
  }
}
