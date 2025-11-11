import { Vector3 } from '../../math';
import { Light } from './Light';

/**
 * Spot light with cone-shaped beam (flashlight, spotlight).
 *
 * Simulates a light source that emits in a cone shape with distance attenuation.
 * Perfect for flashlights, stage lights, and focused illumination.
 *
 * **Characteristics:**
 * - Emits light in a cone shape
 * - Direction determined by node's forward vector (-Z axis)
 * - Intensity falls off with distance and angle
 * - Controlled by angle and range parameters
 *
 * **Cone Angles:**
 * - `innerAngle`: Full intensity cone (core)
 * - `outerAngle`: Light starts fading (penumbra)
 * - Smooth transition between inner and outer cones
 *
 * @example
 * ```ts
 * const flashlight = new SpotLight();
 * flashlight.color.set(1, 1, 0.9); // Slightly warm white
 * flashlight.intensity = 10.0;
 * flashlight.range = 20.0; // 20 meters reach
 * flashlight.innerAngle = Math.PI / 8; // 22.5° core
 * flashlight.outerAngle = Math.PI / 6; // 30° penumbra
 * flashlight.position.set(0, 2, 0);
 * flashlight.rotation.set(0, 0, 0); // Point forward
 * flashlight.castShadows = true;
 * ```
 */
export class SpotLight extends Light {
  private __range: number = 10.0;
  private __innerAngle: number = Math.PI / 8; // 22.5 degrees
  private __outerAngle: number = Math.PI / 6; // 30 degrees

  /**
   * Light type identifier.
   *
   * @returns "spot"
   */
  get type(): string {
    return 'spot';
  }

  /**
   * Effective range of the light in meters.
   *
   * Beyond this distance, light contribution becomes negligible.
   *
   * Default: 10.0
   */
  get range(): number {
    return this.__range;
  }

  /**
   * Inner cone angle in radians (full intensity).
   *
   * Within this angle from the direction, light is at full intensity.
   *
   * Default: π/8 (22.5°)
   */
  get innerAngle(): number {
    return this.__innerAngle;
  }

  /**
   * Outer cone angle in radians (fade start).
   *
   * Beyond this angle, no light. Between inner and outer is penumbra.
   *
   * Default: π/6 (30°)
   */
  get outerAngle(): number {
    return this.__outerAngle;
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
   * Set inner cone angle.
   *
   * @param value - Angle in radians (0 to outerAngle)
   */
  set innerAngle(value: number) {
    this.__innerAngle = Math.max(0, Math.min(value, this.__outerAngle));
    this.markAsDirty();
  }

  /**
   * Set outer cone angle.
   *
   * @param value - Angle in radians (innerAngle to π)
   */
  set outerAngle(value: number) {
    this.__outerAngle = Math.max(this.__innerAngle, Math.min(value, Math.PI));
    this.markAsDirty();
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
   * Combines distance attenuation with angular falloff:
   * - Distance: inverse square law with range cutoff
   * - Angle: smooth transition from inner to outer cone
   *
   * @param worldPosition - Point in world space
   * @returns Light intensity at that point (0-1)
   */
  getIntensityAt(worldPosition: Vector3): number {
    const lightPos = this.position;

    // Calculate distance
    const dx = worldPosition.x - lightPos.x;
    const dy = worldPosition.y - lightPos.y;
    const dz = worldPosition.z - lightPos.z;
    const distanceSq = dx * dx + dy * dy + dz * dz;
    const distance = Math.sqrt(distanceSq);

    // Early out if beyond range
    if (distance >= this.__range) {
      return 0;
    }

    // Calculate direction to point
    const toPoint = new Vector3(dx, dy, dz).normalize();
    const direction = this.getDirection();

    // Calculate angle between light direction and direction to point
    const cosAngle = direction.dot(toPoint);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    // Early out if outside outer cone
    if (angle > this.__outerAngle) {
      return 0;
    }

    // Distance attenuation (inverse square)
    const distanceAttenuation = 1.0 / (1.0 + distanceSq);

    // Smooth range cutoff
    const rangeFactor = distance / this.__range;
    const smoothRangeCutoff = 1.0 - rangeFactor * rangeFactor;

    // Angular attenuation (smoothstep between inner and outer angles)
    let angularAttenuation = 1.0;
    if (angle > this.__innerAngle) {
      const angleFactor =
        (angle - this.__innerAngle) / (this.__outerAngle - this.__innerAngle);
      // Smoothstep
      angularAttenuation =
        1.0 - angleFactor * angleFactor * (3.0 - 2.0 * angleFactor);
    }

    return (
      distanceAttenuation * Math.max(0, smoothRangeCutoff) * angularAttenuation
    );
  }
}
