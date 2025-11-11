import { Plane } from './Plane';
import type { Vector3 } from './Vector3';

/**
 * View frustum defined by six planes (left, right, top, bottom, near, far).
 * Used for frustum culling to determine object visibility.
 */
export class Frustum {
  private __planes: [Plane, Plane, Plane, Plane, Plane, Plane];

  constructor() {
    this.__planes = [
      new Plane(), // Left
      new Plane(), // Right
      new Plane(), // Top
      new Plane(), // Bottom
      new Plane(), // Near
      new Plane(), // Far
    ];
  }

  /**
   * Get the frustum planes.
   */
  get planes(): [Plane, Plane, Plane, Plane, Plane, Plane] {
    return this.__planes;
  }

  /**
   * Set a specific plane.
   */
  setPlane(index: number, plane: Plane): void {
    if (index >= 0 && index < 6) {
      this.__planes[index] = plane;
    }
  }

  /**
   * Check if a point is inside the frustum.
   * @param point Point to test
   * @returns true if point is inside or on frustum
   */
  containsPoint(point: Vector3): boolean {
    for (const plane of this.__planes) {
      if (plane.distanceToPoint(point) < 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a sphere intersects the frustum.
   * @param center Sphere center
   * @param radius Sphere radius
   * @returns true if sphere intersects or is inside frustum
   */
  intersectsSphere(center: Vector3, radius: number): boolean {
    for (const plane of this.__planes) {
      if (plane.distanceToPoint(center) < -radius) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if an axis-aligned bounding box (AABB) intersects the frustum.
   * @param min AABB minimum corner
   * @param max AABB maximum corner
   * @returns true if AABB intersects or is inside frustum
   */
  intersectsBox(min: Vector3, max: Vector3): boolean {
    for (const plane of this.__planes) {
      // Find the positive vertex (farthest along plane normal)
      const px = plane.normal.x >= 0 ? max.x : min.x;
      const py = plane.normal.y >= 0 ? max.y : min.y;
      const pz = plane.normal.z >= 0 ? max.z : min.z;

      // If positive vertex is outside (behind) the plane, box is outside frustum
      if (
        plane.normal.x * px +
          plane.normal.y * py +
          plane.normal.z * pz +
          plane.distance <
        0
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clone the frustum.
   */
  clone(): Frustum {
    const frustum = new Frustum();
    for (let i = 0; i < 6; i++) {
      frustum.__planes[i] = this.__planes[i]!.clone();
    }
    return frustum;
  }
}
