import { Matrix4 } from './Matrix4';
import { Euler, type EulerOrder } from './Euler';
import { Quaternion } from './Quaternion';
import { Vector2 } from './Vector2';
import { Vector3 } from './Vector3';
import { Vector4 } from './Vector4';

/** Utilities to convert between vector types and Euler/Quaternion. */
export class VectorParser {
  /** Convert Vector2 to Vector3 with fixed Z. */
  static vec2ToVec3(v: Vector2, z: number = 0): Vector3 {
    return new Vector3(v.x, v.y, z);
  }

  /** Convert Vector2 to Vector4 with fixed Z and W. */
  static vec2ToVec4(v: Vector2, z: number = 0, w: number = 1): Vector4 {
    return new Vector4(v.x, v.y, z, w);
  }

  /** Drop Z from a Vector3 to a Vector2. */
  static vec3ToVec2(v: Vector3): Vector2 {
    return new Vector2(v.x, v.y);
  }

  /** Convert Vector3 to Vector4 with fixed W. */
  static vec3ToVec4(v: Vector3, w: number = 1): Vector4 {
    return new Vector4(v.x, v.y, v.z, w);
  }

  /** Convert Vector4 to Vector2 by dropping Z and W. */
  static vec4ToVec2(v: Vector4): Vector2 {
    return new Vector2(v.x, v.y);
  }

  /** Convert Vector4 to Vector3 by dropping W. */
  static vec4ToVec3(v: Vector4): Vector3 {
    return new Vector3(v.x, v.y, v.z);
  }

  /** Convert Euler angles to Quaternion using engine's rotation order. */
  static eulerToQuaternion(e: Euler): Quaternion {
    const { x, y, z, order } = e;

    const R = new Quaternion();

    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    switch (order) {
      case 'xyz':
        R.x = s1 * c2 * c3 + c1 * s2 * s3;
        R.y = c1 * s2 * c3 - s1 * c2 * s3;
        R.z = c1 * c2 * s3 + s1 * s2 * c3;
        R.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'yxz':
        R.x = s1 * c2 * c3 + c1 * s2 * s3;
        R.y = c1 * s2 * c3 - s1 * c2 * s3;
        R.z = c1 * c2 * s3 - s1 * s2 * c3;
        R.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case 'zxy':
        R.x = s1 * c2 * c3 - c1 * s2 * s3;
        R.y = c1 * s2 * c3 + s1 * c2 * s3;
        R.z = c1 * c2 * s3 + s1 * s2 * c3;
        R.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'zyx':
        R.x = s1 * c2 * c3 - c1 * s2 * s3;
        R.y = c1 * s2 * c3 + s1 * c2 * s3;
        R.z = c1 * c2 * s3 - s1 * s2 * c3;
        R.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case 'yzx':
        R.x = s1 * c2 * c3 + c1 * s2 * s3;
        R.y = c1 * s2 * c3 + s1 * c2 * s3;
        R.z = c1 * c2 * s3 - s1 * s2 * c3;
        R.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case 'xzy':
        R.x = s1 * c2 * c3 - c1 * s2 * s3;
        R.y = c1 * s2 * c3 - s1 * c2 * s3;
        R.z = c1 * c2 * s3 + s1 * s2 * c3;
        R.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
    }

    return R;
  }

  /** Convert Quaternion to Euler with the given rotation order (default 'zyx'). */
  static quaternionToEuler(q: Quaternion, order: EulerOrder = 'zyx'): Euler {
    const m = new Matrix4().rotate(q);
    const e = new Euler(0, 0, 0, order);
    m.decomposeRotation(e);
    return e;
  }
}
