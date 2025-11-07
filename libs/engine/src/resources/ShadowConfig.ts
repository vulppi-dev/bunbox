import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

/**
 * Shadow quality preset affecting resolution and filtering.
 */
export type ShadowQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Shadow map filtering technique.
 */
export type ShadowFilterMode = 'none' | 'pcf' | 'pcss' | 'vsm';

/**
 * Shadow cascade configuration for directional lights.
 */
export interface ShadowCascadeConfig {
  /** Number of cascade splits (1-4 typical) */
  count: number;
  /** Split distances for each cascade */
  splits: number[];
  /** Fade distance at cascade boundaries */
  fadeDistance: number;
}

/**
 * Configuration for shadow rendering and quality.
 *
 * Controls shadow map resolution, filtering, bias, and cascading for directional lights.
 * Provides quality presets for quick setup and fine-grained control for optimization.
 *
 * **Shadow Map Resolution:**
 * - Low: 512x512 (mobile/low-end)
 * - Medium: 1024x1024 (balanced)
 * - High: 2048x2048 (desktop)
 * - Ultra: 4096x4096 (high-end)
 *
 * **Filtering Modes:**
 * - `none`: Hard shadows, no filtering (fastest)
 * - `pcf`: Percentage Closer Filtering (smooth edges, good performance)
 * - `pcss`: Percentage Closer Soft Shadows (soft penumbra, expensive)
 * - `vsm`: Variance Shadow Maps (pre-filtered, good for large areas)
 *
 * **Shadow Acne Prevention:**
 * Use `bias` and `normalBias` to prevent self-shadowing artifacts.
 * Higher values reduce acne but may cause "peter panning" (shadows detaching).
 *
 * @extends {DirtyState}
 *
 * @example
 * ```ts
 * // Use quality preset
 * const shadows = ShadowConfig.medium();
 *
 * // Custom configuration
 * const customShadows = new ShadowConfig({
 *   resolution: 2048,
 *   filterMode: 'pcf',
 *   bias: 0.002,
 *   normalBias: 0.01,
 *   cascades: {
 *     count: 3,
 *     splits: [0.1, 0.3, 1.0],
 *     fadeDistance: 10
 *   }
 * });
 *
 * // Disable shadows
 * const noShadows = ShadowConfig.disabled();
 * ```
 */
export class ShadowConfig extends DirtyState {
  #enabled: boolean = true;
  #resolution: number = 1024;
  #filterMode: ShadowFilterMode = 'pcf';
  #bias: number = 0.001;
  #normalBias: number = 0.005;
  #maxDistance: number = 100;
  #fadeDistance: number = 10;
  #cascades: ShadowCascadeConfig | null = null;

  /**
   * Low quality preset (512x512, PCF filtering).
   * Best for: Mobile devices, low-end hardware
   */
  static low(): ShadowConfig {
    return new ShadowConfig({
      resolution: 512,
      filterMode: 'pcf',
      bias: 0.002,
      normalBias: 0.01,
    });
  }

  /**
   * Medium quality preset (1024x1024, PCF filtering).
   * Best for: Balanced quality/performance on most hardware
   */
  static medium(): ShadowConfig {
    return new ShadowConfig({
      resolution: 1024,
      filterMode: 'pcf',
      bias: 0.001,
      normalBias: 0.005,
    });
  }

  /**
   * High quality preset (2048x2048, PCF filtering, 2 cascades).
   * Best for: Desktop gaming, high-end hardware
   */
  static high(): ShadowConfig {
    return new ShadowConfig({
      resolution: 2048,
      filterMode: 'pcf',
      bias: 0.0005,
      normalBias: 0.003,
      cascades: {
        count: 2,
        splits: [0.15, 1.0],
        fadeDistance: 15,
      },
    });
  }

  /**
   * Ultra quality preset (4096x4096, PCSS filtering, 4 cascades).
   * Best for: High-end gaming, cinematic rendering
   */
  static ultra(): ShadowConfig {
    return new ShadowConfig({
      resolution: 4096,
      filterMode: 'pcss',
      bias: 0.0003,
      normalBias: 0.002,
      cascades: {
        count: 4,
        splits: [0.07, 0.15, 0.5, 1.0],
        fadeDistance: 20,
      },
    });
  }

  /**
   * Disabled shadows configuration.
   * Use when shadows are not needed to improve performance.
   */
  static disabled(): ShadowConfig {
    const config = new ShadowConfig({});
    config.#enabled = false;
    return config;
  }

  constructor(desc: {
    enabled?: boolean;
    resolution?: number;
    filterMode?: ShadowFilterMode;
    bias?: number;
    normalBias?: number;
    maxDistance?: number;
    fadeDistance?: number;
    cascades?: ShadowCascadeConfig | null;
  }) {
    super();
    this.#enabled = desc.enabled ?? true;
    this.#resolution = Math.max(256, desc.resolution ?? 1024);
    this.#filterMode = desc.filterMode ?? 'pcf';
    this.#bias = Math.max(0, desc.bias ?? 0.001);
    this.#normalBias = Math.max(0, desc.normalBias ?? 0.005);
    this.#maxDistance = Math.max(1, desc.maxDistance ?? 100);
    this.#fadeDistance = Math.max(0, desc.fadeDistance ?? 10);
    this.#cascades = desc.cascades ?? null;
  }

  /** Whether shadows are enabled */
  get enabled(): boolean {
    return this.#enabled;
  }

