import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import type {
  FilterMode,
  MipmapFilter,
  AddressMode,
  CompareFunction,
  BorderColor,
} from './types/aliases';

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
  private static __cache: Map<string, Sampler> = new Map();

  private __label = '';

  private __minFilter: FilterMode = 'linear';
  private __magFilter: FilterMode = 'linear';
  private __mipmapFilter: MipmapFilter = 'linear';

  private __addressModeU: AddressMode = 'repeat';
  private __addressModeV: AddressMode = 'repeat';
  private __addressModeW: AddressMode = 'repeat';

  private __lodMinClamp = 0;
  private __lodMaxClamp = 32;

  private __compare: CompareFunction | null = null;
  private __maxAnisotropy = 1;
  private __normalizedCoordinates = true;
  private __borderColor: BorderColor = 'opaque-black';

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
    return this.__label;
  }
  get minFilter() {
    return this.__minFilter;
  }
  get magFilter() {
    return this.__magFilter;
  }
  get mipmapFilter() {
    return this.__mipmapFilter;
  }
  get addressModeU() {
    return this.__addressModeU;
  }
  get addressModeV() {
    return this.__addressModeV;
  }
  get addressModeW() {
    return this.__addressModeW;
  }
  get lodMinClamp() {
    return this.__lodMinClamp;
  }
  get lodMaxClamp() {
    return this.__lodMaxClamp;
  }
  get compare(): CompareFunction | null {
    return this.__compare;
  }
  get maxAnisotropy() {
    return this.__maxAnisotropy;
  }
  get normalizedCoordinates() {
    return this.__normalizedCoordinates;
  }
  get borderColor() {
    return this.__borderColor;
  }

  /** Stable string key to deduplicate/cachelize samplers. */
  get hash(): string {
    const key = {
      min: this.__minFilter,
      mag: this.__magFilter,
      mip: this.__mipmapFilter,
      wrapU: this.__addressModeU,
      wrapV: this.__addressModeV,
      wrapW: this.__addressModeW,
      lodMin: this.__lodMinClamp,
      lodMax: this.__lodMaxClamp,
      cmp: this.__compare ?? 'none',
      aniso: this.__maxAnisotropy,
      norm: this.__normalizedCoordinates ? 1 : 0,
      border: this.__borderColor,
    };
    return sha(JSON.stringify(key), 'hex');
  }

  set label(v: string) {
    if (this.__label === v) return;
    this.__label = v;
    this.markAsDirty();
  }
  set minFilter(v: FilterMode) {
    if (this.__minFilter === v) return;
    this.__minFilter = v;
    this.markAsDirty();
  }
  set magFilter(v: FilterMode) {
    if (this.__magFilter === v) return;
    this.__magFilter = v;
    this.markAsDirty();
  }
  set mipmapFilter(v: MipmapFilter) {
    if (this.__mipmapFilter === v) return;
    this.__mipmapFilter = v;
    this.markAsDirty();
  }
  set addressModeU(v: AddressMode) {
    if (this.__addressModeU === v) return;
    this.__addressModeU = v;
    this.markAsDirty();
  }
  set addressModeV(v: AddressMode) {
    if (this.__addressModeV === v) return;
    this.__addressModeV = v;
    this.markAsDirty();
  }
  set addressModeW(v: AddressMode) {
    if (this.__addressModeW === v) return;
    this.__addressModeW = v;
    this.markAsDirty();
  }
  set lodMinClamp(v: number) {
    const nv = Math.max(0, v);
    if (this.__lodMinClamp === nv) return;
    this.__lodMinClamp = nv;
    if (this.__lodMaxClamp < this.__lodMinClamp) {
      this.__lodMaxClamp = this.__lodMinClamp;
    }
    this.markAsDirty();
  }
  set lodMaxClamp(v: number) {
    const nv = Math.max(0, v);
    if (this.__lodMaxClamp === nv) return;
    this.__lodMaxClamp = nv;
    if (this.__lodMaxClamp < this.__lodMinClamp) {
      this.__lodMinClamp = this.__lodMaxClamp;
    }
    this.markAsDirty();
  }
  set compare(v: CompareFunction | null) {
    if (this.__compare === v) return;
    this.__compare = v;
    this.markAsDirty();
  }
  set maxAnisotropy(v: number) {
    const nv = Math.min(16, Math.max(1, Math.floor(v)));
    if (this.__maxAnisotropy === nv) return;
    this.__maxAnisotropy = nv;
    this.markAsDirty();
  }
  set normalizedCoordinates(v: boolean) {
    if (this.__normalizedCoordinates === v) return;
    this.__normalizedCoordinates = v;
    this.markAsDirty();
  }
  set borderColor(v: BorderColor) {
    if (this.__borderColor === v) return;
    this.__borderColor = v;
    this.markAsDirty();
  }

  equals(other: Sampler): boolean {
    return (
      this.__minFilter === other.__minFilter &&
      this.__magFilter === other.__magFilter &&
      this.__mipmapFilter === other.__mipmapFilter &&
      this.__addressModeU === other.__addressModeU &&
      this.__addressModeV === other.__addressModeV &&
      this.__addressModeW === other.__addressModeW &&
      this.__lodMinClamp === other.__lodMinClamp &&
      this.__lodMaxClamp === other.__lodMaxClamp &&
      this.__compare === other.__compare &&
      this.__maxAnisotropy === other.__maxAnisotropy &&
      this.__normalizedCoordinates === other.__normalizedCoordinates &&
      this.__borderColor === other.__borderColor
    );
  }

  clone(): Sampler {
    return new Sampler({
      label: this.__label,
      minFilter: this.__minFilter,
      magFilter: this.__magFilter,
      mipmapFilter: this.__mipmapFilter,
      addressModeU: this.__addressModeU,
      addressModeV: this.__addressModeV,
      addressModeW: this.__addressModeW,
      lodMinClamp: this.__lodMinClamp,
      lodMaxClamp: this.__lodMaxClamp,
      compare: this.__compare,
      maxAnisotropy: this.__maxAnisotropy,
      normalizedCoordinates: this.__normalizedCoordinates,
      borderColor: this.__borderColor,
    });
  }

  /** Fast copy from another sampler (single dirty mark). */
  copy(other: Sampler): this {
    if (this.equals(other) && this.__label === other.__label) return this;
    this.__label = other.__label;
    this.__minFilter = other.__minFilter;
    this.__magFilter = other.__magFilter;
    this.__mipmapFilter = other.__mipmapFilter;
    this.__addressModeU = other.__addressModeU;
    this.__addressModeV = other.__addressModeV;
    this.__addressModeW = other.__addressModeW;
    this.__lodMinClamp = other.__lodMinClamp;
    this.__lodMaxClamp = other.__lodMaxClamp;
    this.__compare = other.__compare;
    this.__maxAnisotropy = other.__maxAnisotropy;
    this.__normalizedCoordinates = other.__normalizedCoordinates;
    this.__borderColor = other.__borderColor;
    return this.markAsDirty();
  }
}
