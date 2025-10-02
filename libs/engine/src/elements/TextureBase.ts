import { DirtyState } from '@bunbox/utils';
import { sha } from 'bun';
import { SDL_GPUTextureUsageFlags } from '@bunbox/sdl3';

export type TextureFormat =
  | 'rgba8unorm'
  | 'bgra8unorm'
  | 'rgba16float'
  | 'r16float'
  | 'r8unorm'
  | 'rgba8uint'
  | 'rgba8snorm'
  | 'rgba32float'
  | 'depth24plus'
  | 'depth24plus-stencil8'
  | 'depth32float'
  | (string & {});

export type SampleCount = 1 | 2 | 4 | 8 | 16;

// Stringly-typed usage for clarity across APIs
export type TextureUsage =
  | 'sampler'
  | 'color-target'
  | 'depth-stencil-target'
  | 'graphics-storage-read'
  | 'compute-storage-read'
  | 'compute-storage-write'
  | 'compute-storage-rw'
  | 'copy-src'
  | 'copy-dst'
  | 'generate-mips';

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
   * @default ['sampler', 'copy-dst']
   */
  usage?: TextureUsage[];
}

export abstract class TextureBase extends DirtyState {
  // 1. Static/private vars already declared in imports
  // 2. Static methods
  static computeMaxMipLevels(w: number, h: number, d: number = 1): number {
    const maxDim = Math.max(1, w | 0, h | 0, d | 0);
    return Math.floor(Math.log2(maxDim)) + 1;
  }

  // 1. Private instance fields
  #label: string = '';
  #width: number = 1;
  #height: number = 1;
  #mipLevels: number = 1;
  #sampleCount: SampleCount = 1;
  #format: TextureFormat = 'rgba8unorm';
  #usage: TextureUsage[] = ['sampler', 'copy-dst'];

  // 3. Constructor
  protected constructor(desc: TextureBaseDescriptor) {
    super();
    this.#label = desc.label ?? '';
    this.#width = Math.max(1, desc.width | 0);
    this.#height = Math.max(1, desc.height | 0);
    this.#format = desc.format ?? 'rgba8unorm';
    this.#mipLevels = Math.max(1, desc.mipLevels ?? 1);
    this.#sampleCount = desc.sampleCount ?? 1;
    this.#usage = Array.isArray(desc.usage)
      ? [...new Set(desc.usage)]
      : ['sampler', 'copy-dst'];
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
  // Numeric bitmask for backend (SDL)
  get usageIndex(): number {
    let mask = 0 >>> 0;
    for (const u of this.#usage) mask |= mapUsageToSDL(u);
    return mask >>> 0;
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
    const allowed: SampleCount[] = [1, 2, 4, 8, 16];
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

  bytesPerPixel(): number {
    switch (this.#format) {
      case 'r8unorm':
        return 1;
      case 'rgba8unorm':
      case 'bgra8unorm':
        return 4;
      case 'r16float':
        return 2;
      case 'rgba16float':
        return 8;
      case 'rgba32float':
        return 16; // heuristic
      case 'depth24plus':
      case 'depth24plus-stencil8':
      case 'depth32float':
        return 4;
      default:
        return 4;
    }
  }

  approximateByteSize(): number {
    const bpp = this.bytesPerPixel();
    let total = 0;
    for (let i = 0; i < this.#mipLevels; i++) {
      const sz = this.mipSize(i);
      total += sz.width * sz.height * sz.depthOrLayers * bpp;
    }
    if (this.#sampleCount > 1 && this.hasUsage('color-target')) {
      total *= this.#sampleCount;
    }
    return total >>> 0;
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
        this._kind() === '3d' ? this.depth >> level : this.layerCount,
    };
  }

  // Protected hooks: non-abstract before abstract to satisfy ordering
  protected _extraHashKey(): unknown {
    return undefined;
  }
  protected abstract _kind(): '2d' | 'cube' | '3d';
}

// Internal map from string usage to SDL flags bit
function mapUsageToSDL(u: TextureUsage): number {
  // Alias local constants to avoid error-typed access from imported enums in some TS setups
  const U = SDL_GPUTextureUsageFlags as unknown as Record<string, number>;
  switch (u) {
    case 'sampler':
      return (U.SDL_GPU_TEXTUREUSAGE_SAMPLER ?? 0) >>> 0;
    case 'color-target':
      return (U.SDL_GPU_TEXTUREUSAGE_COLOR_TARGET ?? 0) >>> 0;
    case 'depth-stencil-target':
      return (U.SDL_GPU_TEXTUREUSAGE_DEPTH_STENCIL_TARGET ?? 0) >>> 0;
    case 'graphics-storage-read':
      return (U.SDL_GPU_TEXTUREUSAGE_GRAPHICS_STORAGE_READ ?? 0) >>> 0;
    case 'compute-storage-read':
      return (U.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_READ ?? 0) >>> 0;
    case 'compute-storage-write':
      return (U.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_WRITE ?? 0) >>> 0;
    case 'compute-storage-rw': {
      const rw =
        U.SDL_GPU_TEXTUREUSAGE_COMPUTE_STORAGE_SIMULTANEOUS_READ_WRITE ?? 0;
      return rw >>> 0;
    }
    case 'copy-src':
    case 'copy-dst':
    case 'generate-mips':
    default:
      return 0;
  }
}
