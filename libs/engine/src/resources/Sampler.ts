import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import type {
  FilterMode,
  MipmapFilter,
  AddressMode,
  CompareFunction,
  BorderColor,
} from './types';

/**
 * Configuration descriptor for texture sampling behavior.
 *
 * Defines how textures are filtered, wrapped, and sampled by the GPU.
 */
export type SamplerDescriptor = {
  /** Optional label for debugging */
  label?: string;

  /**
   * Minification filter (when texture is smaller on screen than source).
   * @default 'linear'
   */
  minFilter?: FilterMode;

  /**
   * Magnification filter (when texture is larger on screen than source).
   * @default 'linear'
   */
  magFilter?: FilterMode;

  /**
   * Mipmap filtering mode (interpolation between mip levels).
   * @default 'linear'
   */
  mipmapFilter?: MipmapFilter;

  /**
   * Texture wrapping mode for U (horizontal) coordinate.
   * @default 'repeat'
   */
  addressModeU?: AddressMode;

  /**
   * Texture wrapping mode for V (vertical) coordinate.
   * @default 'repeat'
   */
  addressModeV?: AddressMode;

  /**
   * Texture wrapping mode for W (depth) coordinate.
   * @default 'repeat'
   */
  addressModeW?: AddressMode;

  /**
   * Minimum LOD (level of detail) clamp.
   * @default 0
   */
  lodMinClamp?: number;

  /**
   * Maximum LOD (level of detail) clamp.
   * @default 32
   */
  lodMaxClamp?: number;

  /**
   * Depth comparison function for shadow mapping.
   * Set to null to disable depth comparison.
   * @default null
   */
  compare?: CompareFunction | null;

  /**
   * Maximum anisotropic filtering level (1-16 typical).
   * Higher values improve quality at oblique angles but cost performance.
   * @default 1
   */
  maxAnisotropy?: number;

  /**
   * Whether UV coordinates are normalized to [0, 1] range.
   * @default true
   */
  normalizedCoordinates?: boolean;

  /**
   * Border color for 'clamp-to-border' address mode.
   * @default 'opaque-black'
   */
  borderColor?: BorderColor;
};

/**
 * Texture sampler defining filtering and wrapping behavior.
 *
 * Samplers control how the GPU reads texture data:
 * - **Filtering**: How pixels are interpolated (nearest, linear, anisotropic)
 * - **Address Modes**: How out-of-range UV coordinates are handled (repeat, clamp, mirror)
 * - **Mipmapping**: LOD (level of detail) selection for distance-based quality
 * - **Comparison**: Depth comparison for shadow mapping
 *
 * **Global Caching:**
 * Equivalent samplers are automatically deduplicated to reduce GPU resource usage.
 * Cache key is based on all parameters except label.
 *
 * **Common Presets:**
 * - {@link linearRepeat}: Standard filtering with tiling (default for most textures)
 * - {@link linearClamp}: Standard filtering without tiling (UI, skyboxes)
 * - {@link nearestRepeat}: Pixel-perfect rendering with tiling (pixel art, voxels)
 * - {@link nearestClamp}: Pixel-perfect rendering without tiling
 * - {@link anisotropic}: High-quality filtering for oblique viewing angles
 *
 * @extends {DirtyState}
 *
 * @example
 * ```ts
 * // Use a preset
 * const sampler = Sampler.linearRepeat();
 *
 * // Custom configuration
 * const customSampler = new Sampler({
 *   minFilter: 'linear',
 *   magFilter: 'linear',
 *   addressModeU: 'clamp-to-edge',
 *   addressModeV: 'clamp-to-edge',
 *   maxAnisotropy: 16
 * });
 *
 * // Shadow map sampler
 * const shadowSampler = new Sampler({
 *   minFilter: 'linear',
 *   magFilter: 'linear',
 *   addressModeU: 'clamp-to-edge',
 *   addressModeV: 'clamp-to-edge',
 *   compare: 'less'  // Enable depth comparison
 * });
 * ```
 */
export class Sampler extends DirtyState {
  // Global cache to deduplicate equivalent samplers (label is not part of the key)
  static #cache: Map<string, Sampler> = new Map();

  #label = '';

  #minFilter: FilterMode = 'linear';
  #magFilter: FilterMode = 'linear';
  #mipmapFilter: MipmapFilter = 'linear';

  #addressModeU: AddressMode = 'repeat';
  #addressModeV: AddressMode = 'repeat';
  #addressModeW: AddressMode = 'repeat';

  #lodMinClamp = 0;
  #lodMaxClamp = 32;

  #compare: CompareFunction | null = null;
  #maxAnisotropy = 1;
  #normalizedCoordinates = true;
  #borderColor: BorderColor = 'opaque-black';

  // ----------- Presets for plug & play -----------

