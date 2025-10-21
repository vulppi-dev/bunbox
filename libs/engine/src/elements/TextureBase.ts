import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { ulid } from 'ulid';

export type TextureFormat =
  // Color Formats - 8-bit normalized
  | 'rgba8unorm' // Standard 8-bit RGBA (most common)
  | 'rgba8unorm-srgb' // SRGB color space (for diffuse/albedo textures)
  | 'bgra8unorm' // Platform-specific (Windows/Metal prefer BGRA)
  | 'bgra8unorm-srgb' // SRGB BGRA variant
  | 'rgba8snorm' // Signed normalized (for normal maps)

  // Color Formats - 16-bit float (HDR)
  | 'rgba16float' // HDR color, good balance
  | 'r16float' // Single channel HDR (shadows, height maps)
  | 'rg16float' // Two channel HDR (normal maps, flow maps)

  // Color Formats - 32-bit float (high precision)
  | 'rgba32float' // Maximum precision, compute buffers
  | 'r32float' // Single channel high precision

  // Color Formats - packed/compressed
  | 'rgb10a2unorm' // 10-bit color, 2-bit alpha (HDR displays)
  | 'rg11b10float' // Packed HDR without alpha

  // Single/Dual Channel
  | 'r8unorm' // Grayscale, masks
  | 'rg8unorm' // Dual channel (2D vectors, flow)

  // Compressed Formats - BC (DirectX/Vulkan)
  | 'bc1-rgba-unorm' // DXT1 - Color, 1-bit alpha (6:1 compression)
  | 'bc1-rgba-unorm-srgb' // DXT1 SRGB
  | 'bc3-rgba-unorm' // DXT5 - Color + alpha (4:1 compression)
  | 'bc3-rgba-unorm-srgb' // DXT5 SRGB
  | 'bc4-r-unorm' // Single channel (height, roughness)
  | 'bc5-rg-unorm' // Two channel (normal maps)
  | 'bc7-rgba-unorm' // High quality RGB/RGBA (4:1)
  | 'bc7-rgba-unorm-srgb' // BC7 SRGB
  | 'bc6h-rgb-ufloat' // HDR compressed

  // Compressed Formats - ASTC (Mobile/Vulkan)
  | 'astc-4x4-unorm' // High quality (8:1)
  | 'astc-4x4-unorm-srgb' // ASTC SRGB
  | 'astc-6x6-unorm' // Medium quality (11.1:1)
  | 'astc-8x8-unorm' // Lower quality (16:1)

  // Depth/Stencil Formats
  | 'depth16unorm' // Basic depth (mobile friendly)
  | 'depth24plus' // 24-bit depth (standard)
  | 'depth32float' // High precision depth (shadows)
  | 'depth24plus-stencil8' // Depth + stencil
  | 'depth32float-stencil8'; // High precision depth + stencil

export type SampleCount = 1 | 2 | 4 | 8;

// Stringly-typed usage for clarity across APIs
export type TextureUsage =
  | 'sampler'
  | 'color-target'
  | 'depth-stencil-target'
  | 'graphics-storage-read'
  | 'compute-storage-read'
  | 'compute-storage-write'
  | 'compute-storage-rw';

export interface TextureBaseDescriptor {
  label?: string;
  width: number;
  height: number;
  /** @default 1 */
  mipLevels?: number;
  /** @default 1 */
  sampleCount?: SampleCount;
  /** @default rgba8unorm */
  format?: TextureFormat;
  /**
   * Bitmask defining allowed usages of the texture.
   * Represented as string usages for clarity.
   * @default ['sampler', 'color-target']
   */
  usage?: TextureUsage[];
}

export abstract class TextureBase extends DirtyState {
  static computeMaxMipLevels(w: number, h: number, d: number = 1): number {
    const maxDim = Math.max(1, w | 0, h | 0, d | 0);
    return Math.floor(Math.log2(maxDim)) + 1;
  }

  #label: string = '';
  #id: string = '';
  #width: number = 1;
  #height: number = 1;
  #mipLevels: number = 1;
  #sampleCount: SampleCount = 1;
  #format: TextureFormat = 'rgba8unorm';
  #usage: TextureUsage[] = ['sampler', 'color-target'];

