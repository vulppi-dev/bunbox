// prettier-multiline-arrays-set-line-pattern: 4

import { clamp } from '@vulppi/toolbelt/math';
import { Euler } from './Euler';
import { Quaternion } from './Quaternion';
import { Vector3 } from './Vector3';
import type { FixedArray } from '../types';
import { DirtyState } from '@bunbox/utils';

/**
 * Represents a 4x4 matrix.
 */
export class Matrix4 extends DirtyState {
  private __m = new Float32Array([
    1, 0, 0, 0, // col 0
    0, 1, 0, 0, // col 1
    0, 0, 1, 0, // col 2
    0, 0, 0, 1, // col 3 (translation)
  ]);

  /**
   * Multiplies this matrix by another matrix.
   * @param matrix The matrix to multiply by.
   * @returns This matrix after multiplication.
   */
  mulL(matrix: this): this {
    this.__leftMultiplyTo(this.__m, matrix.__m);
    return this.markAsDirty();
  }

  /**
   * Multiplies this matrix by another matrix (right multiplication).
   * @param matrix The matrix to multiply by.
   * @returns This matrix after multiplication.
   */
  mulR(matrix: this): this {
    this.__rightMultiplyTo(this.__m, matrix.__m);
    return this.markAsDirty();
  }

  /**
   * Sets the components of this matrix.
   * @param args The new components of the matrix.
   * @returns This matrix after setting the components.
   */
  set(args: FixedArray<number, 16>): this {
    if (args.length !== 16) throw new Error('Invalid arguments');
    this.__m.set(args);
    return this.markAsDirty();
  }

  /**
   * Copies the components of another matrix to this matrix.
   * @param m The matrix to copy from.
   * @returns This matrix after copying the components.
   */
  copy(m: this): this {
    this.__m.set(m.__m);
    return this.markAsDirty();
  }

  /**
   * Converts this matrix to an array.
   * @returns The array representation of the matrix.
   */
  toArray(): FixedArray<number, 16> {
    return Array.from(this.__m) as FixedArray<number, 16>;
  }

  /**
   * Converts this matrix to a buffer.
   * @returns The buffer representation of the matrix.
   */
  toBuffer(): Float32Array {
    return this.__m.slice();
  }

  /**
   * Converts this matrix to a string.
   * @returns The string representation of the matrix.
   */
  override toString(): string {
    const vals = Array.from(this.__m).map((n) => n.toFixed(3));
    return `Matrix4(${vals.join(', ')})`;
  }

  /**
   * Computes the length of this matrix.
   * @returns The length of the matrix.
   */
  length(): number {
    const values = this.toArray() as Array<number>;
    return Math.sqrt(values.reduce((sum, v) => sum + v * v, 0));
  }

  /**
   * Clones this matrix.
   * @returns A new matrix that is a copy of this matrix.
   */
  clone(): this {
    const clone = new (this.constructor as new () => this)();
    clone.set(this.toArray());
    return clone;
  }

