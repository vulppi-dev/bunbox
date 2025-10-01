import { Calculable } from '@bunbox/utils';
import { Vector2 } from './Vector2';

/**
 * Axis-aligned rectangle represented by x, y, width, height.
 *
 * Notes:
 * - Rect is agnostic about coordinate system orientation (screen space vs world space).
 *   Consumers decide whether +Y goes up or down; values are stored as-is.
 * - Getters `left`, `top`, `right`, `bottom` are conveniences over x/y/width/height.
 *   Setting `right` or `bottom` adjusts width/height relative to current x/y.
 *
 * Example:
 * ```ts
 * const r = new Rect(10, 20, 100, 50);
 * r.right = 140; // width becomes 130 (140 - x)
 * r.bottom = 90; // height becomes 70 (90 - y)
 * ```
 */
export class Rect extends Calculable<4> {
  #x: number;
  #y: number;
  #width: number;
  #height: number;

  /**
   * Create a rectangle.
   * @param x Left position
   * @param y Top position
   * @param width Width (non-negative recommended)
   * @param height Height (non-negative recommended)
   */
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

  /** X (left) position */
  get x(): number {
    return this.#x;
  }
  /** X (left) position */
  set x(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  /** Y (top) position */
  get y(): number {
    return this.#y;
  }
  /** Y (top) position */
  set y(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  /** Left edge (alias of x) */
  get left(): number {
    return this.#x;
  }
  /** Set left edge (alias of x) */
  set left(value: number) {
    this.#x = value;
    this.markAsDirty();
  }

  /** Top edge (alias of y) */
  get top(): number {
    return this.#y;
  }
  /** Set top edge (alias of y) */
  set top(value: number) {
    this.#y = value;
    this.markAsDirty();
  }

  /** Right edge (x + width) */
  get right(): number {
    return this.#x + this.#width;
  }
  /**
   * Set right edge. Adjusts width to keep the same x.
   * @param value New right edge coordinate
   */
  set right(value: number) {
    this.#width = value - this.#x;
    this.markAsDirty();
  }

  /** Bottom edge (y + height) */
  get bottom(): number {
    return this.#y + this.#height;
  }
  /**
   * Set bottom edge. Adjusts height to keep the same y.
   * @param value New bottom edge coordinate
   */
  set bottom(value: number) {
    this.#height = value - this.#y;
    this.markAsDirty();
  }

  /** Width (non-negative recommended) */
  get width(): number {
    return this.#width;
  }
  /** Width (non-negative recommended) */
  set width(value: number) {
    this.#width = value;
    this.markAsDirty();
  }

  /** Height (non-negative recommended) */
  get height(): number {
    return this.#height;
  }
  /** Height (non-negative recommended) */
  set height(value: number) {
    this.#height = value;
    this.markAsDirty();
  }

  /** Component-wise addition with another rect. */
  override sum(vector: this): this {
    this.#x += vector.#x;
    this.#y += vector.#y;
    this.#width += vector.#width;
    this.#height += vector.#height;
    return this.markAsDirty();
  }

  /** Component-wise subtraction with another rect. */
  override sub(vector: this): this {
    this.#x -= vector.#x;
    this.#y -= vector.#y;
    this.#width -= vector.#width;
    this.#height -= vector.#height;
    return this.markAsDirty();
  }

  /** Component-wise multiplication with another rect. */
  override mul(vector: this): this {
    this.#x *= vector.#x;
    this.#y *= vector.#y;
    this.#width *= vector.#width;
    this.#height *= vector.#height;
    return this.markAsDirty();
  }

  /** Component-wise division by another rect. */
  override div(vector: this): this {
    this.#x /= vector.#x;
    this.#y /= vector.#y;
    this.#width /= vector.#width;
    this.#height /= vector.#height;
    return this.markAsDirty();
  }

  /** Scale width and height by a scalar (x and y unchanged). */
  override mulS(scalar: number): this {
    this.#width *= scalar;
    this.#height *= scalar;
    return this.markAsDirty();
  }

  /** Divide width and height by a scalar (x and y unchanged). */
  override divS(scalar: number): this {
    this.#width /= scalar;
    this.#height /= scalar;
    return this.markAsDirty();
  }

  /** Dot product across [x, y, width, height]. */
  override dot(vector: this): number {
    return (
      this.#x * vector.#x +
      this.#y * vector.#y +
      this.#width * vector.#width +
      this.#height * vector.#height
    );
  }

  /** Copy components from another rect. */
  override copy(vector: this): this {
    this.#x = vector.#x;
    this.#y = vector.#y;
    this.#width = vector.#width;
    this.#height = vector.#height;
    return this.markAsDirty();
  }

  /** Set all components. */
  override set(x: number, y: number, width: number, height: number): this {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    return this.markAsDirty();
  }

  /** Returns [x, y, width, height]. */
  override toArray(): [number, number, number, number] {
    return [this.#x, this.#y, this.#width, this.#height];
  }

  /** Returns Float32Array [x, y, width, height]. */
  override toBuffer(): Float32Array {
    return new Float32Array([this.#x, this.#y, this.#width, this.#height]);
  }

  /** String representation for debugging. */
  override toString(): string {
    return `Rect(${this.#x}, ${this.#y}, ${this.#width}, ${this.#height})`;
  }
}