  protected constructor(desc: TextureBaseDescriptor) {
    super();
    this.#id = ulid();
    this.#label = desc.label ?? '';
    this.#width = Math.max(1, desc.width | 0);
    this.#height = Math.max(1, desc.height | 0);
    this.#format = desc.format ?? 'rgba8unorm';
    this.#mipLevels = Math.max(1, desc.mipLevels ?? 1);
    this.#sampleCount = desc.sampleCount ?? 1;
    this.#usage = Array.isArray(desc.usage)
      ? [...new Set(desc.usage)]
      : ['sampler', 'color-target'];
  }

  get id() {
    return this.#id;
  }
  get label() {
    return this.#label;
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get mipLevels() {
    return this.#mipLevels;
  }
  get sampleCount() {
    return this.#sampleCount;
  }
  get format() {
    return this.#format;
  }
  // Usage as string array + numeric mapper
  get usage(): readonly TextureUsage[] {
    return Object.freeze(this.#usage.slice());
  }
  get isDepthFormat(): boolean {
    return this.#format.startsWith('depth');
  }
  get hash(): string {
    const key = {
      label: this.#label,
      width: this.#width,
      height: this.#height,
      mipLevels: this.#mipLevels,
      sampleCount: this.#sampleCount,
      format: this.#format,
      usage: this.#usage,
      kind: this._kind(),
      ext: this._extraHashKey(),
    };
    return sha(JSON.stringify(key), 'hex');
  }
  // Subclass-provided getters (place before setters to satisfy ordering)
  // Must be provided by subclasses (getters before protected methods)
  get layerCount(): number {
    return 1;
  }
  get depth(): number {
    return 1;
  }

  set label(v: string) {
    if (this.#label === v) return;
    this.#label = v;
    this.markAsDirty();
  }
  set width(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#width === nv) return;
    this.#width = nv;
    this.#mipLevels = Math.min(
      this.#mipLevels,
      TextureBase.computeMaxMipLevels(this.#width, this.#height),
    );
    this.markAsDirty();
  }
  set height(v: number) {
    const nv = Math.max(1, v | 0);
    if (this.#height === nv) return;
    this.#height = nv;
    this.#mipLevels = Math.min(
      this.#mipLevels,
      TextureBase.computeMaxMipLevels(this.#width, this.#height),
    );
    this.markAsDirty();
  }
  set mipLevels(v: number) {
    const nv = Math.max(1, v | 0);
    const maxAllowed = TextureBase.computeMaxMipLevels(
      this.#width,
      this.#height,
    );
    const clamped = Math.min(nv, maxAllowed);
    if (this.#mipLevels === clamped) return;
    this.#mipLevels = clamped;
    this.markAsDirty();
  }
  set sampleCount(v: SampleCount) {
    const allowed: SampleCount[] = [1, 2, 4, 8];
    const nv = allowed.includes(v) ? v : 1;
    if (this.#sampleCount === nv) return;
    this.#sampleCount = nv;
    this.markAsDirty();
  }
  set format(v: TextureFormat) {
    if (this.#format === v) return;
    this.#format = v;
    this.markAsDirty();
  }
  set usage(v: TextureUsage[]) {
    const nv = [...new Set(v)];
    // Shallow equality check
    if (
      nv.length === this.#usage.length &&
      nv.every((u, i) => u === this.#usage[i])
    )
      return;
    this.#usage = nv;
    this.markAsDirty();
  }

  addUsage(flag: TextureUsage): this {
    if (!this.#usage.includes(flag)) {
      this.#usage.push(flag);
      this.markAsDirty();
    }
    return this;
  }

  removeUsage(flag: TextureUsage): this {
    const before = this.#usage.length;
    this.#usage = this.#usage.filter((u) => u !== flag);
    if (this.#usage.length !== before) this.markAsDirty();
    return this;
  }

  hasUsage(flag: TextureUsage): boolean {
    return this.#usage.includes(flag);
  }

  // Protected hooks: non-abstract before abstract to satisfy ordering
  protected _extraHashKey(): string | undefined {
    return undefined;
  }
  protected abstract _kind(): '2d' | 'cube' | '3d';
}
