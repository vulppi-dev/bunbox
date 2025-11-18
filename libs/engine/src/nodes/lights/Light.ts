import type { Vector3 } from '../../math';
import { Color } from '../../math';
import { Node3D } from '../Node3D';

/**
 * Abstract base class for all light sources.
 *
 * Provides common properties shared by all light types:
 * - **Color**: RGB color of the light
 * - **Intensity**: Brightness multiplier
 * - **Cast Shadows**: Whether this light casts shadows
 * - **Enabled**: Whether this light is active
 *
 * **Light Types:**
 * - `DirectionalLight`: Parallel rays (sun)
 * - `PointLight`: Omnidirectional sphere (lamp)
 * - `SpotLight`: Cone-shaped (flashlight)
 * - `AmbientLight`: Global uniform lighting
 *
 * @abstract Subclasses must implement specific light behavior
 *
 * @example
 * ```ts
 * // Use specific light type
 * const light = new DirectionalLight();
 * light.color.set(1, 0.9, 0.8); // Warm sunlight
 * light.intensity = 2.0;
 * light.castShadows = true;
 * ```
 */
export abstract class Light extends Node3D {
  private __color: Color = new Color(1, 1, 1, 1);
  private __intensity: number = 1.0;
  private __castShadows: boolean = false;

  /**
   * Get the light type identifier.
   *
   * Used by the renderer to determine light behavior.
   *
   * @abstract Implemented by subclasses
   * @returns Light type string
   */
  abstract get type(): string;

  /**
   * Light color (RGB).
   *
   * Values typically in range [0, 1] but can exceed for HDR.
   * Alpha component is ignored.
   *
   * Default: white (1, 1, 1)
   */
  get color(): Color {
    return this.__color;
  }

  /**
   * Light intensity multiplier.
   *
   * Scales the brightness of the light.
   * - 0 = no light
   * - 1 = normal brightness
   * - >1 = brighter (HDR)
   *
   * Default: 1.0
   */
  get intensity(): number {
    return this.__intensity;
  }

  /**
   * Whether this light casts shadows.
   *
   * Shadow casting is expensive, enable only for important lights.
   *
   * Default: false
   */
  get castShadows(): boolean {
    return this.__castShadows;
  }

  /**
   * Set light color.
   *
   * @param value - New color (RGB)
   */
  set color(value: Color) {
    this.__color = value;
    this.__color.markAsDirty();
    this.markAsDirty();
  }

  /**
   * Set light intensity.
   *
   * @param value - Brightness multiplier (typically 0-10)
   */
  set intensity(value: number) {
    this.__intensity = value;
    this.markAsDirty();
  }

  /**
   * Enable or disable shadow casting.
   *
   * @param value - True to cast shadows
   */
  set castShadows(value: boolean) {
    this.__castShadows = value;
    this.markAsDirty();
  }

  /**
   * Calculate light contribution at a point.
   *
   * Subclasses implement specific attenuation/falloff calculations.
   *
   * @abstract Implemented by subclasses
   * @param worldPosition - Point in world space
   * @returns Light intensity at that point (0-1)
   */
  abstract getIntensityAt(worldPosition: Vector3): number;
}
