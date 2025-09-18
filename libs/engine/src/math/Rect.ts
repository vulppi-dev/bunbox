import { Calculable } from '@bunbox/utils';
import { Vector2 } from './Vector2';

export class Rect extends Calculable<4> {
  #x: number;
  #y: number;
  #width: number;
  #height: number;

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 1,
    height: number = 1,
  ) {
    super();
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
  }

  get x(): number {
    return this.#x;
  }
  set x(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  get y(): number {
    return this.#y;
  }
  set y(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  get left(): number {
    return this.#x;
  }
  set left(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  get top(): number {
    return this.#y;
  }
  set top(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  get right(): number {
    return this.#x + this.#width;
  }
  set right(value: number) {
    this.#width = value - this.#x;
    this.markAsDirty();
  }

  get bottom(): number {
    return this.#y + this.#height;
  }
  set bottom(value: number) {
    this.#height = value - this.#y;
    this.markAsDirty();
  }

  get width(): number {
    return this.#width;
  }
  set width(value: number) {
    this.#width = value;
    this.markAsDirty();
  }

  get height(): number {
    return this.#height;
  }
  set height(value: number) {
    this.#height = value;
    this.markAsDirty();
  }

  get position(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  set position(value: Vector2) {
    this.x = value.x;
    this.y = value.y;
  }

  get size(): Vector2 {
    return new Vector2(this.width, this.height);
  }
  set size(value: Vector2) {
    this.width = value.x;
    this.height = value.y;
  }

  override sum(vector: this): this {
    this.#x += vector.#x;
    this.#y += vector.#y;
    this.#width += vector.#width;
    this.#height += vector.#height;
    return this.markAsDirty();
  }

  override sub(vector: this): this {
    this.#x -= vector.#x;
    this.#y -= vector.#y;
    this.#width -= vector.#width;
    this.#height -= vector.#height;
    return this.markAsDirty();
  }

  override mul(vector: this): this {
    this.#x *= vector.#x;
    this.#y *= vector.#y;
    this.#width *= vector.#width;
    this.#height *= vector.#height;
    return this.markAsDirty();
  }

  override div(vector: this): this {
    this.#x /= vector.#x;
    this.#y /= vector.#y;
    this.#width /= vector.#width;
    this.#height /= vector.#height;
    return this.markAsDirty();
  }

  override mulS(scalar: number): this {
    this.#width *= scalar;
    this.#height *= scalar;
    return this.markAsDirty();
  }

  override divS(scalar: number): this {
    this.#width /= scalar;
    this.#height /= scalar;
    return this.markAsDirty();
  }

  override dot(vector: this): number {
    return (
      this.#x * vector.#x +
      this.#y * vector.#y +
      this.#width * vector.#width +
      this.#height * vector.#height
    );
  }

  override copy(vector: this): this {
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#width = vector.#width;
    this.#height = vector.#height;
    return this.markAsDirty();
  }

  override set(x: number, y: number, width: number, height: number): this {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    return this.markAsDirty();
  }

  override toArray(): [number, number, number, number] {
    return [this.#x, this.#y, this.#width, this.#height];
  }

  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#width, this.#height]);
  }

  override toString(): string {
    return `Rect(${this.#x}, ${this.#y}, ${this.#width}, ${this.#height})`;
  }
}
