import { DirtyState } from '@bunbox/utils';
import type { TexturePointer } from '../managers/TextureManager';
import { Color } from '../math';
import { ShadowConfig } from './ShadowConfig';

/**
 * Environment node managing scene-wide rendering settings.
 *
 * Controls global environment properties including:
 * - **Ambient lighting**: Base illumination color and intensity
 * - **Shadow configuration**: Quality, resolution, and filtering
 * - **Skybox**: Background cubemap texture
 * - **Fog**: Distance-based atmospheric effects
 * - **Tone mapping**: HDR to LDR conversion parameters
 *
 * Typically only one Environment node should exist per scene, attached to
 * the scene root or a dedicated environment parent node.
 *
 * **Performance Considerations:**
 * - Shadow quality significantly impacts performance
 * - Use quality presets (low/medium/high/ultra) for quick setup
 * - Disable shadows entirely on low-end hardware
 * - Skybox rendering has minimal cost with modern GPUs
 *
 * @extends {DirtyState}
 *
 * @example
 * ```ts
 * import { Environment, ShadowConfig, Color } from '@bunbox/engine';
 *
 * // Basic environment setup
 * const env = new Environment();
 * env.ambientColor.set(0.3, 0.4, 0.5, 1.0); // Cool blue ambient
 * env.ambientIntensity = 0.2;
 * env.shadowConfig = ShadowConfig.medium();
 *
 * // High-quality environment
 * const hqEnv = new Environment();
 * hqEnv.shadowConfig = ShadowConfig.high();
 * hqEnv.skybox = myCubemapTexture;
 * hqEnv.enableFog = true;
 * hqEnv.fogColor.set(0.7, 0.8, 0.9, 1.0);
 * hqEnv.fogStart = 50;
 * hqEnv.fogEnd = 200;
 * ```
 *
 * @example
 * ```ts
 * // Mobile-optimized environment
 * const mobileEnv = new Environment();
 * mobileEnv.shadowConfig = ShadowConfig.low();
 * mobileEnv.ambientIntensity = 0.3; // Higher ambient reduces shadow needs
 * mobileEnv.enableFog = false; // Disable fog for performance
 * ```
 *
 */
export class Environment extends DirtyState {
  private __ambientColor: Color;
  private __ambientIntensity: number = 0.2;
  private __shadowConfig: ShadowConfig;
  private __skybox: TexturePointer | null = null;
  private __enableFog: boolean = false;
  private __fogColor: Color;
  private __fogStart: number = 10;
  private __fogEnd: number = 100;
  private __fogDensity: number = 0.02;
  private __exposure: number = 1.0;

  constructor() {
    super();
    this.__ambientColor = new Color(0.2, 0.2, 0.2, 1.0);
    this.__shadowConfig = ShadowConfig.medium();
    this.__fogColor = new Color(0.5, 0.6, 0.7, 1.0);
  }

  /**
   * Ambient light color affecting all surfaces.
   *
   * Provides base illumination to prevent pure black areas.
   * Combined with ambientIntensity to calculate final ambient contribution.
   */
  get ambientColor(): Color {
    return this.__ambientColor;
  }

  /**
   * Ambient light intensity multiplier.
   *
   * Typical range: 0.0 (no ambient) to 1.0 (full ambient).
   * Higher values reduce contrast but improve visibility in shadows.
   */
  get ambientIntensity(): number {
    return this.__ambientIntensity;
  }

  /**
   * Shadow rendering configuration.
   *
   * Controls shadow map resolution, filtering, bias, and cascades.
   * Use quality presets for quick setup:
   * - ShadowConfig.low() - Mobile/low-end (512x512)
   * - ShadowConfig.medium() - Balanced (1024x1024)
   * - ShadowConfig.high() - Desktop (2048x2048, cascades)
   * - ShadowConfig.ultra() - High-end (4096x4096, PCSS, cascades)
   * - ShadowConfig.disabled() - No shadows
   */
  get shadowConfig(): ShadowConfig {
    return this.__shadowConfig;
  }

  /**
   * Skybox cubemap texture pointer for background rendering.
   *
   * Rendered behind all geometry to provide environment backdrop.
   * Also used for image-based lighting (IBL) reflections.
   *
   * Set to null to use solid background color instead.
   * Use TextureManager to obtain texture pointers.
   *
   * @example
   * ```ts
   * const skyboxPointer = textureManager.register(myCubemapTexture);
   * env.skybox = skyboxPointer;
   * ```
   */
  get skybox(): TexturePointer | null {
    return this.__skybox;
  }

