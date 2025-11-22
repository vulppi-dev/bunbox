import { DirtyState } from '@bunbox/utils';

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
  private __enabled: boolean = true;
  private __resolution: number = 1024;
  private __filterMode: ShadowFilterMode = 'pcf';
  private __bias: number = 0.001;
  private __normalBias: number = 0.005;
  private __maxDistance: number = 100;
  private __fadeDistance: number = 10;
  private __cascades: ShadowCascadeConfig | null = null;

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
    config.__enabled = false;
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
    this.__enabled = desc.enabled ?? true;
    this.__resolution = Math.max(256, desc.resolution ?? 1024);
    this.__filterMode = desc.filterMode ?? 'pcf';
    this.__bias = Math.max(0, desc.bias ?? 0.001);
    this.__normalBias = Math.max(0, desc.normalBias ?? 0.005);
    this.__maxDistance = Math.max(1, desc.maxDistance ?? 100);
    this.__fadeDistance = Math.max(0, desc.fadeDistance ?? 10);
    this.__cascades = desc.cascades ?? null;
  }

  /** Whether shadows are enabled */
  get enabled(): boolean {
    return this.__enabled;
  }

  /**
   * Shadow map resolution (width and height in pixels).
   * Common values: 512, 1024, 2048, 4096
   */
  get resolution(): number {
    return this.__resolution;
  }

  /** Shadow filtering technique */
  get filterMode(): ShadowFilterMode {
    return this.__filterMode;
  }

  /**
   * Depth bias to prevent shadow acne (self-shadowing artifacts).
   * Typical range: 0.0001 - 0.01
   */
  get bias(): number {
    return this.__bias;
  }

  /**
   * Normal-based bias for surfaces facing away from light.
   * Typical range: 0.001 - 0.05
   */
  get normalBias(): number {
    return this.__normalBias;
  }

  /**
   * Maximum distance from camera where shadows are rendered.
   * Objects beyond this distance won't cast or receive shadows.
   */
  get maxDistance(): number {
    return this.__maxDistance;
  }

  /**
   * Distance over which shadows fade out near maxDistance.
   * Prevents harsh cutoff at shadow distance limit.
   */
  get fadeDistance(): number {
    return this.__fadeDistance;
  }

  /**
   * Cascade configuration for directional lights.
   * null disables cascades (single shadow map).
   */
  get cascades(): ShadowCascadeConfig | null {
    return this.__cascades
      ? {
          count: this.__cascades.count,
          splits: [...this.__cascades.splits],
          fadeDistance: this.__cascades.fadeDistance,
        }
      : null;
  }

  set enabled(value: boolean) {
    if (this.__enabled === value) return;
    this.__enabled = value;
    this.markAsDirty();
  }

  set resolution(value: number) {
    const res = Math.max(256, value | 0);
    if (this.__resolution === res) return;
    this.__resolution = res;
    this.markAsDirty();
  }

  set filterMode(value: ShadowFilterMode) {
    if (this.__filterMode === value) return;
    this.__filterMode = value;
    this.markAsDirty();
  }

  set bias(value: number) {
    const b = Math.max(0, value);
    if (this.__bias === b) return;
    this.__bias = b;
    this.markAsDirty();
  }

  set normalBias(value: number) {
    const nb = Math.max(0, value);
    if (this.__normalBias === nb) return;
    this.__normalBias = nb;
    this.markAsDirty();
  }

  set maxDistance(value: number) {
    const d = Math.max(1, value);
    if (this.__maxDistance === d) return;
    this.__maxDistance = d;
    this.markAsDirty();
  }

  set fadeDistance(value: number) {
    const fd = Math.max(0, value);
    if (this.__fadeDistance === fd) return;
    this.__fadeDistance = fd;
    this.markAsDirty();
  }

  set cascades(value: ShadowCascadeConfig | null) {
    if (value === null) {
      if (this.__cascades === null) return;
      this.__cascades = null;
      this.markAsDirty();
      return;
    }

    const newConfig = {
      count: Math.max(1, Math.min(4, value.count | 0)),
      splits: value.splits.slice(0, value.count),
      fadeDistance: Math.max(0, value.fadeDistance),
    };

    if (
      this.__cascades &&
      this.__cascades.count === newConfig.count &&
      this.__cascades.fadeDistance === newConfig.fadeDistance &&
      this.__cascades.splits.length === newConfig.splits.length &&
      this.__cascades.splits.every((v, i) => v === newConfig.splits[i])
    ) {
      return;
    }

    this.__cascades = newConfig;
    this.markAsDirty();
  }

  /**
   * Copy configuration from another ShadowConfig.
   */
  copy(other: ShadowConfig): this {
    if (this.__enabled !== other.__enabled) {
      this.__enabled = other.__enabled;
      this.markAsDirty();
    }
    if (this.__resolution !== other.__resolution) {
      this.__resolution = other.__resolution;
      this.markAsDirty();
    }
    if (this.__filterMode !== other.__filterMode) {
      this.__filterMode = other.__filterMode;
      this.markAsDirty();
    }
    if (this.__bias !== other.__bias) {
      this.__bias = other.__bias;
      this.markAsDirty();
    }
    if (this.__normalBias !== other.__normalBias) {
      this.__normalBias = other.__normalBias;
      this.markAsDirty();
    }
    if (this.__maxDistance !== other.__maxDistance) {
      this.__maxDistance = other.__maxDistance;
      this.markAsDirty();
    }
    if (this.__fadeDistance !== other.__fadeDistance) {
      this.__fadeDistance = other.__fadeDistance;
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
      enabled: this.__enabled,
      resolution: this.__resolution,
      filterMode: this.__filterMode,
      bias: this.__bias,
      normalBias: this.__normalBias,
      maxDistance: this.__maxDistance,
      fadeDistance: this.__fadeDistance,
      cascades: this.__cascades
        ? {
            count: this.__cascades.count,
            splits: [...this.__cascades.splits],
            fadeDistance: this.__cascades.fadeDistance,
          }
        : null,
    });
    return clone as this;
  }
}
