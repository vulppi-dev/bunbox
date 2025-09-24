import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

/** Texture min/mag filter. */
export type FilterMode = 'nearest' | 'linear';

/** Mipmap level filter. */
export type MipmapFilter = 'nearest' | 'linear';

/** Addressing (wrap) mode per axis. */
export type AddressMode =
  | 'repeat'
  | 'mirror-repeat'
  | 'clamp-to-edge'
  | 'clamp-to-border';

/** Optional depth-compare function (null means no comparison). */
export type CompareFunction =
  | 'never'
  | 'less'
  | 'less-equal'
  | 'greater'
  | 'greater-equal'
  | 'equal'
  | 'not-equal'
  | 'always'
  | null;

/** Border color used when addressMode is clamp-to-border. */
export type BorderColor = 'transparent-black' | 'opaque-black' | 'opaque-white';

export type SamplerDescriptor = {
  label?: string;
  /** @default 'linear' */
  minFilter?: FilterMode;
  /** @default 'linear' */
  magFilter?: FilterMode;
  /** @default 'linear' */
  mipmapFilter?: MipmapFilter;

  /** @default 'repeat' */
  addressModeU?: AddressMode;
  /** @default 'repeat' */
  addressModeV?: AddressMode;
  /** @default 'repeat' */
  addressModeW?: AddressMode;

  /** @default 0 */
  lodMinClamp?: number;
  /** @default 32 */
  lodMaxClamp?: number;

  /** Depth comparison; null disables compare. @default null */
  compare?: CompareFunction;

  /** 1..16 typical. @default 1 */
  maxAnisotropy?: number;

  /** Whether UVs are normalized (0..1). @default true */
  normalizedCoordinates?: boolean;

  /** Used only with clamp-to-border. @default 'opaque-black' */
  borderColor?: BorderColor;
};

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

  #compare: CompareFunction = null;
  #maxAnisotropy = 1;
  #normalizedCoordinates = true;
  #borderColor: BorderColor = 'opaque-black';

  // ----------- Presets for plug & play -----------
  /** Linear filtering with mipmaps, repeat wrap on all axes (common default). */
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

  /** Nearest filtering, repeat wrap on all axes (pixel-art). */
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

  /** Linear filtering with mipmaps, clamp to edge on all axes (UI/atlas borders). */
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

  /** Trilinear repeat with mild anisotropy (terrain/surfaces). */
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

  /** Depth compare sampler for shadow mapping. */
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
  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }

  get minFilter() {
    return this.#minFilter;
  }
  set minFilter(v: FilterMode) {
    if (this.#minFilter === v) return;
    this.#minFilter = v;
    this.markAsDirty();
  }

  get magFilter() {
    return this.#magFilter;
  }
  set magFilter(v: FilterMode) {
    if (this.#magFilter === v) return;
    this.#magFilter = v;
    this.markAsDirty();
  }

  get mipmapFilter() {
    return this.#mipmapFilter;
  }
  set mipmapFilter(v: MipmapFilter) {
    if (this.#mipmapFilter === v) return;
    this.#mipmapFilter = v;
    this.markAsDirty();
  }

  get addressModeU() {
    return this.#addressModeU;
  }
  set addressModeU(v: AddressMode) {
    if (this.#addressModeU === v) return;
    this.#addressModeU = v;
    this.markAsDirty();
  }

  get addressModeV() {
    return this.#addressModeV;
  }
  set addressModeV(v: AddressMode) {
    if (this.#addressModeV === v) return;
    this.#addressModeV = v;
    this.markAsDirty();
  }

  get addressModeW() {
    return this.#addressModeW;
  }
  set addressModeW(v: AddressMode) {
    if (this.#addressModeW === v) return;
    this.#addressModeW = v;
    this.markAsDirty();
  }

  get lodMinClamp() {
    return this.#lodMinClamp;
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

  get lodMaxClamp() {
    return this.#lodMaxClamp;
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

  get compare() {
    return this.#compare;
  }
  set compare(v: CompareFunction) {
    if (this.#compare === v) return;
    this.#compare = v;
    this.markAsDirty();
  }

  get maxAnisotropy() {
    return this.#maxAnisotropy;
  }
  set maxAnisotropy(v: number) {
    const nv = Math.min(16, Math.max(1, Math.floor(v)));
    if (this.#maxAnisotropy === nv) return;
    this.#maxAnisotropy = nv;
    this.markAsDirty();
  }

  get normalizedCoordinates() {
    return this.#normalizedCoordinates;
  }
  set normalizedCoordinates(v: boolean) {
    if (this.#normalizedCoordinates === v) return;
    this.#normalizedCoordinates = v;
    this.markAsDirty();
  }

  get borderColor() {
    return this.#borderColor;
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
