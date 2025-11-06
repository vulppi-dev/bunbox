import type { Vector3 } from '../../math';
import { Light } from './Light';

/**
 * Ambient light providing uniform global illumination.
 *
 * Simulates indirect/reflected light that uniformly illuminates the scene.
 * Essential for preventing completely black shadows and unlit areas.
 *
 * **Characteristics:**
 * - No position or direction (affects entire scene)
 * - Constant intensity everywhere
 * - Cannot cast shadows
 * - Very cheap to compute
 *
 * **Usage:**
 * - Add base lighting to prevent pure black
 * - Simulate scattered/reflected light
 * - Sky/environment contribution
 * - Typically one per scene
 *
 * @example
 * ```ts
 * const ambient = new AmbientLight();
 * ambient.color.set(0.4, 0.5, 0.6); // Cool blue tint (sky)
 * ambient.intensity = 0.3; // Subtle contribution
 * ```
 */
export class AmbientLight extends Light {
  constructor() {
    super();
    // Ambient lights never cast shadows
    this.castShadows = false;
  }

  /**
   * Light type identifier.
   *
   * @returns "ambient"
   */
  get type(): string {
    return 'ambient';
  }

  /**
   * Ambient lights cannot cast shadows.
   *
   * This setter is disabled and will log a warning if attempted.
   *
   * @param _value - Shadow casting flag (ignored)
   */
  override set castShadows(_value: boolean) {
    if (_value) {
      console.warn(
        'AmbientLight cannot cast shadows. Ignoring castShadows=true',
      );
    }
    // Keep it always false
  }

  /**
   * Calculate light intensity at a point.
   *
   * Ambient lights provide constant intensity everywhere.
   *
   * @param _worldPosition - Point in world space (unused)
   * @returns Constant intensity (1.0)
   */
  getIntensityAt(_worldPosition: Vector3): number {
    // Ambient light is uniform everywhere
    return 1.0;
  }
}