  /**
   * Shadow map resolution (width and height in pixels).
   * Common values: 512, 1024, 2048, 4096
   */
  get resolution(): number {
    return this.#resolution;
  }

  /** Shadow filtering technique */
  get filterMode(): ShadowFilterMode {
    return this.#filterMode;
  }

  /**
   * Depth bias to prevent shadow acne (self-shadowing artifacts).
   * Typical range: 0.0001 - 0.01
   */
  get bias(): number {
    return this.#bias;
  }

  /**
   * Normal-based bias for surfaces facing away from light.
   * Typical range: 0.001 - 0.05
   */
  get normalBias(): number {
    return this.#normalBias;
  }

  /**
   * Maximum distance from camera where shadows are rendered.
   * Objects beyond this distance won't cast or receive shadows.
   */
  get maxDistance(): number {
    return this.#maxDistance;
  }

  /**
   * Distance over which shadows fade out near maxDistance.
   * Prevents harsh cutoff at shadow distance limit.
   */
  get fadeDistance(): number {
    return this.#fadeDistance;
  }

  /**
   * Cascade configuration for directional lights.
   * null disables cascades (single shadow map).
   */
  get cascades(): ShadowCascadeConfig | null {
    return this.#cascades
      ? {
          count: this.#cascades.count,
          splits: [...this.#cascades.splits],
          fadeDistance: this.#cascades.fadeDistance,
        }
      : null;
  }

  /**
   * Compute content hash for caching and deduplication.
   */
  get hash(): string {
    return sha(
      JSON.stringify({
        enabled: this.#enabled,
        resolution: this.#resolution,
        filterMode: this.#filterMode,
        bias: this.#bias,
        normalBias: this.#normalBias,
        maxDistance: this.#maxDistance,
        fadeDistance: this.#fadeDistance,
        cascades: this.#cascades,
      }),
      'hex',
    );
  }

  set enabled(value: boolean) {
    if (this.#enabled === value) return;
    this.#enabled = value;
    this.markAsDirty();
  }

  set resolution(value: number) {
    const res = Math.max(256, value | 0);
    if (this.#resolution === res) return;
    this.#resolution = res;
    this.markAsDirty();
  }

  set filterMode(value: ShadowFilterMode) {
    if (this.#filterMode === value) return;
    this.#filterMode = value;
    this.markAsDirty();
  }

  set bias(value: number) {
    const b = Math.max(0, value);
    if (this.#bias === b) return;
    this.#bias = b;
    this.markAsDirty();
  }

  set normalBias(value: number) {
    const nb = Math.max(0, value);
    if (this.#normalBias === nb) return;
    this.#normalBias = nb;
    this.markAsDirty();
  }

  set maxDistance(value: number) {
    const d = Math.max(1, value);
    if (this.#maxDistance === d) return;
    this.#maxDistance = d;
    this.markAsDirty();
  }

  set fadeDistance(value: number) {
    const fd = Math.max(0, value);
    if (this.#fadeDistance === fd) return;
    this.#fadeDistance = fd;
    this.markAsDirty();
  }

  set cascades(value: ShadowCascadeConfig | null) {
    if (value === null) {
      if (this.#cascades === null) return;
      this.#cascades = null;
      this.markAsDirty();
      return;
    }

    const newConfig = {
      count: Math.max(1, Math.min(4, value.count | 0)),
      splits: value.splits.slice(0, value.count),
      fadeDistance: Math.max(0, value.fadeDistance),
    };

    if (
      this.#cascades &&
      this.#cascades.count === newConfig.count &&
      this.#cascades.fadeDistance === newConfig.fadeDistance &&
      this.#cascades.splits.length === newConfig.splits.length &&
      this.#cascades.splits.every((v, i) => v === newConfig.splits[i])
    ) {
      return;
    }

    this.#cascades = newConfig;
    this.markAsDirty();
  }

  /**
   * Copy configuration from another ShadowConfig.
   */
  copy(other: ShadowConfig): this {
    if (this.#enabled !== other.#enabled) {
      this.#enabled = other.#enabled;
      this.markAsDirty();
    }
    if (this.#resolution !== other.#resolution) {
      this.#resolution = other.#resolution;
      this.markAsDirty();
    }
    if (this.#filterMode !== other.#filterMode) {
      this.#filterMode = other.#filterMode;
      this.markAsDirty();
    }
    if (this.#bias !== other.#bias) {
      this.#bias = other.#bias;
      this.markAsDirty();
    }
    if (this.#normalBias !== other.#normalBias) {
      this.#normalBias = other.#normalBias;
      this.markAsDirty();
    }
    if (this.#maxDistance !== other.#maxDistance) {
      this.#maxDistance = other.#maxDistance;
      this.markAsDirty();
    }
    if (this.#fadeDistance !== other.#fadeDistance) {
      this.#fadeDistance = other.#fadeDistance;
      this.markAsDirty();
    }

    this.cascades = other.cascades;

    return this;
  }

  /**
   * Create a deep clone of this configuration.
   */
  clone(): this {
    const clone = new ShadowConfig({
      enabled: this.#enabled,
      resolution: this.#resolution,
      filterMode: this.#filterMode,
      bias: this.#bias,
      normalBias: this.#normalBias,
      maxDistance: this.#maxDistance,
      fadeDistance: this.#fadeDistance,
      cascades: this.#cascades
        ? {
            count: this.#cascades.count,
            splits: [...this.#cascades.splits],
            fadeDistance: this.#cascades.fadeDistance,
          }
        : null,
    });
    return clone as this;
  }
}
