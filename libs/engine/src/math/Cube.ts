import { Calculable } from '@bunbox/utils';

/**
 * Axis-aligned rectangle represented by x, y, width, height.
 *
 * Notes:
 * - Cube is agnostic about coordinate system orientation (screen space vs world space).
 *   Consumers decide whether +Y goes up or down; values are stored as-is.
 *
 * Example:
 * ```ts
 * const r = new Cube(10, 20, 30, 100, 50, 40);
 * r.right = 140; // width becomes 130 (140 - x)
 * r.bottom = 90; // height becomes 70 (90 - y)
 * r.front = 120; // depth becomes 80 (120 - z)
 * r.back = 40;   // depth becomes 80 (z - 40)
 * ```
 */
export class Cube extends Calculable<6> {
  private __x: number;
  private __y: number;
  private __z: number;
  private __width: number;
  private __height: number;
  private __depth: number;

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
    z: number = 0,
    width: number = 1,
    height: number = 1,
    depth: number = 1,
  ) {
    super();
    this.__x = x;
    this.__y = y;
    this.__z = z;
    this.__width = width;
    this.__height = height;
    this.__depth = depth;
  }

  /** X (left) position */
  get x(): number {
    return this.__x;
  }

  /** Y (top) position */
  get y(): number {
    return this.__y;
  }

  /** Z (front) position */
  get z(): number {
    return this.__z;
  }

  /** Left edge (alias of x) */
  get left(): number {
    return this.__x;
  }

  /** Top edge (alias of y) */
  get top(): number {
    return this.__y;
  }

  /** Right edge (x + width) */
  get right(): number {
    return this.__x + this.__width;
  }

  /** Bottom edge (y + height) */
  get bottom(): number {
    return this.__y + this.__height;
  }

  /** Front edge (z + depth) */
  get front(): number {
    return this.__z + this.__depth;
  }

  /** Back edge (z) */
  get back(): number {
    return this.__z;
  }

  /** Width (non-negative recommended) */
  get width(): number {
    return this.__width;
  }

  /** Height (non-negative recommended) */
  get height(): number {
    return this.__height;
  }

  /** Depth (non-negative recommended) */
  get depth(): number {
    return this.__depth;
  }

  /** X (left) position */
  set x(value: number) {
    this.__x = value;
    this.markAsDirty();
  }
  /** Y (top) position */
  set y(value: number) {
    this.__y = value;
    this.markAsDirty();
  }
  /** Z (front) position */
  set z(value: number) {
    this.__z = value;
    this.markAsDirty();
  }
  /** Set left edge (alias of x) */
  set left(value: number) {
    this.__x = value;
    this.markAsDirty();
  }
  /** Set top edge (alias of y) */
  set top(value: number) {
    this.__y = value;
    this.markAsDirty();
  }
  /**
   * Set right edge. Adjusts width to keep the same x.
   */
  set right(value: number) {
    this.__width = value - this.__x;
    this.markAsDirty();
  }
  /**
   * Set bottom edge. Adjusts height to keep the same y.
   */
  set bottom(value: number) {
    this.__height = value - this.__y;
    this.markAsDirty();
  }
  /** Set front edge. Adjusts depth to keep the same z. */
  set front(value: number) {
    this.__depth = value - this.__z;
    this.markAsDirty();
  }
  /** Set back edge. Adjusts depth to keep the same front. */
  set back(value: number) {
    this.__depth = this.__z - value;
    this.markAsDirty();
  }
  /** Width (non-negative recommended) */
  set width(value: number) {
    this.__width = value;
    this.markAsDirty();
  }
  /** Height (non-negative recommended) */
  set height(value: number) {
    this.__height = value;
    this.markAsDirty();
  }
  /** Depth (non-negative recommended) */
  set depth(value: number) {
    this.__depth = value;
    this.markAsDirty();
  }

  /** Component-wise addition with another rect. */
  override sum(vector: this): this {
    this.__x += vector.__x;
    this.__y += vector.__y;
    this.__z += vector.__z;
    this.__width += vector.__width;
    this.__height += vector.__height;
    this.__depth += vector.__depth;
    return this.markAsDirty();
  }

  /** Component-wise subtraction with another rect. */
  override sub(vector: this): this {
    this.__x -= vector.__x;
    this.__y -= vector.__y;
    this.__z -= vector.__z;
    this.__width -= vector.__width;
    this.__height -= vector.__height;
    this.__depth -= vector.__depth;
    return this.markAsDirty();
  }

  /** Component-wise multiplication with another rect. */
  override mul(vector: this): this {
    this.__x *= vector.__x;
    this.__y *= vector.__y;
    this.__z *= vector.__z;
    this.__width *= vector.__width;
    this.__height *= vector.__height;
    this.__depth *= vector.__depth;
    return this.markAsDirty();
  }

  /** Component-wise division by another rect. */
  override div(vector: this): this {
    this.__x /= vector.__x;
    this.__y /= vector.__y;
    this.__z /= vector.__z;
    this.__width /= vector.__width;
    this.__height /= vector.__height;
    this.__depth /= vector.__depth;
    return this.markAsDirty();
  }

  /** Scale width and height by a scalar (x and y unchanged). */
  override mulS(scalar: number): this {
    this.__width *= scalar;
    this.__height *= scalar;
    this.__depth *= scalar;
    return this.markAsDirty();
  }

  /** Divide width and height by a scalar (x and y unchanged). */
  override divS(scalar: number): this {
    this.__width /= scalar;
    this.__height /= scalar;
    this.__depth /= scalar;
    return this.markAsDirty();
  }

  /** Dot product across [x, y, width, height]. */
  override dot(vector: this): number {
    return (
      this.__x * vector.__x +
      this.__y * vector.__y +
      this.__z * vector.__z +
      this.__width * vector.__width +
      this.__height * vector.__height +
      this.__depth * vector.__depth
    );
  }

  /** Copy components from another rect. */
  override copy(vector: this): this {
    this.__x = vector.__x;
    this.__y = vector.__y;
    this.__z = vector.__z;
    this.__width = vector.__width;
    this.__height = vector.__height;
    this.__depth = vector.__depth;
    return this.markAsDirty();
  }

  /** Set all components. */
  override set(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ): this {
    this.__x = x;
    this.__y = y;
    this.__z = z;
    this.__width = width;
    this.__height = height;
    this.__depth = depth;
    return this.markAsDirty();
  }

  /** Returns [x, y, width, height]. */
  override toArray(): [number, number, number, number, number, number] {
    return [
      this.__x,
      this.__y,
      this.__z,
      this.__width,
      this.__height,
      this.__depth,
    ];
  }

  /** Returns Float32Array [x, y, width, height]. */
  override toBuffer(): Float32Array {
    return new Float32Array([
      this.__x,
      this.__y,
      this.__z,
      this.__width,
      this.__height,
      this.__depth,
    ]);
  }

  /** String representation for debugging. */
  override toString(): string {
    return `Cube(${this.__x}, ${this.__y}, ${this.__z}, ${this.__width}, ${this.__height}, ${this.__depth})`;
  }
}
