import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';

export type TextureDimension = '2d' | '3d' | 'cube';

export type TextureFormat =
  | 'rgba8unorm'
  | 'bgra8unorm'
  | 'rgba16float'
  | 'r16float'
  | 'r8unorm'
  | 'rgba8uint'
  | 'rgba8snorm'
  | 'depth24plus'
  | 'depth24plus-stencil8'
  | 'depth32float'
  | (string & {});

export type SampleCount = (typeof SAMPLE_COUNTS)[number];

export type TextureDescriptor = {
  label?: string;
  width: number;
  height: number;
  depthOrLayers?: number;
  /** @default '2d' */
  dimension?: TextureDimension;
  /** @default 'rgba8unorm' */
  format?: TextureFormat;
  /** @default 1 */
  mipLevels?: number;
  /** @default 1 */
  sampleCount?: SampleCount;
  /**
   * Bitmask defining allowed usages of the texture.
   * @default TextureUsage.SAMPLED | TextureUsage.COPY_DST
   */
  usage?: number;
  /** Optional raw pixel buffer (typically RGBA8). Length should be width*height*depthOrLayers*bytesPerPixel. */
  data?: Uint8Array;
};

const SAMPLE_COUNTS = [1, 2, 4, 8, 16] as const;

export enum TextureUsage {
  SAMPLED = 1 << 0,
  STORAGE = 1 << 1,
  RENDER_TARGET = 1 << 2,
  DEPTH_STENCIL = 1 << 3,
  COPY_SRC = 1 << 4,
  COPY_DST = 1 << 5,
  GENERATE_MIPS = 1 << 6,
}

export class Texture extends DirtyState {
  #label: string = '';
  #width: number = 1;
  #height: number = 1;
  #depthOrLayers: number = 1;
  #dimension: TextureDimension = '2d';
  #format: TextureFormat = 'rgba8unorm';
  #mipLevels: number = 1;
  #sampleCount: SampleCount = 1;
  #usage: number = TextureUsage.SAMPLED | TextureUsage.COPY_DST;
  #data?: Uint8Array;

  static computeMaxMipLevels(w: number, h: number, d: number = 1): number {
    const maxDim = Math.max(1, w | 0, h | 0, d | 0);
    return Math.floor(Math.log2(maxDim)) + 1;
  }

  constructor(desc: TextureDescriptor) {
    super();
    this.label = desc.label ?? '';
    this.dimension = desc.dimension ?? '2d';
    this.width = desc.width;
    this.height = desc.height;
    this.depthOrLayers = this.#normalizeDepthOrLayers(desc.depthOrLayers ?? 1);
    this.format = desc.format ?? 'rgba8unorm';
    this.mipLevels = Math.max(1, desc.mipLevels ?? 1);
    this.sampleCount = desc.sampleCount ?? 1;
    this.usage = desc.usage ?? TextureUsage.SAMPLED | TextureUsage.COPY_DST;
    if (desc.data) this.data = desc.data;
  }

