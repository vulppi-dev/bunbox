import { Vector3 } from '../../math';
import { Light } from './Light';

/**
 * Directional light with parallel rays (sun).
 *
 * Simulates a distant light source where all rays are parallel.
 * Perfect for simulating sunlight or moonlight.
 *
 * **Characteristics:**
 * - Rays are parallel (no attenuation with distance)
 * - Direction determined by node's forward vector (-Z axis)
 * - Position doesn't affect lighting (only rotation matters)
 * - Efficient for large scenes
 *
 * **Common Uses:**
 * - Sunlight
 * - Moonlight
 * - Large area lighting
 *
 * @example
 * ```ts
 * const sun = new DirectionalLight();
 * sun.color.set(1, 0.95, 0.9); // Warm white
 * sun.intensity = 1.5;
 * sun.castShadows = true;
 *
 * // Point downward and slightly from the side
 * sun.rotation.set(Math.PI / 4, Math.PI / 6, 0);
 * ```
 */
export class DirectionalLight extends Light {
  /**
   * Light type identifier.
   *
   * @returns "directional"
   */
  get type(): string {
    return 'directional';
  }

  /**
   * Get light direction in world space.
   *
   * Direction is the node's forward vector (-Z axis after rotation).
   *
   * @returns Normalized direction vector
   */
  getDirection(): Vector3 {
    // Extract forward direction from transform matrix
    // In right-handed Y-up: forward is -Z
    const m = this.transform.toArray();
    const forward = new Vector3(
      -m[8], // -Z column X
      -m[9], // -Z column Y
      -m[10], // -Z column Z
    );
    return forward.normalize();
  }

  /**
   * Calculate light intensity at a point.
   *
   * For directional lights, intensity is constant everywhere
   * (parallel rays, no attenuation).
   *
   * @param _worldPosition - Point in world space (unused)
   * @returns Constant intensity (1.0)
   */
  getIntensityAt(_worldPosition: Vector3): number {
    // Directional lights have uniform intensity everywhere
    return 1.0;
  }
}
