// prettier-multiline-arrays-set-line-pattern: 3
import { DirtyState } from '@bunbox/utils';
import type { FixedArray } from '../types';
import { Vector2 } from './Vector2';

/**
 * Represents a 2D homogeneous transform matrix (3x3, column-major).
 * Used for 2D translation, rotation and scale.
 */
export class Matrix3 extends DirtyState {
  #m = new Float32Array([
    1, 0, 0, // col 0
    0, 1, 0, // col 1
    0, 0, 1, // col 2 (translation + homogeneous)
  ]);

  /**
   * Sets the components of this matrix from an array.
   */
  set(values: FixedArray<number, 9>): this {
    if (values.length !== 9) throw new Error('Matrix3 expects 9 values');
    this.#m.set(values);
    return this.markAsDirty();
  }

  /**
   * Copies another matrix into this one.
   */
  copy(from: Matrix3): this {
    this.#m.set(from.#m);
    return this.markAsDirty();
  }

  /**
   * Resets this matrix to identity.
   */
  reset(): this {
    this.#m.set([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
    return this.markAsDirty();
  }

  /**
   * Returns a clone of this matrix.
   */
  clone(): Matrix3 {
    const m = new Matrix3();
    m.#m.set(this.#m);
    return m;
  }

  /**
   * Multiplies this = other * this (left multiply).
   */
  mulL(other: Matrix3): this {
    this.__leftMultiplyTo(this.#m, other.#m);
    return this.markAsDirty();
  }

  /**
   * Multiplies this = this * other (right multiply).
   */
  mulR(other: Matrix3): this {
    this.__rightMultiplyTo(this.#m, other.#m);
    return this.markAsDirty();
  }

  /**
   * Sets this matrix to a pure translation.
   */
  translation(position: Vector2): this {
    const m = this.#m;
    m[6] = position.x;
    m[7] = position.y;
    return this.markAsDirty();
  }

  /**
   * Sets this matrix to a pure rotation (around origin).
   * @param angle Angle in radians.
   */
  rotation(angle: number): this {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = this.#m;

    // [ c -s 0 ]
    // [ s  c 0 ]
    // [ 0  0 1 ]
    m[0] = c;
    m[1] = s;
    m[3] = -s;
    m[4] = c;

    return this.markAsDirty();
  }

  /**
   * Sets this matrix to a pure scale.
   */
  scale(scale: Vector2): this {
    const m = this.#m;

    m[0] = scale.x;
    m[4] = scale.y;

    return this.markAsDirty();
  }

  /**
   * Composes a 2D transform from position, rotation and scale.
   * Order: scale -> rotation -> translation.
   * @param position Translation in 2D.
   * @param rotation Rotation in radians.
   * @param scale Scale in 2D.
   */
  compose(position: Vector2, rotation: number, scale: Vector2): this {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);

    const sx = scale.x;
    const sy = scale.y;

    const a = c * sx;
    const b = s * sx;
    const c2 = -s * sy;
    const d = c * sy;

    const m = this.#m;

    // Column-major:
    // [ a  c2 tx ]
    // [ b  d  ty ]
    // [ 0  0  1  ]
    m[0] = a;
    m[1] = b;
    m[2] = 0;

    m[3] = c2;
    m[4] = d;
    m[5] = 0;

    m[6] = position.x;
    m[7] = position.y;
    m[8] = 1;

    return this.markAsDirty();
  }

  /**
   * Decomposes this matrix into position, rotation (radians) and scale.
   * Assumes no shear.
   */
  decompose(
    position: Vector2,
    rotationOut: { value: number },
    scale: Vector2,
  ): this {
    const m = this.#m;

    const a = m[0]!;
    const b = m[1]!;
    const c = m[3]!;
    const d = m[4]!;
    const tx = m[6]!;
    const ty = m[7]!;

    const sx = Math.hypot(a, b);
    const sy = Math.hypot(c, d);

    let angle = 0;
    if (sx !== 0) {
      angle = Math.atan2(b, a);
    } else if (sy !== 0) {
      angle = Math.atan2(-c, d);
    }

    position.set(tx, ty);
    scale.set(sx, sy);
    rotationOut.value = angle;

    return this;
  }

  /**
   * Converts this matrix to a plain number array (length 9).
   */
  toArray(): FixedArray<number, 9> {
    return Array.from(this.#m) as FixedArray<number, 9>;
  }

  /**
   * Returns a copy of the internal buffer.
   */
  toBuffer(): Float32Array {
    return this.#m.slice();
  }

  /**
   * Returns a string representation.
   */
  override toString(): string {
    const vals = Array.from(this.#m).map((n) => n.toFixed(3));
    return `Matrix3(${vals.join(', ')})`;
  }

  private __leftMultiplyTo(target: Float32Array, mat: Float32Array) {
    const tmp = new Float32Array(9);
    for (let j = 0; j < 3; j++) {
      const b0 = target[j * 3 + 0]!;
      const b1 = target[j * 3 + 1]!;
      const b2 = target[j * 3 + 2]!;
      for (let i = 0; i < 3; i++) {
        tmp[j * 3 + i] =
          mat[0 * 3 + i]! * b0 + mat[1 * 3 + i]! * b1 + mat[2 * 3 + i]! * b2;
      }
    }
    target.set(tmp);
  }

  private __rightMultiplyTo(target: Float32Array, mat: Float32Array) {
    const tmp = new Float32Array(9);
    for (let j = 0; j < 3; j++) {
      const mj0 = mat[j * 3 + 0]!;
      const mj1 = mat[j * 3 + 1]!;
      const mj2 = mat[j * 3 + 2]!;
      for (let i = 0; i < 3; i++) {
        tmp[j * 3 + i] =
          target[0 * 3 + i]! * mj0 +
          target[1 * 3 + i]! * mj1 +
          target[2 * 3 + i]! * mj2;
      }
    }
    target.set(tmp);
  }
}