  get label() {
    return this.#label;
  }
  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }

  get width() {
    return this.#width;
  }
  set width(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#width === nv) return;
    this.#width = nv;
    // Clamp mip levels to new size constraints
    this.#mipLevels = Math.min(
      this.#mipLevels,
      Texture.computeMaxMipLevels(
        this.#width,
        this.#height,
        this.#dimension === '3d' ? this.#depthOrLayers : 1,
      ),
    );
    this.markAsDirty();
  }

  get height() {
    return this.#height;
  }
  set height(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#height === nv) return;
    this.#height = nv;
    this.#mipLevels = Math.min(
      this.#mipLevels,
      Texture.computeMaxMipLevels(
        this.#width,
        this.#height,
        this.#dimension === '3d' ? this.#depthOrLayers : 1,
      ),
    );
    this.markAsDirty();
  }

  get depthOrLayers() {
    return this.#depthOrLayers;
  }
  set depthOrLayers(v: number) {
    const nv = this.#normalizeDepthOrLayers(v);
    if (this.#depthOrLayers === nv) return;
    this.#depthOrLayers = nv;
    if (this.#dimension === '3d') {
      this.#mipLevels = Math.min(
        this.#mipLevels,
        Texture.computeMaxMipLevels(
          this.#width,
          this.#height,
          this.#depthOrLayers,
        ),
      );
    }
    this.markAsDirty();
  }

  get dimension() {
    return this.#dimension;
  }
  set dimension(v: TextureDimension) {
    if (this.#dimension === v) return;
    this.#dimension = v;
    this.#depthOrLayers = this.#normalizeDepthOrLayers(this.#depthOrLayers);
    // After changing dimension, clamp mip levels according to 3D rule
    this.#mipLevels = Math.min(
      this.#mipLevels,
      Texture.computeMaxMipLevels(
        this.#width,
        this.#height,
        this.#dimension === '3d' ? this.#depthOrLayers : 1,
      ),
    );
    this.markAsDirty();
  }

  get format() {
    return this.#format;
  }
  set format(v: TextureFormat) {
    if (this.#format === v) return;
    this.#format = v;
    this.markAsDirty();
  }

  get mipLevels() {
    return this.#mipLevels;
  }
  set mipLevels(v: number) {
    const nv = Math.max(1, v | 0);
    const maxAllowed = Texture.computeMaxMipLevels(
      this.#width,
      this.#height,
      this.#dimension === '3d' ? this.#depthOrLayers : 1,
    );
    const clamped = Math.min(nv, maxAllowed);
    if (this.#mipLevels === clamped) return;
    this.#mipLevels = clamped;
    this.markAsDirty();
  }

  get sampleCount() {
    return this.#sampleCount;
  }
  set sampleCount(v: SampleCount) {
    const nv = (SAMPLE_COUNTS.includes(v) ? v : 1) as SampleCount;
    if (this.#sampleCount === nv) return;
    this.#sampleCount = nv;
    this.markAsDirty();
  }

  get usage() {
    return this.#usage;
  }
  set usage(v: number) {
    const nv = v >>> 0;
    if (this.#usage === nv) return;
    this.#usage = nv;
    this.markAsDirty();
  }

  /** Optional raw pixel buffer (usually RGBA8). Not part of the structural hash. */
  get data(): Uint8Array | undefined {
    return this.#data;
  }
  set data(v: Uint8Array | undefined) {
    if (this.#data === v) return;
    this.#data = v;
    this.markAsDirty();
  }

  get hash(): string {
    const key = {
      dimension: this.#dimension,
      width: this.#width,
      height: this.#height,
      depthOrLayers: this.#depthOrLayers,
      format: this.#format,
      mipLevels: this.#mipLevels,
      sampleCount: this.#sampleCount,
      usage: this.#usage,
    };
    return sha(JSON.stringify(key), 'hex');
  }

  setSize(
    width: number,
    height: number,
    depthOrLayers = this.#depthOrLayers,
  ): this {
    this.width = width;
    this.height = height;
    this.depthOrLayers = depthOrLayers;
    // Clamp mip levels to maximum allowed by the new size
    this.mipLevels = Math.min(
      this.#mipLevels,
      Texture.computeMaxMipLevels(
        this.#width,
        this.#height,
        this.#dimension === '3d' ? this.#depthOrLayers : 1,
      ),
    );
    return this;
  }

  addUsage(flags: TextureUsage): this {
    const next = this.#usage | flags;
    if (next !== this.#usage) {
      this.#usage = next >>> 0;
      this.markAsDirty();
    }
    return this;
  }

  removeUsage(flags: TextureUsage): this {
    const next = this.#usage & ~flags;
    if (next !== this.#usage) {
      this.#usage = next >>> 0;
      this.markAsDirty();
    }
    return this;
  }

  hasUsage(flags: number): boolean {
    return (this.#usage & flags) === flags;
  }

  get isDepthFormat(): boolean {
    return this.#format.startsWith('depth');
  }

  get isCube(): boolean {
    return this.#dimension === 'cube';
  }

  generateFullMipChain(): this {
    this.mipLevels = Texture.computeMaxMipLevels(
      this.#width,
      this.#height,
      this.#dimension === '3d' ? this.#depthOrLayers : 1,
    );
    return this;
  }

  mipSize(level: number): {
    width: number;
    height: number;
    depthOrLayers: number;
  } {
    return {
      width: Math.max(1, this.#width >> level),
      height: Math.max(1, this.#height >> level),
      depthOrLayers:
        this.#dimension === '3d'
          ? Math.max(1, this.#depthOrLayers >> level)
          : this.#depthOrLayers,
    };
  }

  /**
   * Approximate bytes-per-pixel for common formats.
   * This is backend-agnostic and only for estimation/cost heuristics.
   */
  bytesPerPixel(): number {
    switch (this.#format) {
      case 'r8unorm':
        return 1;
      case 'rgba8unorm':
      case 'rgba8unorm-srgb':
      case 'bgra8unorm':
        return 4;
      case 'r16float':
        return 2;
      case 'rgba16float':
        return 8;
      case 'rgba32float':
        return 16;
      case 'depth24plus':
      case 'depth24plus-stencil8':
      case 'depth32float':
        return 4; // heuristic for planning
      default:
        return 4; // safe fallback
    }
  }

  /**
   * Heuristic byte size for all mip levels (and MSAA if used as render target).
   * Intended for budgeting and streaming heuristics only.
   */
  approximateByteSize(): number {
    const bpp = this.bytesPerPixel();
    let total = 0;
    for (let i = 0; i < this.#mipLevels; i++) {
      const sz = this.mipSize(i);
      total += sz.width * sz.height * sz.depthOrLayers * bpp;
    }
    if (this.#sampleCount > 1 && this.hasUsage(TextureUsage.RENDER_TARGET)) {
      total *= this.#sampleCount;
    }
    return total >>> 0;
  }

  clone(): Texture {
    return new Texture({
      label: this.#label,
      width: this.#width,
      height: this.#height,
      depthOrLayers: this.#depthOrLayers,
      dimension: this.#dimension,
      format: this.#format,
      mipLevels: this.#mipLevels,
      sampleCount: this.#sampleCount,
      usage: this.#usage,
      data: this.#data ? new Uint8Array(this.#data) : undefined,
    });
  }

  equals(other: Texture): boolean {
    return (
      this.#dimension === other.#dimension &&
      this.#width === other.#width &&
      this.#height === other.#height &&
      this.#depthOrLayers === other.#depthOrLayers &&
      this.#format === other.#format &&
      this.#mipLevels === other.#mipLevels &&
      this.#sampleCount === other.#sampleCount &&
      this.#usage === other.#usage
    );
  }

  copy(other: Texture): this {
    if (this.equals(other) && this.#label === other.#label) return this;
    this.#label = other.#label;
    this.#dimension = other.#dimension;
    this.#width = other.#width;
    this.#height = other.#height;
    this.#depthOrLayers = this.#normalizeDepthOrLayers(other.#depthOrLayers);
    this.#format = other.#format;
    this.#mipLevels = Math.min(
      other.#mipLevels,
      Texture.computeMaxMipLevels(
        this.#width,
        this.#height,
        this.#dimension === '3d' ? this.#depthOrLayers : 1,
      ),
    );
    this.#sampleCount = other.#sampleCount;
    this.#usage = other.#usage >>> 0;
    this.#data = other.#data ? new Uint8Array(other.#data) : undefined;
    return this.markAsDirty();
  }

  #normalizeDepthOrLayers(v: number): number {
    const n = Math.max(1, v | 0);
    if (this.#dimension === 'cube') {
      return Math.max(6, Math.ceil(n / 6) * 6);
    }
    return n;
  }

  // Convenience helpers
  /** Layer count for 2D/cube, or 1 for 3D. */
  get layerCount(): number {
    return this.#dimension === '3d' ? 1 : this.#depthOrLayers;
  }

  /** Depth for 3D textures, else 1. */
  get depth(): number {
    return this.#dimension === '3d' ? this.#depthOrLayers : 1;
  }

  /** Convenience: expected base-level byte length for current settings. */
  get expectedBaseLevelByteLength(): number {
    const bpp = this.bytesPerPixel();
    return (
      (this.#width *
        this.#height *
        (this.#dimension === '3d' ? this.depth : this.layerCount) *
        bpp) >>>
      0
    );
  }
}
