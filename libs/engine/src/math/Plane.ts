import { Vector3 } from './Vector3';

/**
 * Plane in 3D space defined by normal vector and distance from origin.
 * Equation: normal.x * x + normal.y * y + normal.z * z + distance = 0
 */
export class Plane {
  #normal: Vector3;
  #distance: number;

  /**
   * Create plane from three points in 3D space.
   */
  static fromPoints(p1: Vector3, p2: Vector3, p3: Vector3): Plane {
    const v1 = p2.clone().sub(p1);
    const v2 = p3.clone().sub(p1);
    const normal = v1.cross(v2).normalize();
    const distance = -normal.dot(p1);
    return new Plane(normal, distance);
  }

  /**
   * Create plane from normal and point on plane.
   */
  static fromNormalAndPoint(normal: Vector3, point: Vector3): Plane {
    const n = normal.clone().normalize();
    const distance = -n.dot(point);
    return new Plane(n, distance);
  }

  constructor(normal: Vector3 = new Vector3(0, 1, 0), distance: number = 0) {
    this.#normal = normal.clone().normalize();
    this.#distance = distance;
  }

  get normal(): Vector3 {
    return this.#normal;
  }

  get distance(): number {
    return this.#distance;
  }

  /**
   * Calculate signed distance from point to plane.
   * Positive = in front of plane (normal direction)
   * Negative = behind plane
   * Zero = on plane
   */
  distanceToPoint(point: Vector3): number {
    return this.normal.dot(point) + this.distance;
  }

  /**
   * Normalize the plane equation.
   */
  normalize(): this {
    const length = this.#normal.length();
    if (length > 0) {
      const invLength = 1 / length;
      this.#normal.mulS(invLength);
      this.#distance *= invLength;
    }
    return this;
  }

  /**
   * Clone the plane.
   */
  clone(): Plane {
    return new Plane(this.normal.clone(), this.distance);
  }
}