  /**
   * Linear filtering with mipmaps and repeat wrapping (common default).
   *
   * Best for: Most standard textures (diffuse, normal maps, etc.)
   *
   * @param extra - Optional overrides for specific parameters
   * @returns Cached sampler instance
   */
  static linearRepeat(extra: SamplerDescriptor = {}): Sampler {
    return new Sampler({
      minFilter: 'linear',
      magFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'repeat',
      addressModeV: 'repeat',
      addressModeW: 'repeat',
      ...extra,
    });
  }

  /**
   * Nearest filtering with repeat wrapping (pixel-perfect rendering).
   *
   * Best for: Pixel art, voxel textures, retro-style games
   *
   * @param extra - Optional overrides for specific parameters
   * @returns Cached sampler instance
   */
  static nearestRepeat(extra: SamplerDescriptor = {}): Sampler {
    return new Sampler({
      minFilter: 'nearest',
      magFilter: 'nearest',
      mipmapFilter: 'nearest',
      addressModeU: 'repeat',
      addressModeV: 'repeat',
      addressModeW: 'repeat',
      ...extra,
    });
  }

  /**
   * Linear filtering with clamp-to-edge wrapping (UI and atlases).
   *
   * Prevents texture bleeding at edges, essential for sprite atlases and UI elements.
   *
   * Best for: UI textures, sprite sheets, skyboxes
   *
   * @param extra - Optional overrides for specific parameters
   * @returns Cached sampler instance
   */
  static linearClamp(extra: SamplerDescriptor = {}): Sampler {
    return new Sampler({
      minFilter: 'linear',
      magFilter: 'linear',
      mipmapFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      addressModeW: 'clamp-to-edge',
      ...extra,
    });
  }

  /**
   * Trilinear filtering with anisotropy (high-quality surfaces).
   *
   * Improves quality for surfaces viewed at oblique angles like terrain.
   *
   * Best for: Terrain, floors, walls viewed at angles
   *
   * @param extra - Optional overrides for specific parameters
   * @returns Cached sampler instance
   */
  static trilinearRepeat(extra: SamplerDescriptor = {}): Sampler {
    return new Sampler({
      minFilter: 'linear',
      magFilter: 'linear',
      mipmapFilter: 'linear',
      maxAnisotropy: Math.max(2, extra.maxAnisotropy ?? 2),
      addressModeU: 'repeat',
      addressModeV: 'repeat',
      addressModeW: 'repeat',
      ...extra,
    });
  }

  /**
   * Depth comparison sampler for shadow mapping.
   *
   * Enables PCF (Percentage Closer Filtering) for smooth shadow edges.
   *
   * Best for: Shadow maps, depth-based effects
   *
   * @param extra - Optional overrides for specific parameters
   * @returns Cached sampler instance
   */
  static shadowClamp(extra: SamplerDescriptor = {}): Sampler {
    return new Sampler({
      minFilter: 'linear',
      magFilter: 'linear',
      mipmapFilter: 'linear',
      compare: extra.compare ?? 'less-equal',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge',
      addressModeW: 'clamp-to-edge',
      normalizedCoordinates: extra.normalizedCoordinates ?? true,
      ...extra,
    });
  }

  constructor(desc: SamplerDescriptor = {}) {
    super();
    this.label = desc.label ?? '';

    this.minFilter = desc.minFilter ?? 'linear';
    this.magFilter = desc.magFilter ?? 'linear';
    this.mipmapFilter = desc.mipmapFilter ?? 'linear';

    this.addressModeU = desc.addressModeU ?? 'repeat';
    this.addressModeV = desc.addressModeV ?? 'repeat';
    this.addressModeW = desc.addressModeW ?? 'repeat';

    this.lodMinClamp = desc.lodMinClamp ?? 0;
    this.lodMaxClamp = desc.lodMaxClamp ?? 32;

    this.compare = desc.compare ?? null;
    this.maxAnisotropy = desc.maxAnisotropy ?? 1;
    this.normalizedCoordinates = desc.normalizedCoordinates ?? true;
    this.borderColor = desc.borderColor ?? 'opaque-black';
  }

  get label() {
    return this.#label;
  }
  get minFilter() {
    return this.#minFilter;
  }
  get magFilter() {
    return this.#magFilter;
  }
  get mipmapFilter() {
    return this.#mipmapFilter;
  }
  get addressModeU() {
    return this.#addressModeU;
  }
  get addressModeV() {
    return this.#addressModeV;
  }
  get addressModeW() {
    return this.#addressModeW;
  }
  get lodMinClamp() {
    return this.#lodMinClamp;
  }
  get lodMaxClamp() {
    return this.#lodMaxClamp;
  }
  get compare(): CompareFunction | null {
    return this.#compare;
  }
  get maxAnisotropy() {
    return this.#maxAnisotropy;
  }
  get normalizedCoordinates() {
    return this.#normalizedCoordinates;
  }
  get borderColor() {
    return this.#borderColor;
  }