  /**
   * Returns the numeric value of this matrix.
   * @returns The numeric value of the matrix.
   */
  override valueOf() {
    return this.length();
  }

  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') return this.toString();
    return this.length();
  }

  /**
   * Resets this matrix to the identity matrix.
   * @returns This matrix after resetting.
   */
  reset() {
    this.__m.set([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    return this.markAsDirty();
  }

  /**
   * Scales this matrix by a vector.
   * @param v The vector to scale by.
   * @returns This matrix after scaling.
   */
  scale(v: Vector3): this {
    const m = this.__m;
    for (let i = 0; i < 4; i++) {
      m[0 * 4 + i]! *= v.x; // column 0
      m[1 * 4 + i]! *= v.y; // column 1
      m[2 * 4 + i]! *= v.z; // column 2
    }
    return this.markAsDirty();
  }

  /**
   * Translates this matrix by a vector.
   * @param v The vector to translate by.
   * @returns This matrix after translation.
   */
  translate(v: Vector3): this {
    const m = this.__m;
    const tx = v.x,
      ty = v.y,
      tz = v.z;

    // new col3 = m * [tx, ty, tz, 1]
    const c0 = m[0]!,
      c1 = m[1]!,
      c2 = m[2]!,
      c3 = m[3]!;
    const c4 = m[4]!,
      c5 = m[5]!,
      c6 = m[6]!,
      c7 = m[7]!;
    const c8 = m[8]!,
      c9 = m[9]!,
      c10 = m[10]!,
      c11 = m[11]!;
    const c12 = m[12]!,
      c13 = m[13]!,
      c14 = m[14]!,
      c15 = m[15]!;

    m[12] = c0 * tx + c4 * ty + c8 * tz + c12;
    m[13] = c1 * tx + c5 * ty + c9 * tz + c13;
    m[14] = c2 * tx + c6 * ty + c10 * tz + c14;
    m[15] = c3 * tx + c7 * ty + c11 * tz + c15;

    return this.markAsDirty();
  }

  /**
   * Rotates this matrix by a quaternion.
   * @param r The quaternion to rotate by.
   * @returns This matrix after rotation.
   */
  rotate(r: Quaternion): this {
    const R = this.__quaternionToMatrix(r);
    this.__rightMultiplyTo(this.__m, R);
    return this.markAsDirty();
  }

  /**
   * Composes this matrix from position, scale, and rotation.
   * @param position The position vector.
   * @param scale The scale vector.
   * @param rotation The rotation quaternion or Euler angles.
   * @returns This matrix after composition.
   */
  compose(
    position: Vector3,
    scale: Vector3,
    rotation: Quaternion | Euler,
  ): this {
    if (
      !(position instanceof Vector3) ||
      !(scale instanceof Vector3) ||
      !(rotation instanceof Quaternion || rotation instanceof Euler)
    ) {
      throw new Error('Invalid arguments');
    }

    const R =
      rotation instanceof Quaternion
        ? this.__quaternionToMatrix(rotation)
        : this.__eulerToMatrix(rotation);

    const sx = scale.x,
      sy = scale.y,
      sz = scale.z;
    const m = this.__m;

    // Basis columns: R * diag(sx, sy, sz)
    // Column 0
    m[0] = R[0]! * sx;
    m[1] = R[1]! * sx;
    m[2] = R[2]! * sx;
    m[3] = 0;
    // Column 1
    m[4] = R[4]! * sy;
    m[5] = R[5]! * sy;
    m[6] = R[6]! * sy;
    m[7] = 0;
    // Column 2
    m[8] = R[8]! * sz;
    m[9] = R[9]! * sz;
    m[10] = R[10]! * sz;
    m[11] = 0;
    // Translation
    m[12] = position.x;
    m[13] = position.y;
    m[14] = position.z;
    m[15] = 1;

    return this.markAsDirty();
  }

  /**
   * Decomposes the rotation component of this matrix into an Euler angle representation.
   * @param out The Euler object to store the rotation values.
   * @returns This matrix after decomposing the rotation.
   */
  decomposeRotation(out: Euler): this {
    const m = this.__m;
    const m11 = m[0]!,
      m12 = m[4]!,
      m13 = m[8]!;
    const m21 = m[1]!,
      m22 = m[5]!,
      m23 = m[9]!;
    const m31 = m[2]!,
      m32 = m[6]!,
      m33 = m[10]!;

    switch (out.order) {
      case 'xyz':
        out.y = Math.asin(clamp(m13, -1, 1));
        if (Math.abs(m13) < 0.9999999) {
          out.x = Math.atan2(-m23, m33);
          out.z = Math.atan2(-m12, m11);
        } else {
          out.x = Math.atan2(m32, m22);
          out.z = 0;
        }
        break;

      case 'yxz':
        out.x = Math.asin(-clamp(m23, -1, 1));
        if (Math.abs(m23) < 0.9999999) {
          out.y = Math.atan2(m13, m33);
          out.z = Math.atan2(m21, m22);
        } else {
          out.y = Math.atan2(-m31, m11);
          out.z = 0;
        }
        break;

      case 'zxy':
        out.x = Math.asin(clamp(m32, -1, 1));
        if (Math.abs(m32) < 0.9999999) {
          out.y = Math.atan2(-m31, m33);
          out.z = Math.atan2(-m12, m22);
        } else {
          out.y = 0;
          out.z = Math.atan2(m21, m11);
        }
        break;

      case 'zyx':
        out.y = Math.asin(-clamp(m31, -1, 1));
        if (Math.abs(m31) < 0.9999999) {
          out.x = Math.atan2(m32, m33);
          out.z = Math.atan2(m21, m11);
        } else {
          out.x = 0;
          out.z = Math.atan2(-m12, m22);
        }
        break;

      case 'yzx':
        out.z = Math.asin(clamp(m21, -1, 1));
        if (Math.abs(m21) < 0.9999999) {
          out.x = Math.atan2(-m23, m22);
          out.y = Math.atan2(-m31, m11);
        } else {
          out.x = 0;
          out.y = Math.atan2(m13, m33);
        }
        break;

      case 'xzy':
        out.z = Math.asin(-clamp(m12, -1, 1));
        if (Math.abs(m12) < 0.9999999) {
          out.x = Math.atan2(m32, m22);
          out.y = Math.atan2(m13, m11);
        } else {
          out.x = Math.atan2(-m23, m33);
          out.y = 0;
        }
        break;
    }

    return this;
  }

  /**
   * Decomposes the rotation component of this matrix into a quaternion representation.
   * @param out The quaternion object to store the rotation values.
   * @returns This matrix after decomposing the rotation.
   */
  decomposeRotationQ(out: Quaternion): this {
    const m = this.__m;

    // Extract rotation matrix (remove scale)
    const sx = Math.hypot(m[0]!, m[1]!, m[2]!);
    const sy = Math.hypot(m[4]!, m[5]!, m[6]!);
    const sz = Math.hypot(m[8]!, m[9]!, m[10]!);

    if (sx === 0 || sy === 0 || sz === 0) {
      out.set(1, 0, 0, 0); // identity
      return this;
    }

    const m00 = m[0]!,
      m01 = m[4]!,
      m02 = m[8]!;
    const m10 = m[1]!,
      m11 = m[5]!,
      m12 = m[9]!;
    const m20 = m[2]!,
      m21 = m[6]!,
      m22 = m[10]!;

    const trace = m00 + m11 + m22;
    let s: number;

    if (trace > 0) {
      s = Math.sqrt(trace + 1.0) * 2.0;
      out.set(0.25 * s, (m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s);
    } else if (m00 > m11 && m00 > m22) {
      s = Math.sqrt(1.0 + m00 - m11 - m22) * 2.0;
      out.set((m21 - m12) / s, 0.25 * s, (m01 + m10) / s, (m02 + m20) / s);
    } else if (m11 > m22) {
      s = Math.sqrt(1.0 + m11 - m00 - m22) * 2.0;
      out.set((m02 - m20) / s, (m01 + m10) / s, 0.25 * s, (m12 + m21) / s);
    } else {
      s = Math.sqrt(1.0 + m22 - m00 - m11) * 2.0;
      out.set((m10 - m01) / s, (m02 + m20) / s, (m12 + m21) / s, 0.25 * s);
    }

    return this;
  }

  /**
   * Decomposes the scale component of this matrix into a vector representation.
   * @param out The vector object to store the scale values.
   * @returns This matrix after decomposing the scale.
   */
  decomposeScale(out: Vector3): this {
    const m = this.__m;

    const sx = Math.hypot(m[0]!, m[1]!, m[2]!);
    const sy = Math.hypot(m[4]!, m[5]!, m[6]!);
    const sz = Math.hypot(m[8]!, m[9]!, m[10]!);

    out.set(sx, sy, sz);
    return this;
  }

  /**
   * Decomposes the position component of this matrix into a vector representation.
   * @param out The vector object to store the position values.
   * @returns This matrix after decomposing the position.
   */
  decomposePosition(out: Vector3): this {
    const m = this.__m;

    out.set(m[12]!, m[13]!, m[14]!);
    return this;
  }

  /**
   * Creates a view matrix from the given eye, target, and up vectors.
   * @param eye The position of the camera.
   * @param target The point the camera is looking at.
   * @param up The up direction of the camera.
   * @returns This matrix after creating the view matrix.
   */
  lookAt(
    eye: Vector3,
    target: Vector3,
    up: Vector3 = Vector3.Up(),
    invert: boolean = false,
  ): this {
    const u = new Vector3(up.y, up.x, up.z); // swap x and y for right-handed system

    const z = invert
      ? target.clone().sub(eye).normalize()
      : eye.clone().sub(target).normalize(); // forward
    const x = z.clone().cross(u).normalize(); // right
    if (x.length() === 0) {
      x.x = 1.0;
    }
    const y = x.clone().cross(z).normalize(); // up

    // prettier-multiline-arrays-next-line-pattern: 4
    return this.set([
      y.x, y.y, y.z, 0,
      x.x, x.y, x.z, 0,
      z.x, z.y, z.z, 0,
      -x.dot(eye), -y.dot(eye), -z.dot(eye), 1,
    ]);
  }

  /**
   * Transposes this matrix.
   * @returns This matrix after transposition.
   */
  transpose(): this {
    const m = this.__m;
    const t = new Float32Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        t[r * 4 + c] = m[c * 4 + r]!; // column-major transpose
      }
    }
    this.__m.set(t);
    return this.markAsDirty();
  }

  /**
   * Inverse for rigid transforms (R|t) => (R^T | -R^T t)
   */
  invert(): this {
    const m = this.__m;

    const r00 = m[0]!,
      r01 = m[4]!,
      r02 = m[8]!;
    const r10 = m[1]!,
      r11 = m[5]!,
      r12 = m[9]!;
    const r20 = m[2]!,
      r21 = m[6]!,
      r22 = m[10]!;
    const tx = m[12]!,
      ty = m[13]!,
      tz = m[14]!;

    // R^T
    m[0] = r00;
    m[4] = r10;
    m[8] = r20;
    m[1] = r01;
    m[5] = r11;
    m[9] = r21;
    m[2] = r02;
    m[6] = r12;
    m[10] = r22;

    // -R^T * t
    m[12] = -(r00 * tx + r01 * ty + r02 * tz);
    m[13] = -(r10 * tx + r11 * ty + r12 * tz);
    m[14] = -(r20 * tx + r21 * ty + r22 * tz);

    // Affine tail
    m[3] = 0;
    m[7] = 0;
    m[11] = 0;
    m[15] = 1;

    return this.markAsDirty();
  }

  private __quaternionToMatrix(quaternion: Quaternion): Float32Array {
    const R = new Float32Array(16);

    const w = quaternion.w,
      x = quaternion.x,
      y = quaternion.y,
      z = quaternion.z;
    const xx = x * x,
      yy = y * y,
      zz = z * z;
    const xy = x * y,
      xz = x * z,
      yz = y * z;
    const wx = w * x,
      wy = w * y,
      wz = w * z;

    // Row-wise r_ij for readability
    const r00 = 1 - 2 * (yy + zz);
    const r01 = 2 * (xy - wz);
    const r02 = 2 * (xz + wy);

    const r10 = 2 * (xy + wz);
    const r11 = 1 - 2 * (xx + zz);
    const r12 = 2 * (yz - wx);

    const r20 = 2 * (xz - wy);
    const r21 = 2 * (yz + wx);
    const r22 = 1 - 2 * (xx + yy);

    // Write as column-major
    R[0] = r00;
    R[4] = r10;
    R[8] = r20;
    R[12] = 0;
    R[1] = r01;
    R[5] = r11;
    R[9] = r21;
    R[13] = 0;
    R[2] = r02;
    R[6] = r12;
    R[10] = r22;
    R[14] = 0;
    R[3] = 0;
    R[7] = 0;
    R[11] = 0;
    R[15] = 1;

    return R;
  }

  private __eulerToMatrix(euler: Euler): Float32Array {
    const R = new Float32Array(16);
    R[0] = 1;
    R[5] = 1;
    R[10] = 1;
    R[15] = 1;

    const cx = Math.cos(euler.x),
      sx = Math.sin(euler.x);
    const cy = Math.cos(euler.y),
      sy = Math.sin(euler.y);
    const cz = Math.cos(euler.z),
      sz = Math.sin(euler.z);

    // Column-major axis rotations (right-handed, column vectors)
    const rX = new Float32Array(16);
    rX[0] = 1;
    rX[5] = cx;
    rX[6] = sx;
    rX[9] = -sx;
    rX[10] = cx;
    rX[15] = 1;

    const rY = new Float32Array(16);
    rY[0] = cy;
    rY[2] = -sy;
    rY[8] = sy;
    rY[10] = cy;
    rY[5] = 1;
    rY[15] = 1;

    const rZ = new Float32Array(16);
    rZ[0] = cz;
    rZ[1] = sz;
    rZ[4] = -sz;
    rZ[5] = cz;
    rZ[10] = 1;
    rZ[15] = 1;

    const order = euler.order;
    const rotations: Record<string, Float32Array> = { x: rX, y: rY, z: rZ };

    for (const a of order) {
      this.__rightMultiplyTo(R, rotations[a]!); // R = R * Ra
    }

    return R;
  }

  // target = mat * target
  private __leftMultiplyTo(target: Float32Array, mat: Float32Array) {
    const tmp = new Float32Array(16);
    for (let j = 0; j < 4; j++) {
      // columns
      const b0 = target[j * 4 + 0]!,
        b1 = target[j * 4 + 1]!,
        b2 = target[j * 4 + 2]!,
        b3 = target[j * 4 + 3]!;
      for (let i = 0; i < 4; i++) {
        // rows
        tmp[j * 4 + i] =
          mat[0 * 4 + i]! * b0 +
          mat[1 * 4 + i]! * b1 +
          mat[2 * 4 + i]! * b2 +
          mat[3 * 4 + i]! * b3;
      }
    }
    target.set(tmp);
  }

  // target = target * mat
  private __rightMultiplyTo(target: Float32Array, mat: Float32Array) {
    const tmp = new Float32Array(16);
    for (let j = 0; j < 4; j++) {
      // columns of result = target * mat.col(j)
      const mj0 = mat[j * 4 + 0]!,
        mj1 = mat[j * 4 + 1]!,
        mj2 = mat[j * 4 + 2]!,
        mj3 = mat[j * 4 + 3]!;
      for (let i = 0; i < 4; i++) {
        tmp[j * 4 + i] =
          target[0 * 4 + i]! * mj0 +
          target[1 * 4 + i]! * mj1 +
          target[2 * 4 + i]! * mj2 +
          target[3 * 4 + i]! * mj3;
      }
    }
    target.set(tmp);
  }
}