  /**
   * Enable distance-based fog effect.
   *
   * Fog blends scene colors with fogColor based on distance from camera.
   * Uses either linear (fogStart/fogEnd) or exponential (fogDensity) falloff.
   */
  get enableFog(): boolean {
    return this.__enableFog;
  }

  /**
   * Fog color blended with scene at distance.
   *
   * Typically matches skybox horizon color for seamless transition.
   */
  get fogColor(): Color {
    return this.__fogColor;
  }

  /**
   * Distance where linear fog begins (camera space units).
   *
   * Objects closer than fogStart have no fog applied.
   * Only used when enableFog is true with linear fog mode.
   */
  get fogStart(): number {
    return this.__fogStart;
  }

  /**
   * Distance where linear fog reaches maximum (camera space units).
   *
   * Objects at or beyond fogEnd are fully fogged.
   * Only used when enableFog is true with linear fog mode.
   */
  get fogEnd(): number {
    return this.__fogEnd;
  }

  /**
   * Exponential fog density factor.
   *
   * Higher values create denser fog that obscures distance more quickly.
   * Typical range: 0.001 - 0.1
   * Only used when enableFog is true with exponential fog mode.
   */
  get fogDensity(): number {
    return this.__fogDensity;
  }

  /**
   * Exposure value for tone mapping (HDR to LDR conversion).
   *
   * Controls overall brightness of the rendered scene:
   * - < 1.0: Darker (underexposed)
   * - = 1.0: Neutral
   * - > 1.0: Brighter (overexposed)
   *
   * Typical range: 0.1 - 10.0
   */
  get exposure(): number {
    return this.__exposure;
  }

  set ambientIntensity(value: number) {
    this.__ambientIntensity = Math.max(0, value);
    this.markAsDirty();
  }

  set shadowConfig(value: ShadowConfig) {
    this.__shadowConfig = value;
    this.markAsDirty();
  }

  set skybox(value: TexturePointer | null) {
    this.__skybox = value;
    this.markAsDirty();
  }

  set enableFog(value: boolean) {
    this.__enableFog = value;
    this.markAsDirty();
  }

  set fogStart(value: number) {
    this.__fogStart = Math.max(0, value);
    this.markAsDirty();
  }

  set fogEnd(value: number) {
    this.__fogEnd = Math.max(this.__fogStart, value);
    this.markAsDirty();
  }

  set fogDensity(value: number) {
    this.__fogDensity = Math.max(0, value);
    this.markAsDirty();
  }

  set exposure(value: number) {
    this.__exposure = Math.max(0.001, value);
    this.markAsDirty();
  }

  /**
   * Get fog factor for a given distance.
   *
   * Returns 0.0 (no fog) to 1.0 (full fog) for linear fog mode.
   * Used by shaders to blend scene color with fog color.
   *
   * @param distance - Distance from camera in world units
   * @returns Fog factor [0, 1]
   */
  getFogFactor(distance: number): number {
    if (!this.__enableFog) return 0;

    // Linear fog
    if (distance <= this.__fogStart) return 0;
    if (distance >= this.__fogEnd) return 1;

    return (distance - this.__fogStart) / (this.__fogEnd - this.__fogStart);
  }

  /**
   * Get exponential fog factor for a given distance.
   *
   * Returns 0.0 (no fog) to 1.0 (full fog) using exponential falloff.
   * Creates more natural-looking atmospheric fog than linear mode.
   *
   * @param distance - Distance from camera in world units
   * @returns Fog factor [0, 1]
   */
  getExponentialFogFactor(distance: number): number {
    if (!this.__enableFog) return 0;

    // Exponential fog: 1 - e^(-density * distance)
    return 1.0 - Math.exp(-this.__fogDensity * distance);
  }

  /**
   * Get exponential squared fog factor for a given distance.
   *
   * Returns 0.0 (no fog) to 1.0 (full fog) using squared exponential falloff.
   * Creates even more natural-looking fog with slower initial buildup.
   *
   * @param distance - Distance from camera in world units
   * @returns Fog factor [0, 1]
   */
  getExponentialSquaredFogFactor(distance: number): number {
    if (!this.__enableFog) return 0;

    // Exponential squared fog: 1 - e^(-(density * distance)^2)
    const factor = this.__fogDensity * distance;
    return 1.0 - Math.exp(-factor * factor);
  }
}
