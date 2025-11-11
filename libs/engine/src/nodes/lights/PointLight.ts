import type { Vector3 } from '../../math';
import { Light } from './Light';

/**
 * Point light emitting in all directions (lamp, bulb).
 *
 * Simulates an omnidirectional point light source with distance attenuation.
 * Perfect for lamps, torches, and other local light sources.
 *
 * **Characteristics:**
 * - Emits light in all directions equally
 * - Intensity falls off with distance (inverse square law)
 * - Controlled by range parameter
 * - Position determines light origin
 *
 * **Attenuation:**
 * Uses physically-based inverse square falloff with a range cutoff.
 * Intensity = base_intensity * (1 / (1 + distance²)) * smoothstep(range)
 *
 * @example
 * ```ts
 * const lamp = new PointLight();
 * lamp.color.set(1, 0.8, 0.6); // Warm orange
 * lamp.intensity = 5.0;
 * lamp.range = 10.0; // 10 meters effective range
 * lamp.position.set(0, 2, 0); // 2 meters high
 * lamp.castShadows = true;
 * ```
 */
export class PointLight extends Light {
  private __range: number = 10.0;

  /**
   * Light type identifier.
   *
   * @returns "point"
   */
  get type(): string {
    return 'point';
  }

  /**
   * Effective range of the light in meters.
   *
   * Beyond this distance, light contribution becomes negligible.
   * Used for optimization and smooth falloff.
   *
   * Default: 10.0
   */
  get range(): number {
    return this.__range;
  }

  /**
   * Set effective range of the light.
   *
   * @param value - Range in meters (must be > 0)
   */
  set range(value: number) {
    this.__range = Math.max(0.01, value);
    this.markAsDirty();
  }

  /**
   * Calculate light intensity at a point.
   *
   * Uses inverse square law with smooth range cutoff:
   * - intensity = 1 / (1 + distance²)
   * - Smoothly fades to 0 at range boundary
   *
   * @param worldPosition - Point in world space
   * @returns Light intensity at that point (0-1)
   */
  getIntensityAt(worldPosition: Vector3): number {
    // Calculate distance from light to point
    const lightPos = this.position;
    const dx = worldPosition.x - lightPos.x;
    const dy = worldPosition.y - lightPos.y;
    const dz = worldPosition.z - lightPos.z;
    const distanceSq = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSq);

    // Early out if beyond range
    if (distance >= this.__range) {
      return 0;
    }

    // Inverse square falloff
    const attenuation = 1.0 / (1.0 + distanceSq);

    // Smooth cutoff at range boundary
    const rangeFactor = distance / this.__range;
    const smoothCutoff = 1.0 - rangeFactor * rangeFactor;

    return attenuation * Math.max(0, smoothCutoff);
  }
}