  /** Stable string key to deduplicate/cachelize samplers. */
  get hash(): string {
    const key = {
      min: this.#minFilter,
      mag: this.#magFilter,
      mip: this.#mipmapFilter,
      wrapU: this.#addressModeU,
      wrapV: this.#addressModeV,
      wrapW: this.#addressModeW,
      lodMin: this.#lodMinClamp,
      lodMax: this.#lodMaxClamp,
      cmp: this.#compare ?? 'none',
      aniso: this.#maxAnisotropy,
      norm: this.#normalizedCoordinates ? 1 : 0,
      border: this.#borderColor,
    };
    return sha(JSON.stringify(key), 'hex');
  }

  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }
  set minFilter(v: FilterMode) {
    if (this.#minFilter === v) return;
    this.#minFilter = v;
    this.markAsDirty();
  }
  set magFilter(v: FilterMode) {
    if (this.#magFilter === v) return;
    this.#magFilter = v;
    this.markAsDirty();
  }
  set mipmapFilter(v: MipmapFilter) {
    if (this.#mipmapFilter === v) return;
    this.#mipmapFilter = v;
    this.markAsDirty();
  }
  set addressModeU(v: AddressMode) {
    if (this.#addressModeU === v) return;
    this.#addressModeU = v;
    this.markAsDirty();
  }
  set addressModeV(v: AddressMode) {
    if (this.#addressModeV === v) return;
    this.#addressModeV = v;
    this.markAsDirty();
  }
  set addressModeW(v: AddressMode) {
    if (this.#addressModeW === v) return;
    this.#addressModeW = v;
    this.markAsDirty();
  }
  set lodMinClamp(v: number) {
    const nv = Math.max(0, v);
    if (this.#lodMinClamp === nv) return;
    this.#lodMinClamp = nv;
    if (this.#lodMaxClamp < this.#lodMinClamp) {
      this.#lodMaxClamp = this.#lodMinClamp;
    }
    this.markAsDirty();
  }
  set lodMaxClamp(v: number) {
    const nv = Math.max(0, v);
    if (this.#lodMaxClamp === nv) return;
    this.#lodMaxClamp = nv;
    if (this.#lodMaxClamp < this.#lodMinClamp) {
      this.#lodMinClamp = this.#lodMaxClamp;
    }
    this.markAsDirty();
  }
  set compare(v: CompareFunction | null) {
    if (this.#compare === v) return;
    this.#compare = v;
    this.markAsDirty();
  }
  set maxAnisotropy(v: number) {
    const nv = Math.min(16, Math.max(1, Math.floor(v)));
    if (this.#maxAnisotropy === nv) return;
    this.#maxAnisotropy = nv;
    this.markAsDirty();
  }
  set normalizedCoordinates(v: boolean) {
    if (this.#normalizedCoordinates === v) return;
    this.#normalizedCoordinates = v;
    this.markAsDirty();
  }
  set borderColor(v: BorderColor) {
    if (this.#borderColor === v) return;
    this.#borderColor = v;
    this.markAsDirty();
  }

  equals(other: Sampler): boolean {
    return (
      this.#minFilter === other.#minFilter &&
      this.#magFilter === other.#magFilter &&
      this.#mipmapFilter === other.#mipmapFilter &&
      this.#addressModeU === other.#addressModeU &&
      this.#addressModeV === other.#addressModeV &&
      this.#addressModeW === other.#addressModeW &&
      this.#lodMinClamp === other.#lodMinClamp &&
      this.#lodMaxClamp === other.#lodMaxClamp &&
      this.#compare === other.#compare &&
      this.#maxAnisotropy === other.#maxAnisotropy &&
      this.#normalizedCoordinates === other.#normalizedCoordinates &&
      this.#borderColor === other.#borderColor
    );
  }

  clone(): Sampler {
    return new Sampler({
      label: this.#label,
      minFilter: this.#minFilter,
      magFilter: this.#magFilter,
      mipmapFilter: this.#mipmapFilter,
      addressModeU: this.#addressModeU,
      addressModeV: this.#addressModeV,
      addressModeW: this.#addressModeW,
      lodMinClamp: this.#lodMinClamp,
      lodMaxClamp: this.#lodMaxClamp,
      compare: this.#compare,
      maxAnisotropy: this.#maxAnisotropy,
      normalizedCoordinates: this.#normalizedCoordinates,
      borderColor: this.#borderColor,
    });
  }

  /** Fast copy from another sampler (single dirty mark). */
  copy(other: Sampler): this {
    if (this.equals(other) && this.#label === other.#label) return this;
    this.#label = other.#label;
    this.#minFilter = other.#minFilter;
    this.#magFilter = other.#magFilter;
    this.#mipmapFilter = other.#mipmapFilter;
    this.#addressModeU = other.#addressModeU;
    this.#addressModeV = other.#addressModeV;
    this.#addressModeW = other.#addressModeW;
    this.#lodMinClamp = other.#lodMinClamp;
    this.#lodMaxClamp = other.#lodMaxClamp;
    this.#compare = other.#compare;
    this.#maxAnisotropy = other.#maxAnisotropy;
    this.#normalizedCoordinates = other.#normalizedCoordinates;
    this.#borderColor = other.#borderColor;
    return this.markAsDirty();
  }
}
